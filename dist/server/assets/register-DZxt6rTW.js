import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { A as AuthLayout, L as Label, c as checkRegistrationDuplicates } from "./auth.functions-BE4iO79Y.js";
import { s as supabase } from "./client-CXsJS44i.js";
import { toast } from "sonner";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "./router-BXXowSLB.js";
import "@tanstack/react-query";
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
import "@supabase/supabase-js";
const sanitize = (s) => s.trim().replace(/[<>]/g, "");
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
const schema = z.object({
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
const initialFormValues = {
  user_id: "",
  full_name: "",
  matric_number: "",
  email: "",
  password: "",
  confirm_password: "",
  security_phrase: ""
};
const cleanFormValues = (values) => ({
  user_id: sanitize(values.user_id),
  full_name: sanitize(values.full_name),
  matric_number: sanitize(values.matric_number).toUpperCase(),
  email: sanitize(values.email),
  password: values.password,
  confirm_password: values.confirm_password,
  security_phrase: sanitize(values.security_phrase)
});
const getFormErrors = (values) => {
  const parsed = schema.safeParse(cleanFormValues(values));
  const fieldErrors = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
  }
  return {
    parsed,
    fieldErrors
  };
};
const filterVisibleErrors = (fieldErrors, touched, values) => {
  const visibleErrors = {};
  for (const key of Object.keys(fieldErrors)) {
    if (touched[key] || values[key]) {
      visibleErrors[key] = fieldErrors[key];
    }
  }
  return visibleErrors;
};
function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkDuplicates = useServerFn(checkRegistrationDuplicates);
  function validateVisibleErrors(nextForm, nextTouched = touched) {
    const {
      fieldErrors
    } = getFormErrors(nextForm);
    setErrors(filterVisibleErrors(fieldErrors, nextTouched, nextForm));
  }
  function onFieldChange(e) {
    const name = e.currentTarget.name;
    let value = e.currentTarget.value;
    if (name === "matric_number") value = value.toUpperCase();
    const nextForm = {
      ...form,
      [name]: value
    };
    const nextTouched = {
      ...touched,
      [name]: true
    };
    setForm(nextForm);
    setTouched(nextTouched);
    validateVisibleErrors(nextForm, nextTouched);
  }
  function onFieldBlur(e) {
    const name = e.currentTarget.name;
    const nextTouched = {
      ...touched,
      [name]: true
    };
    setTouched(nextTouched);
    validateVisibleErrors(form, nextTouched);
  }
  async function onSubmit(e) {
    e.preventDefault();
    const allTouched = Object.keys(initialFormValues).reduce((nextTouched, key) => ({
      ...nextTouched,
      [key]: true
    }), {});
    setTouched(allTouched);
    const {
      parsed,
      fieldErrors
    } = getFormErrors(form);
    if (!parsed.success) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const data = parsed.data;
    try {
      const duplicateRes = await checkDuplicates({
        data: {
          user_id: data.user_id,
          email: data.email,
          matric_number: data.matric_number
        }
      });
      if (duplicateRes.userIdExists || duplicateRes.emailExists || duplicateRes.matricExists) {
        const duplicateErrors = {};
        if (duplicateRes.userIdExists) {
          duplicateErrors.user_id = "This User ID is already taken. Please choose another.";
        }
        if (duplicateRes.emailExists) {
          duplicateErrors.email = "This email has already been registered.";
        }
        if (duplicateRes.matricExists) {
          duplicateErrors.matric_number = "This matric number is already registered.";
        }
        setErrors(duplicateErrors);
        setLoading(false);
        return;
      }
    } catch (err) {
      toast.error("Failed to check registration details. Please try again.");
      setLoading(false);
      return;
    }
    const {
      error
    } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          user_id: data.user_id,
          full_name: data.full_name,
          matric_number: data.matric_number,
          security_phrase: data.security_phrase
        }
      }
    });
    setLoading(false);
    if (error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("already") || errorMessage.includes("registered")) {
        setErrors({
          email: "This email has already been registered."
        });
        return;
      }
      toast.error(error.message);
      return;
    }
    toast.success("Account created. Please check your email to confirm.");
    navigate({
      to: "/login"
    });
  }
  return /* @__PURE__ */ jsx(AuthLayout, { title: "Create your account", subtitle: "Join your university's secure attendance system", footer: /* @__PURE__ */ jsxs(Fragment, { children: [
    "Already registered?",
    " ",
    /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-primary font-medium", children: "Sign in" })
  ] }), children: /* @__PURE__ */ jsxs("form", { className: "space-y-4", onSubmit, noValidate: true, children: [
    /* @__PURE__ */ jsx(Field, { id: "user_id", label: "User ID", placeholder: "jdoe", value: form.user_id, error: errors.user_id, onChange: onFieldChange, onBlur: onFieldBlur }),
    /* @__PURE__ */ jsx(Field, { id: "full_name", label: "Full name", placeholder: "Jane Doe", value: form.full_name, error: errors.full_name, onChange: onFieldChange, onBlur: onFieldBlur }),
    /* @__PURE__ */ jsx(Field, { id: "matric_number", label: "Matric number", placeholder: "U2025/1234", value: form.matric_number, error: errors.matric_number, onChange: onFieldChange, onBlur: onFieldBlur }),
    /* @__PURE__ */ jsx(Field, { id: "email", label: "University email", type: "email", placeholder: "U2025/1234@university.edu", value: form.email, error: errors.email, onChange: onFieldChange, onBlur: onFieldBlur }),
    /* @__PURE__ */ jsx(Field, { id: "password", label: "Password", type: "password", placeholder: "At least 8 characters", value: form.password, error: errors.password, onChange: onFieldChange, onBlur: onFieldBlur, isVisible: showPassword, onToggleVisibility: () => setShowPassword((visible) => !visible) }),
    (touched.password || form.password) && /* @__PURE__ */ jsx("ul", { className: "space-y-1 text-xs", children: getPasswordChecks(form.password).map((check) => /* @__PURE__ */ jsxs("li", { className: check.passed ? "text-green-600" : "text-destructive", children: [
      check.passed ? "Pass: " : "Missing: ",
      check.label
    ] }, check.label)) }),
    /* @__PURE__ */ jsx(Field, { id: "confirm_password", label: "Confirm password", type: "password", placeholder: "Key in password again", value: form.confirm_password, error: errors.confirm_password, onChange: onFieldChange, onBlur: onFieldBlur, isVisible: showConfirmPassword, onToggleVisibility: () => setShowConfirmPassword((visible) => !visible) }),
    /* @__PURE__ */ jsx(Field, { id: "security_phrase", label: "Security phrase", placeholder: "e.g. Blue Whale at Sunset", value: form.security_phrase, error: errors.security_phrase, onChange: onFieldChange, onBlur: onFieldBlur }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "You'll see this phrase every time you sign in. It proves the login page is genuine - never share it." }),
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Creating account..." : "Create account" })
  ] }) });
}
function Field({
  id,
  label,
  type = "text",
  placeholder,
  value,
  error,
  onChange,
  onBlur,
  isVisible,
  onToggleVisibility
}) {
  const hasVisibilityToggle = type === "password" && onToggleVisibility;
  const inputType = hasVisibilityToggle && isVisible ? "text" : type;
  const VisibilityIcon = isVisible ? Eye : EyeOff;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx(Label, { htmlFor: id, children: label }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Input, { id, name: id, type: inputType, placeholder, value, onChange, onBlur, "aria-invalid": !!error, autoComplete: type === "password" ? "new-password" : "off", className: hasVisibilityToggle ? "pr-10" : void 0 }),
      hasVisibilityToggle && /* @__PURE__ */ jsx("button", { type: "button", className: "absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground", "aria-label": isVisible ? "Hide password" : "Show password", title: isVisible ? "Hide password" : "Show password", onClick: onToggleVisibility, children: /* @__PURE__ */ jsx(VisibilityIcon, { className: "h-4 w-4", "aria-hidden": "true" }) })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: error })
  ] });
}
export {
  RegisterPage as component
};
