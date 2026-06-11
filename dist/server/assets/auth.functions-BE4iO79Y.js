import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { c as cn } from "./utils-H80jjgLf.js";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { c as createSsrRpc } from "./router-BXXowSLB.js";
import { c as createServerFn } from "./server-B6Ie_dUR.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-23Q58zyY.js";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive.Root.displayName;
function AuthLayout({ title, subtitle, children, footer }) {
  return /* @__PURE__ */ jsxs("div", { className: "grid min-h-screen lg:grid-cols-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "hidden lg:flex flex-col justify-between p-10 text-primary-foreground", style: { background: "var(--gradient-hero)" }, children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "h-6 w-6" }),
        " SecureAttend"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold", children: "A secure way to track campus attendance." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-md text-primary-foreground/80", children: "Built for universities. Trusted by faculty. Loved by students." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-primary-foreground/70", children: "© SecureAttend University" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-6 md:p-10", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: subtitle })
      ] }),
      children,
      footer && /* @__PURE__ */ jsx("div", { className: "mt-6 text-center text-sm text-muted-foreground", children: footer })
    ] }) })
  ] });
}
const UNIVERSITY_EMAIL_PATTERN = /^[A-Z]\d{4}\/\d{4}@university\.edu$/i;
const lookupEmailByUserId = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  user_id: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/)
}).parse(input)).handler(createSsrRpc("8f6a8c494cd9e14efe4d171d85e8a478fd0120f3206053cd4013baac54d041d3"));
const recordLogin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("34a7bc0b724d610201a611ca7dd72b156651ac7040d24ed6506f7f6506a835b4"));
const checkRegistrationDuplicates = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  user_id: z.string().trim().min(3).max(40),
  email: z.string().trim().toLowerCase().max(255).regex(UNIVERSITY_EMAIL_PATTERN),
  matric_number: z.string().trim().toUpperCase().max(10)
}).parse(input)).handler(createSsrRpc("33108bbc8c2794894c4ef0455b42ee3a6909bb14a4e6241ccbc67246079055fe"));
export {
  AuthLayout as A,
  Label as L,
  checkRegistrationDuplicates as c,
  lookupEmailByUserId as l,
  recordLogin as r
};
