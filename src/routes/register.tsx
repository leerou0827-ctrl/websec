import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { checkRegistrationDuplicates } from "@/lib/auth.functions";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register - SecureAttend" }] }),
  component: RegisterPage,
});

const sanitize = (s: string) => s.trim().replace(/[<>]/g, "");
const CURRENT_YEAR = new Date().getFullYear();
const MATRIC_NUMBER_PATTERN = /^([A-Z])(\d{4})\/(\d{4})$/;
const UNIVERSITY_EMAIL_PATTERN = /^[A-Z]\d{4}\/\d{4}@university\.edu$/i;

const getMatricNumberError = (value: string) => {
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

const getPasswordChecks = (password: string) => [
  { label: "At least 8 characters", passed: password.length >= 8 },
  { label: "Contains an uppercase letter", passed: /[A-Z]/.test(password) },
  { label: "Contains a lowercase letter", passed: /[a-z]/.test(password) },
  { label: "Contains a special character", passed: /[^A-Za-z0-9]/.test(password) },
];

const getPasswordError = (password: string) => {
  if (!password) return "Password is required";
  const failedCheck = getPasswordChecks(password).find((check) => !check.passed);
  return failedCheck ? `Password must have: ${failedCheck.label.toLowerCase()}.` : null;
};

const schema = z
  .object({
    user_id: z
      .string()
      .trim()
      .min(3, "User ID must be at least 3 characters")
      .max(40, "User ID is too long")
      .regex(/^[A-Za-z0-9_-]+$/, "User ID may only contain letters, numbers, _ and -"),
    full_name: z
      .string()
      .trim()
      .min(2, "Full name is required")
      .max(100, "Full name is too long")
      .regex(/^[A-Za-z .'-]+$/, "Full name contains invalid characters"),
    matric_number: z
      .string()
      .trim()
      .toUpperCase()
      .superRefine((value, ctx) => {
        const error = getMatricNumberError(value);
        if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
      }),
    email: z
      .string()
      .trim()
      .min(1, "University email is required")
      .max(255, "University email is too long")
      .regex(
        UNIVERSITY_EMAIL_PATTERN,
        "Email must be your matric number followed by @university.edu, e.g. U2025/1234@university.edu.",
      ),
    password: z
      .string()
      .max(72, "Password is too long")
      .superRefine((value, ctx) => {
        const error = getPasswordError(value);
        if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
      }),
    confirm_password: z.string(),
    security_phrase: z
      .string()
      .trim()
      .min(4, "Security phrase must be at least 4 characters")
      .max(100, "Security phrase is too long"),
  })
  .superRefine((value, ctx) => {
    if (value.matric_number && value.email) {
      const expectedEmail = `${value.matric_number}@university.edu`;
      if (value.email.toLowerCase() !== expectedEmail.toLowerCase()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email must match your matric number, e.g. U2025/1234@university.edu.",
        });
      }
    }

    if (!value.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirm_password"],
        message: "Please confirm your password.",
      });
    } else if (value.password !== value.confirm_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirm_password"],
        message: "Passwords do not match.",
      });
    }
  });

type FormValues = z.input<typeof schema>;
type FormErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;
type FieldName = keyof FormValues;

const initialFormValues: FormValues = {
  user_id: "",
  full_name: "",
  matric_number: "",
  email: "",
  password: "",
  confirm_password: "",
  security_phrase: "",
};

const cleanFormValues = (values: FormValues): FormValues => ({
  user_id: sanitize(values.user_id),
  full_name: sanitize(values.full_name),
  matric_number: sanitize(values.matric_number).toUpperCase(),
  email: sanitize(values.email),
  password: sanitize(values.password),
  confirm_password: sanitize(values.confirm_password),
  security_phrase: sanitize(values.security_phrase),
});

const getFormErrors = (values: FormValues) => {
  const parsed = schema.safeParse(cleanFormValues(values));
  const fieldErrors: FormErrors = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof FormErrors;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
  }

  return { parsed, fieldErrors };
};

