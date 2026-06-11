import { c as createServerRpc } from "./createServerRpc-pXnG1tzv.js";
import { c as createServerFn, d as getRequest } from "./server-B6Ie_dUR.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { r as requireSupabaseAuth } from "./auth-middleware-23Q58zyY.js";
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
function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missing = [
      ...!SUPABASE_URL ? ["SUPABASE_URL"] : [],
      ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Connect Supabase in Lovable Cloud.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
let _supabaseAdmin;
const supabaseAdmin = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return Reflect.get(_supabaseAdmin, prop, receiver);
  }
});
const UNIVERSITY_EMAIL_PATTERN = /^[A-Z]\d{4}\/\d{4}@university\.edu$/i;
const lookupEmailByUserId_createServerFn_handler = createServerRpc({
  id: "8f6a8c494cd9e14efe4d171d85e8a478fd0120f3206053cd4013baac54d041d3",
  name: "lookupEmailByUserId",
  filename: "src/lib/auth.functions.ts"
}, (opts) => lookupEmailByUserId.__executeServer(opts));
const lookupEmailByUserId = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  user_id: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/)
}).parse(input)).handler(lookupEmailByUserId_createServerFn_handler, async ({
  data
}) => {
  const {
    data: profile
  } = await supabaseAdmin.from("profiles").select("email, security_phrase").eq("user_id", data.user_id).maybeSingle();
  return {
    email: profile?.email ?? null,
    security_phrase: profile?.security_phrase ?? null
  };
});
const recordLogin_createServerFn_handler = createServerRpc({
  id: "34a7bc0b724d610201a611ca7dd72b156651ac7040d24ed6506f7f6506a835b4",
  name: "recordLogin",
  filename: "src/lib/auth.functions.ts"
}, (opts) => recordLogin.__executeServer(opts));
const recordLogin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(recordLogin_createServerFn_handler, async ({
  context
}) => {
  const req = getRequest();
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? null;
  await supabaseAdmin.from("login_logs").insert({
    user_id: context.userId,
    ip_address: ip
  });
  return {
    ok: true
  };
});
const checkRegistrationDuplicates_createServerFn_handler = createServerRpc({
  id: "33108bbc8c2794894c4ef0455b42ee3a6909bb14a4e6241ccbc67246079055fe",
  name: "checkRegistrationDuplicates",
  filename: "src/lib/auth.functions.ts"
}, (opts) => checkRegistrationDuplicates.__executeServer(opts));
const checkRegistrationDuplicates = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  user_id: z.string().trim().min(3).max(40),
  email: z.string().trim().toLowerCase().max(255).regex(UNIVERSITY_EMAIL_PATTERN),
  matric_number: z.string().trim().toUpperCase().max(10)
}).parse(input)).handler(checkRegistrationDuplicates_createServerFn_handler, async ({
  data
}) => {
  const {
    data: userIdCheck
  } = await supabaseAdmin.from("profiles").select("user_id").eq("user_id", data.user_id).maybeSingle();
  const {
    data: matricCheck
  } = await supabaseAdmin.from("profiles").select("matric_number").eq("matric_number", data.matric_number).maybeSingle();
  const {
    data: emailCheck
  } = await supabaseAdmin.from("profiles").select("email").ilike("email", data.email).maybeSingle();
  return {
    userIdExists: !!userIdCheck,
    emailExists: !!emailCheck,
    matricExists: !!matricCheck
  };
});
export {
  checkRegistrationDuplicates_createServerFn_handler,
  lookupEmailByUserId_createServerFn_handler,
  recordLogin_createServerFn_handler
};
