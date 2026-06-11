import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Check, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { A as AuthLayout, L as Label, r as recordLogin, l as lookupEmailByUserId } from "./auth.functions-BE4iO79Y.js";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { c as cn } from "./utils-H80jjgLf.js";
import { s as supabase } from "./client-CXsJS44i.js";
import { c as createSsrRpc } from "./router-BXXowSLB.js";
import { c as createServerFn } from "./server-B6Ie_dUR.js";
import { z } from "zod";
import { toast } from "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "./auth-middleware-23Q58zyY.js";
import "@supabase/supabase-js";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(CheckboxPrimitive.Indicator, { className: cn("grid place-content-center text-current"), children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const verifyRecaptcha = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  token: z.string().min(1).max(4e3)
}).parse(input)).handler(createSsrRpc("584f790034457d60cd40b01d7c6a82c968e8319676b11e4eafea0394c71e8200"));
const RECAPTCHA_SITE_KEY = "6Lfv1wotAAAAAObmvgeTEFH5wZ_W9ZHhZSSLUmli";
function resolveRecaptchaComponent(module) {
  const defaultExport = module.default;
  if (defaultExport && typeof defaultExport === "object" && "default" in defaultExport) {
    return defaultExport.default;
  }
  return defaultExport ?? module;
}
function getCaptchaErrorMessage(captcha) {
  if (captcha.error) return captcha.error;
  if (!captcha.errorCodes?.length) return "CAPTCHA verification failed. Please try again.";
  return `CAPTCHA verification failed (${captcha.errorCodes.join(", ")}). Please refresh the page and try again.`;
}
function LoginPage() {
  const navigate = useNavigate();
  const lookup = useServerFn(lookupEmailByUserId);
  const logLogin = useServerFn(recordLogin);
  const verifyCaptcha = useServerFn(verifyRecaptcha);
  const [step, setStep] = useState("identify");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState(null);
  const [securityPhrase, setSecurityPhrase] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phraseConfirmed, setPhraseConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [RecaptchaComponent, setRecaptchaComponent] = useState(null);
  const captchaRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    void import("react-google-recaptcha").then((module) => {
      if (mounted) setRecaptchaComponent(() => resolveRecaptchaComponent(module));
    }).catch(() => {
      if (mounted) {
        setError("CAPTCHA could not load. Please refresh the page and try again.");
      }
    });
    return () => {
      mounted = false;
    };
  }, []);
  function resetCaptcha() {
    captchaRef.current?.reset();
    setCaptchaToken(null);
  }
  function resetToStart() {
    setStep("identify");
    setEmail(null);
    setSecurityPhrase(null);
    setPhraseConfirmed(false);
    setShowPassword(false);
    setError(null);
    resetCaptcha();
  }
  async function onIdentify(e) {
    e.preventDefault();
    setError(null);
    const trimmed = userId.trim();
    if (!trimmed) {
      setError("Enter your User ID");
      return;
    }
    const token = captchaToken ?? captchaRef.current?.getValue() ?? null;
    if (!token) {
      setError("Please complete the CAPTCHA to continue");
      return;
    }
    setLoading(true);
    try {
      const captcha = await verifyCaptcha({
        data: {
          token
        }
      });
      if (!captcha.success) {
        setError(getCaptchaErrorMessage(captcha));
        resetCaptcha();
        return;
      }
      setCaptchaToken(null);
      let res;
      try {
        res = await lookup({
          data: {
            user_id: trimmed
          }
        });
      } catch (err) {
        console.error("数据库查找报错啦：", err);
        setError("Invalid credentials");
        resetCaptcha();
        return;
      }
      if (!res.email || !res.security_phrase) {
        setEmail(null);
        setSecurityPhrase(null);
      } else {
        setEmail(res.email);
        setSecurityPhrase(res.security_phrase);
      }
      setPhraseConfirmed(false);
      setStep("verify");
    } finally {
      setLoading(false);
    }
  }
  async function onVerify(e) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    if (!password) {
      setError("Enter your password");
      return;
    }
    if (!phraseConfirmed) {
      setError("Confirm your security phrase before signing in");
      return;
    }
    if (!email) {
      setError("Invalid credentials");
      return;
    }
    setLoading(true);
    try {
      const {
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        setError("Invalid credentials");
        return;
      }
      try {
        await logLogin({});
      } catch {
      }
      toast.success("Signed in");
      navigate({
        to: "/dashboard"
      });
    } finally {
      setLoading(false);
    }
  }
  if (step === "verify") {
    return /* @__PURE__ */ jsxs(AuthLayout, { title: "Verify and sign in", subtitle: "Confirm your security phrase, then enter your password.", footer: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Not you?",
      " ",
      /* @__PURE__ */ jsx("button", { type: "button", onClick: resetToStart, className: "text-primary font-medium", children: "Start over" })
    ] }), children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-5 rounded-lg border bg-muted/40 p-4", role: "region", "aria-label": "Your security phrase", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-primary" }),
          "Your security phrase"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-semibold text-foreground break-words", children: securityPhrase ?? "—" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Only continue if this matches the phrase you set during registration. If it doesn't match, stop and report it." })
      ] }),
      /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: onVerify, noValidate: true, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "User ID" }),
          /* @__PURE__ */ jsx(Input, { value: userId, disabled: true, readOnly: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Input, { id: "password", name: "password", type: showPassword ? "text" : "password", autoComplete: "current-password", autoFocus: true, className: "pr-10" }),
            /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground", "aria-label": showPassword ? "Hide password" : "Show password", title: showPassword ? "Hide password" : "Show password", onClick: () => setShowPassword((visible) => !visible), children: showPassword ? /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4", "aria-hidden": "true" }) : /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4", "aria-hidden": "true" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(Checkbox, { id: "phrase_confirmed", checked: phraseConfirmed, onCheckedChange: (v) => setPhraseConfirmed(v === true) }),
          /* @__PURE__ */ jsx(Label, { htmlFor: "phrase_confirmed", className: "text-sm font-normal leading-snug", children: "I confirm this security phrase matches the one I set during registration" })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", role: "alert", children: error }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: resetToStart, disabled: loading, children: "Back" }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Signing in…" : "Sign in" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx(AuthLayout, { title: "Welcome back", subtitle: "Sign in to your SecureAttend account", footer: /* @__PURE__ */ jsxs(Fragment, { children: [
    "Don't have an account?",
    " ",
    /* @__PURE__ */ jsx(Link, { to: "/register", className: "text-primary font-medium", children: "Create one" })
  ] }), children: /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit: onIdentify, noValidate: true, children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "user_id", children: "User ID" }),
      /* @__PURE__ */ jsx(Input, { id: "user_id", name: "user_id", placeholder: "jdoe", autoComplete: "username", value: userId, onChange: (e) => setUserId(e.target.value), autoFocus: true })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-center sm:justify-start overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "origin-top-left scale-90 sm:scale-100 transform-gpu", children: RecaptchaComponent ? /* @__PURE__ */ jsx(RecaptchaComponent, { ref: captchaRef, sitekey: RECAPTCHA_SITE_KEY, onChange: (token) => {
      setCaptchaToken(token);
      if (token) setError(null);
    }, onExpired: () => {
      setCaptchaToken(null);
      setError("CAPTCHA expired. Please verify again.");
    }, onErrored: () => {
      setCaptchaToken(null);
      setError("CAPTCHA could not load. Please refresh the page and try again.");
    } }) : /* @__PURE__ */ jsx("div", { className: "flex h-[78px] w-[304px] items-center justify-center rounded border bg-muted/30 text-sm text-muted-foreground", children: "Loading CAPTCHA..." }) }) }),
    captchaToken && /* @__PURE__ */ jsx("p", { className: "text-sm text-green-600", role: "status", children: "CAPTCHA completed. Press Next to verify it." }),
    error && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", role: "alert", children: error }),
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading || !captchaToken, children: loading ? "Looking up…" : "Next" })
  ] }) });
}
export {
  LoginPage as component
};