const filterVisibleErrors = (
  fieldErrors: FormErrors,
  touched: Partial<Record<FieldName, boolean>>,
  values: FormValues,
) => {
  const visibleErrors: FormErrors = {};
  for (const key of Object.keys(fieldErrors) as FieldName[]) {
    if (touched[key] || values[key]) {
      visibleErrors[key] = fieldErrors[key];
    }
  }
  return visibleErrors;
};

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormValues>(initialFormValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkDuplicates = useServerFn(checkRegistrationDuplicates);

  function validateVisibleErrors(nextForm: FormValues, nextTouched = touched) {
    const { fieldErrors } = getFormErrors(nextForm);
    setErrors(filterVisibleErrors(fieldErrors, nextTouched, nextForm));
  }

  function onFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.currentTarget.name as FieldName;
    let value = e.currentTarget.value;
    if (name === "matric_number") value = value.toUpperCase();

    const nextForm = { ...form, [name]: value };
    const nextTouched = { ...touched, [name]: true };
    setForm(nextForm);
    setTouched(nextTouched);
    validateVisibleErrors(nextForm, nextTouched);
  }

  function onFieldBlur(e: React.FocusEvent<HTMLInputElement>) {
    const name = e.currentTarget.name as FieldName;
    const nextTouched = { ...touched, [name]: true };
    setTouched(nextTouched);
    validateVisibleErrors(form, nextTouched);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const allTouched = Object.keys(initialFormValues).reduce(
      (nextTouched, key) => ({ ...nextTouched, [key]: true }),
      {} as Record<FieldName, boolean>,
    );
    setTouched(allTouched);

    const { parsed, fieldErrors } = getFormErrors(form);
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
          matric_number: data.matric_number,
        },
      });

      if (duplicateRes.userIdExists || duplicateRes.emailExists || duplicateRes.matricExists) {
        const duplicateErrors: FormErrors = {};
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

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          user_id: data.user_id,
          full_name: data.full_name,
          matric_number: data.matric_number,
          security_phrase: data.security_phrase,
        },
      },
    });
    setLoading(false);

    if (error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("already") || errorMessage.includes("registered")) {
        setErrors({ email: "This email has already been registered." });
        return;
      }
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Please check your email to confirm.");
    navigate({ to: "/login" });
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your university's secure attendance system"
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="text-primary font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Field
          id="user_id"
          label="User ID"
          placeholder="jdoe"
          value={form.user_id}
          error={errors.user_id}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
        />
        <Field
          id="full_name"
          label="Full name"
          placeholder="Jane Doe"
          value={form.full_name}
          error={errors.full_name}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
        />
        <Field
          id="matric_number"
          label="Matric number"
          placeholder="U2025/1234"
          value={form.matric_number}
          error={errors.matric_number}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
        />
        <Field
          id="email"
          label="University email"
          type="email"
          placeholder="U2025/1234@university.edu"
          value={form.email}
          error={errors.email}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={form.password}
          error={errors.password}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
          isVisible={showPassword}
          onToggleVisibility={() => setShowPassword((visible) => !visible)}
        />
        {(touched.password || form.password) && (
          <ul className="space-y-1 text-xs">
            {getPasswordChecks(sanitize(form.password)).map((check) => (
              <li
                key={check.label}
                className={check.passed ? "text-green-600" : "text-destructive"}
              >
                {check.passed ? "Pass: " : "Missing: "}
                {check.label}
              </li>
            ))}
          </ul>
        )}
        <Field
          id="confirm_password"
          label="Confirm password"
          type="password"
          placeholder="Key in password again"
          value={form.confirm_password}
          error={errors.confirm_password}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
          isVisible={showConfirmPassword}
          onToggleVisibility={() => setShowConfirmPassword((visible) => !visible)}
        />
        <Field
          id="security_phrase"
          label="Security phrase"
          placeholder="e.g. Blue Whale at Sunset"
          value={form.security_phrase}
          error={errors.security_phrase}
          onChange={onFieldChange}
          onBlur={onFieldBlur}
        />
        <p className="text-xs text-muted-foreground">
          You'll see this phrase every time you sign in. It proves the login page is genuine - never
          share it.
        </p>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
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
  onToggleVisibility,
}: {
  id: FieldName;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  error?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}) {
  const hasVisibilityToggle = type === "password" && onToggleVisibility;
  const inputType = hasVisibilityToggle && isVisible ? "text" : type;
  const VisibilityIcon = isVisible ? Eye : EyeOff;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={!!error}
          autoComplete={type === "password" ? "new-password" : "off"}
          className={hasVisibilityToggle ? "pr-10" : undefined}
        />
        {hasVisibilityToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            aria-label={isVisible ? "Hide password" : "Show password"}
            title={isVisible ? "Hide password" : "Show password"}
            onClick={onToggleVisibility}
          >
            <VisibilityIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
