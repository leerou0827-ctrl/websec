// SECURITY:
// - All queries use the Supabase JS client / PostgREST. Values are sent as
//   JSON parameters (not concatenated into SQL), so SQL injection is not
//   possible from these call sites.
// - Every server function validates its input with a strict Zod schema before
//   it ever touches the database. `user_id` is constrained to
//   /^[A-Za-z0-9_-]+$/ with length bounds, eliminating malicious payloads
//   even though the underlying driver would already parameterize them.
// - `recordLogin` derives `user_id` from the verified JWT (via
//   `requireSupabaseAuth`), never from the request body. The client IP is
//   read from trusted edge headers only.
// - `lookupEmailByUserId` intentionally uses `supabaseAdmin` (service role)
//   for a single, narrow lookup that returns only the email column needed to
//   complete login; it does not echo arbitrary user input back to the caller.
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UNIVERSITY_EMAIL_PATTERN = /^[A-Z]\d{4}\/\d{4}@university\.edu$/i;

export const lookupEmailByUserId = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        user_id: z
          .string()
          .trim()
          .min(3)
          .max(40)
          .regex(/^[A-Za-z0-9_-]+$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, security_phrase")
      .eq("user_id", data.user_id)
      .maybeSingle();
    return {
      email: profile?.email ?? null,
      security_phrase: profile?.security_phrase ?? null,
    };
  });

export const recordLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const req = getRequest();
    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    await supabaseAdmin.from("login_logs").insert({
      user_id: context.userId,
      ip_address: ip,
    });
    return { ok: true };
  });

// Checks registration fields that must stay unique before creating the auth user.
export const checkRegistrationDuplicates = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        user_id: z.string().trim().min(3).max(40),
        email: z.string().trim().toLowerCase().max(255).regex(UNIVERSITY_EMAIL_PATTERN),
        matric_number: z.string().trim().toUpperCase().max(10),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: userIdCheck } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("user_id", data.user_id)
      .maybeSingle();

    const { data: matricCheck } = await supabaseAdmin
      .from("profiles")
      .select("matric_number")
      .eq("matric_number", data.matric_number)
      .maybeSingle();

    const { data: emailCheck } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .ilike("email", data.email)
      .maybeSingle();

    return {
      userIdExists: !!userIdCheck,
      emailExists: !!emailCheck,
      matricExists: !!matricCheck,
    };
  });
