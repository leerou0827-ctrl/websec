// DEPLOYMENT SECURITY CONFIGURATION
// This file configures HTTPS enforcement, security headers, and session
// security for the application.
//
// Auth mechanism: Supabase Auth with localStorage + Bearer tokens (no cookies).
// Cookie settings are therefore not applicable for session management; instead,
// security is enforced via:
//  1. HTTPS redirect middleware (HTTP -> 308 HTTPS)
//  2. HSTS header (max-age=31536000, includeSubDomains, preload)
//  3. Content-Type-Options, Frame-Options, Referrer-Policy headers
//  4. Content-Security-Policy upgrade-insecure-requests in HTML meta
//  5. Server-side JWT validation on every protected server function
//
import { createCsrfMiddleware, createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { attachSupabaseAuth } from "./integrations/supabase/auth-attacher";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

/**
 * HTTPS redirect middleware.
 * Checks if the incoming request was made over HTTP and returns a 301/308
 * redirect to the HTTPS equivalent. Headers examined (in order):
 * 1. Cloudflare: cf-visitor {"scheme":"http"}
 * 2. Standard proxy: x-forwarded-proto
 * 3. Request URL protocol as fallback.
 */
const httpsRedirectMiddleware = createMiddleware().server(async ({ next }) => {
  const req = getRequest();
  const url = new URL(req.url);

  // Determine if the request arrived over HTTP
  const cfVisitor = req.headers.get("cf-visitor");
  const forwardedProto = req.headers.get("x-forwarded-proto");

  let isHttp = false;
  if (cfVisitor) {
    try {
      const parsed = JSON.parse(cfVisitor);
      if (parsed.scheme === "http") isHttp = true;
    } catch {
      // ignore malformed header
    }
  } else if (forwardedProto) {
    if (forwardedProto === "http") isHttp = true;
  } else if (url.protocol === "http:") {
    isHttp = true;
  }

  if (isHttp) {
    const httpsUrl = new URL(url);
    httpsUrl.protocol = "https:";
    // Preserve the original host if forwarded
    const forwardedHost = req.headers.get("x-forwarded-host");
    if (forwardedHost) httpsUrl.host = forwardedHost;

    return new Response(null, {
      status: 308, // Permanent Redirect
      headers: {
        Location: httpsUrl.toString(),
      },
    });
  }

  return next();
});

/**
 * Security headers middleware.
 * Adds HSTS, frame-options, content-type-options, and referrer-policy
 * to every response for defense-in-depth HTTPS enforcement.
 */
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();

  // Only attach headers to Response objects
  if (result instanceof Response) {
    const headers = new Headers(result.headers);
    // HSTS: enforce HTTPS for 1 year including subdomains
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    // Prevent MIME sniffing
    headers.set("X-Content-Type-Options", "nosniff");
    // Prevent clickjacking
    headers.set("X-Frame-Options", "DENY");
    // Restrict referrer leakage
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers,
    });
  }

  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    csrfMiddleware,
    httpsRedirectMiddleware,
    securityHeadersMiddleware,
    errorMiddleware,
  ],
  functionMiddleware: [attachSupabaseAuth],
}));
