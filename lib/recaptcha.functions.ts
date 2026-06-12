import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type RecaptchaResponse = {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
};

export const verifyRecaptcha = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ token: z.string().min(1).max(4000) }).parse(input))
  .handler(async ({ data }) => {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      return { success: false, error: "CAPTCHA secret is not configured" };
    }

    const params = new URLSearchParams({
      secret,
      response: data.token,
    });

    try {
      const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const json = (await res.json()) as RecaptchaResponse;

      return {
        success: !!json.success,
        errorCodes: json["error-codes"] ?? [],
        hostname: json.hostname ?? null,
      };
    } catch {
      return { success: false, error: "CAPTCHA verification failed" };
    }
  });
