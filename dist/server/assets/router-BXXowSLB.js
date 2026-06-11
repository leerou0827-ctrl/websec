import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from "react";
import { s as supabase } from "./client-CXsJS44i.js";
import { z } from "zod";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "./server-B6Ie_dUR.js";
import { r as requireSupabaseAuth } from "./auth-middleware-23Q58zyY.js";
const ThemeContext = createContext(void 0);
const STORAGE_KEY = "secureattend.theme";
function applyTheme(t) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  root.style.colorScheme = t;
}
function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  useEffect(() => {
    let initial = "light";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") initial = stored;
      else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) initial = "dark";
    } catch {
    }
    setThemeState(initial);
    applyTheme(initial);
  }, []);
  const setTheme = (t) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
    }
  };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, toggle, setTheme }, children });
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
const themeBootstrapScript = `(function(){try{var k='${STORAGE_KEY}';var t=localStorage.getItem(k);if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var r=document.documentElement;if(t==='dark')r.classList.add('dark');r.style.colorScheme=t;}catch(e){}})();`;
const appCss = "/assets/styles-C7VCtvoT.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$9 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Secure Attendance System" },
      { name: "description", content: "Secure Attendance System for University" },
      { name: "author", content: "Lovable" },
      // HTTPS-only content security: instruct browser to treat mixed content as active
      { "httpEquiv": "Content-Security-Policy", content: "upgrade-insecure-requests" },
      // Referrer policy fallback (primary enforcement is HTTP header)
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("script", { dangerouslySetInnerHTML: { __html: themeBootstrapScript } }),
      /* @__PURE__ */ jsx(HeadContent, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$9.useRouteContext();
  const router2 = useRouter();
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(() => {
      router2.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router2, queryClient]);
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }) });
}
const $$splitComponentImporter$8 = () => import("./register-DZxt6rTW.js");
const Route$8 = createFileRoute("/register")({
  head: () => ({
    meta: [{
      title: "Register - SecureAttend"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
const MATRIC_NUMBER_PATTERN = /^([A-Z])(\d{4})\/(\d{4})$/;
const UNIVERSITY_EMAIL_PATTERN = /^[A-Z]\d{4}\/\d{4}@university\.edu$/i;
const getMatricNumberError = (value) => {
  const matricNumber = value.trim().toUpperCase();
  if (!matricNumber) return "Matric number is required";
  const match = matricNumber.match(MATRIC_NUMBER_PATTERN);
  if (!match) return "Matric number must use this format: U2025/1234.";
  const year = Number(match[2]);
  if (year < 2020) return "Enrollment year cannot be earlier than 2020.";
  if (year > CURRENT_YEAR) {
    return `Enrollment year cannot be later than ${CURRENT_YEAR}.`;
  }
  return null;
};
const getPasswordChecks = (password) => [{
  label: "At least 8 characters",
  passed: password.length >= 8
}, {
  label: "Contains an uppercase letter",
  passed: /[A-Z]/.test(password)
}, {
  label: "Contains a lowercase letter",
  passed: /[a-z]/.test(password)
}, {
  label: "Contains a special character",
  passed: /[^A-Za-z0-9]/.test(password)
}];
const getPasswordError = (password) => {
  if (!password) return "Password is required";
  const failedCheck = getPasswordChecks(password).find((check) => !check.passed);
  return failedCheck ? `Password must have: ${failedCheck.label.toLowerCase()}.` : null;
};
z.object({
  user_id: z.string().trim().min(3, "User ID must be at least 3 characters").max(40, "User ID is too long").regex(/^[A-Za-z0-9_-]+$/, "User ID may only contain letters, numbers, _ and -"),
  full_name: z.string().trim().min(2, "Full name is required").max(100, "Full name is too long").regex(/^[A-Za-z .'-]+$/, "Full name contains invalid characters"),
  matric_number: z.string().trim().toUpperCase().superRefine((value, ctx) => {
    const error = getMatricNumberError(value);
    if (error) ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error
    });
  }),
  email: z.string().trim().min(1, "University email is required").max(255, "University email is too long").regex(UNIVERSITY_EMAIL_PATTERN, "Email must be your matric number followed by @university.edu, e.g. U2025/1234@university.edu."),
  password: z.string().max(72, "Password is too long").superRefine((value, ctx) => {
    const error = getPasswordError(value);
    if (error) ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error
    });
  }),
  confirm_password: z.string(),
  security_phrase: z.string().trim().min(4, "Security phrase must be at least 4 characters").max(100, "Security phrase is too long")
}).superRefine((value, ctx) => {
  if (value.matric_number && value.email) {
    const expectedEmail = `${value.matric_number}@university.edu`;
    if (value.email.toLowerCase() !== expectedEmail.toLowerCase()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Email must match your matric number, e.g. U2025/1234@university.edu."
      });
    }
  }
  if (!value.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirm_password"],
      message: "Please confirm your password."
    });
  } else if (value.password !== value.confirm_password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirm_password"],
      message: "Passwords do not match."
    });
  }
});
const $$splitComponentImporter$7 = () => import("./login-D-9WdtDu.js");
const Route$7 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in — SecureAttend"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./_student-zkOufGtj.js");
const Route$6 = createFileRoute("/_student")({
  beforeLoad: async ({
    location
  }) => {
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./_admin-BadBIOa-.js");
const Route$5 = createFileRoute("/_admin")({
  beforeLoad: async ({
    location
  }) => {
    const {
      data
    } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
    const {
      data: role
    } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle();
    if (!role) {
      throw redirect({
        to: "/dashboard"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./index-DFHgBBsJ.js");
const Route$4 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "SecureAttend — Modern University Attendance System"
    }, {
      name: "description",
      content: "Secure, fast, and reliable attendance tracking for universities. Mark, monitor, and manage attendance with confidence."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getAttendanceHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f9ed4aa88018a21073a262800373d7915ffe6fbed5474169cb7eec0124c56fbe"));
const $$splitComponentImporter$3 = () => import("./_student.history-P07a_10k.js");
const Route$3 = createFileRoute("/_student/history")({
  head: () => ({
    meta: [{
      title: "Attendance History — SecureAttend"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_student.dashboard-DYeNiQb-.js");
const Route$2 = createFileRoute("/_student/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — SecureAttend"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./_student.attendance-BwYp9EAH.js");
const Route$1 = createFileRoute("/_student/attendance")({
  head: () => ({
    meta: [{
      title: "Mark Attendance — SecureAttend"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./_admin.admin-83Cy0FC2.js");
const Route = createFileRoute("/_admin/admin")({
  head: () => ({
    meta: [{
      title: "Admin Dashboard — SecureAttend"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const RegisterRoute = Route$8.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$9
});
const LoginRoute = Route$7.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$9
});
const StudentRoute = Route$6.update({
  id: "/_student",
  getParentRoute: () => Route$9
});
const AdminRoute = Route$5.update({
  id: "/_admin",
  getParentRoute: () => Route$9
});
const IndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$9
});
const StudentHistoryRoute = Route$3.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => StudentRoute
});
const StudentDashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => StudentRoute
});
const StudentAttendanceRoute = Route$1.update({
  id: "/attendance",
  path: "/attendance",
  getParentRoute: () => StudentRoute
});
const AdminAdminRoute = Route.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AdminRoute
});
const AdminRouteChildren = {
  AdminAdminRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const StudentRouteChildren = {
  StudentAttendanceRoute,
  StudentDashboardRoute,
  StudentHistoryRoute
};
const StudentRouteWithChildren = StudentRoute._addFileChildren(StudentRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AdminRoute: AdminRouteWithChildren,
  StudentRoute: StudentRouteWithChildren,
  LoginRoute,
  RegisterRoute
};
const routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  createSsrRpc as c,
  getAttendanceHistory as g,
  router as r,
  useTheme as u
};
