import { a as createMiddleware, b as createCsrfMiddleware, d as getRequest } from "./server-B6Ie_dUR.js";
import { s as supabase } from "./client-CXsJS44i.js";
import { r as renderErrorPage } from "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
    }
  }
}
var createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(deduped, options.serializationAdapters);
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }
);
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
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
});
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn"
});
const httpsRedirectMiddleware = createMiddleware().server(async ({ next }) => {
  const req = getRequest();
  const url = new URL(req.url);
  const cfVisitor = req.headers.get("cf-visitor");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  let isHttp = false;
  if (cfVisitor) {
    try {
      const parsed = JSON.parse(cfVisitor);
      if (parsed.scheme === "http") isHttp = true;
    } catch {
    }
  } else if (forwardedProto) {
    if (forwardedProto === "http") isHttp = true;
  } else if (url.protocol === "http:") {
    isHttp = true;
  }
  if (isHttp) {
    const httpsUrl = new URL(url);
    httpsUrl.protocol = "https:";
    const forwardedHost = req.headers.get("x-forwarded-host");
    if (forwardedHost) httpsUrl.host = forwardedHost;
    return new Response(null, {
      status: 308,
      // Permanent Redirect
      headers: {
        Location: httpsUrl.toString()
      }
    });
  }
  return next();
});
const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await next();
  if (result instanceof Response) {
    const headers = new Headers(result.headers);
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers
    });
  }
  return result;
});
const startInstance = createStart(() => ({
  requestMiddleware: [
    csrfMiddleware,
    httpsRedirectMiddleware,
    securityHeadersMiddleware,
    errorMiddleware
  ],
  functionMiddleware: [attachSupabaseAuth]
}));
export {
  startInstance
};
