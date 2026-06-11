import { c as createServerRpc } from "./createServerRpc-pXnG1tzv.js";
import { c as createServerFn } from "./server-B6Ie_dUR.js";
import { z } from "zod";
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
const verifyRecaptcha_createServerFn_handler = createServerRpc({
  id: "584f790034457d60cd40b01d7c6a82c968e8319676b11e4eafea0394c71e8200",
  name: "verifyRecaptcha",
  filename: "src/lib/recaptcha.functions.ts"
}, (opts) => verifyRecaptcha.__executeServer(opts));
const verifyRecaptcha = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  token: z.string().min(1).max(4e3)
}).parse(input)).handler(verifyRecaptcha_createServerFn_handler, async ({
  data
}) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    return {
      success: false,
      error: "CAPTCHA secret is not configured"
    };
  }
  const params = new URLSearchParams({
    secret,
    response: data.token
  });
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });
    const json = await res.json();
    return {
      success: !!json.success,
      errorCodes: json["error-codes"] ?? [],
      hostname: json.hostname ?? null
    };
  } catch {
    return {
      success: false,
      error: "CAPTCHA verification failed"
    };
  }
});
export {
  verifyRecaptcha_createServerFn_handler
};
