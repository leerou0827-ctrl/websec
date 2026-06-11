import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight, Fingerprint, Clock, BarChart3, GraduationCap } from "lucide-react";
import { B as Button } from "./button-BC9oXVxV.js";
import { T as ThemeToggle } from "./ThemeToggle-p3LkvBkQ.js";
import "react";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./router-BXXowSLB.js";
import "@tanstack/react-query";
import "./client-CXsJS44i.js";
import "@supabase/supabase-js";
import "zod";
import "./server-B6Ie_dUR.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "./auth-middleware-23Q58zyY.js";
function SiteHeader() {
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex h-16 items-center justify-between px-4", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2 font-semibold text-foreground", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "SecureAttend" })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", activeOptions: { exact: true }, activeProps: { className: "text-foreground font-medium" }, children: "Home" }),
      /* @__PURE__ */ jsx("a", { href: "/#features", children: "Features" }),
      /* @__PURE__ */ jsx("a", { href: "/#how", children: "How it works" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 sm:gap-2", children: [
      /* @__PURE__ */ jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", asChild: true, className: "hidden sm:inline-flex", children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Sign in" }) }),
      /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", className: "sm:size-default", children: /* @__PURE__ */ jsx(Link, { to: "/register", children: "Get started" }) })
    ] })
  ] }) });
}
function Landing() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -z-10", style: {
        background: "var(--gradient-subtle)"
      } }),
      /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-24 md:py-32", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5 text-primary" }),
          "Trusted by modern universities"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-bold tracking-tight text-foreground md:text-6xl", children: [
          "Secure attendance, ",
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "reimagined" }),
          " for campus."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg text-muted-foreground", children: "A modern attendance platform built for students and faculty. Verified check-ins, real-time history, and powerful admin insights — all in one place." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: [
          /* @__PURE__ */ jsx(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/register", children: [
            "Create account ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "ml-1 h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/login", children: "Sign in" }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "features", className: "container mx-auto px-4 py-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto mb-12 max-w-2xl text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground", children: "Everything you need" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground", children: "Designed for the rhythms of academic life." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-6 md:grid-cols-3", children: [{
        icon: Fingerprint,
        title: "Verified check-ins",
        desc: "Secure attendance marking with code or biometric verification."
      }, {
        icon: Clock,
        title: "Real-time tracking",
        desc: "See attendance status the moment it's recorded."
      }, {
        icon: BarChart3,
        title: "Insightful analytics",
        desc: "Dashboards for students and admins to track performance."
      }].map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-6", style: {
        boxShadow: "var(--shadow-card)"
      }, children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(f.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground", children: f.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: f.desc })
      ] }, f.title)) })
    ] }),
    /* @__PURE__ */ jsx("section", { id: "how", className: "border-t border-border bg-muted/40 py-20", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-12 max-w-2xl text-center", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground", children: "How it works" }) }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto grid max-w-4xl gap-6 md:grid-cols-3", children: [{
        n: "01",
        t: "Register",
        d: "Students and faculty sign up with university credentials."
      }, {
        n: "02",
        t: "Check in",
        d: "Mark attendance securely from anywhere on campus."
      }, {
        n: "03",
        t: "Review",
        d: "Track history and review reports in real time."
      }].map((s) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl bg-card p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-mono text-primary", children: s.n }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 font-semibold text-foreground", children: s.t }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: s.d })
      ] }, s.n)) })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border py-10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(GraduationCap, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " SecureAttend University System"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsx("a", { href: "#", children: "Privacy" }),
        /* @__PURE__ */ jsx("a", { href: "#", children: "Terms" }),
        /* @__PURE__ */ jsx("a", { href: "#", children: "Support" })
      ] })
    ] }) })
  ] });
}
export {
  Landing as component
};
