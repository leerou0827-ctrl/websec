import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import type ReCAPTCHA from "react-google-recaptcha";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/AuthLayout";
import { supabase } from "@/integrations/supabase/client";
import { lookupEmailByUserId, recordLogin } from "@/lib/auth.functions";
import { verifyRecaptcha } from "@/lib/recaptcha.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — SecureAttend" }] }),
  component: LoginPage,
});

const RECAPTCHA_SITE_KEY = "6Lfv1wotAAAAAObmvgeTEFH5wZ_W9ZHhZSSLUmli";
const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCK_MS = 5 * 60 * 1000;

type Step = "identify" | "verify";
type RecaptchaComponent = typeof ReCAPTCHA;
type LoginAttemptRecord = {
  count: number;
  lockedUntil: number | null;
};

function resolveRecaptchaComponent(module: unknown): RecaptchaComponent {
  const defaultExport = (module as { default?: unknown }).default;
  if (defaultExport && typeof defaultExport === "object" && "default" in defaultExport) {
    return (defaultExport as { default: RecaptchaComponent }).default;
  }
  return (defaultExport ?? module) as RecaptchaComponent;
}

function getCaptchaErrorMessage(captcha: { error?: string; errorCodes?: string[] }) {
  if (captcha.error) return captcha.error;
  if (!captcha.errorCodes?.length) return "CAPTCHA verification failed. Please try again.";

  return `CAPTCHA verification failed (${captcha.errorCodes.join(
    ", ",
  )}). Please refresh the page and try again.`;
}

function getLoginAttemptKey(userId: string) {
  return `secureattend.login_attempts.${userId.trim().toLowerCase()}`;
}

function getLockMessage(lockedUntil: number) {
  const minutes = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60_000));
  return `Too many failed login attempts. Please try again in ${minutes} minute${
    minutes === 1 ? "" : "s"
  }.`;
}

function readLoginAttempts(userId: string): LoginAttemptRecord {
  if (typeof window === "undefined") return { count: 0, lockedUntil: null };

  try {
    const raw = window.localStorage.getItem(getLoginAttemptKey(userId));
    if (!raw) return { count: 0, lockedUntil: null };

    const parsed = JSON.parse(raw) as Partial<LoginAttemptRecord>;
    const lockedUntil = typeof parsed.lockedUntil === "number" ? parsed.lockedUntil : null;
    if (lockedUntil && lockedUntil <= Date.now()) {
      window.localStorage.removeItem(getLoginAttemptKey(userId));
      return { count: 0, lockedUntil: null };
    }

    return {
      count: typeof parsed.count === "number" ? parsed.count : 0,
      lockedUntil,
    };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function writeLoginAttempts(userId: string, record: LoginAttemptRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getLoginAttemptKey(userId), JSON.stringify(record));
}

function clearLoginAttempts(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getLoginAttemptKey(userId));
}

function recordFailedLoginAttempt(userId: string) {
  const current = readLoginAttempts(userId);
  const count = current.count + 1;
  const lockedUntil = count >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOGIN_LOCK_MS : null;
  const next = { count, lockedUntil };
  writeLoginAttempts(userId, next);

  return {
    remainingAttempts: Math.max(0, MAX_LOGIN_ATTEMPTS - count),
    lockedUntil,
  };
}

function LoginPage() {
  const navigate = useNavigate();
  const lookup = useServerFn(lookupEmailByUserId);
  const logLogin = useServerFn(recordLogin);
  const verifyCaptcha = useServerFn(verifyRecaptcha);

  const [step, setStep] = useState<Step>("identify");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [securityPhrase, setSecurityPhrase] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phraseConfirmed, setPhraseConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [RecaptchaComponent, setRecaptchaComponent] = useState<RecaptchaComponent | null>(null);
  const captchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    let mounted = true;

    void import("react-google-recaptcha")
      .then((module) => {
        if (mounted) setRecaptchaComponent(() => resolveRecaptchaComponent(module));
      })
      .catch(() => {
        if (mounted) {
          setError("CAPTCHA could not load. Please refresh the page and try again.");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!lockedUntil) return undefined;

    const timer = window.setTimeout(
      () => setLockedUntil(null),
      Math.max(0, lockedUntil - Date.now()),
    );

    return () => window.clearTimeout(timer);
  }, [lockedUntil]);

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
    setLockedUntil(null);
    setError(null);
    resetCaptcha();
  }

  function stopIfLocked(trimmedUserId: string) {
    const attempts = readLoginAttempts(trimmedUserId);
    setLockedUntil(attempts.lockedUntil);

    if (attempts.lockedUntil) {
      setError(getLockMessage(attempts.lockedUntil));
      return true;
    }

    return false;
  }

  function handleInvalidLoginAttempt(trimmedUserId: string) {
    const attempt = recordFailedLoginAttempt(trimmedUserId);
    setLockedUntil(attempt.lockedUntil);

    if (attempt.lockedUntil) {
      setError(getLockMessage(attempt.lockedUntil));
      return;
    }

    setError(
      `Invalid credentials. ${attempt.remainingAttempts} login attempt${
        attempt.remainingAttempts === 1 ? "" : "s"
      } left.`,
    );
  }

  async function onIdentify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = userId.trim();
    if (!trimmed) {
      setError("Enter your User ID");
      return;
    }
    if (stopIfLocked(trimmed)) {
      resetCaptcha();
      return;
    }
    const token = captchaToken ?? captchaRef.current?.getValue() ?? null;
    if (!token) {
      setError("Please complete the CAPTCHA to continue");
      return;
    }

    setLoading(true);
    try {
      const captcha = await verifyCaptcha({ data: { token } });
      if (!captcha.success) {
        setError(getCaptchaErrorMessage(captcha));
        resetCaptcha();
        return;
      }

      setCaptchaToken(null);

      let res: { email: string | null; security_phrase: string | null };
      try {
        res = await lookup({ data: { user_id: trimmed } });
      } catch (err) {
        console.error("数据库查找报错啦：", err);
        setError("Invalid credentials");
        resetCaptcha();
        return;
      }

      // Always advance to step 2, even if the account doesn't exist — but
      // show a generic placeholder phrase so attackers can't enumerate
      // valid User IDs. The real auth check still happens on password submit.
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

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
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
    if (stopIfLocked(userId)) return;
    if (!email) {
      handleInvalidLoginAttempt(userId);
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        handleInvalidLoginAttempt(userId);
        return;
      }

      clearLoginAttempts(userId);

      try {
        await logLogin({});
      } catch {
        // ignore
      }

      toast.success("Signed in");
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  }

  if (step === "verify") {
    return (
      <AuthLayout
        title="Verify and sign in"
        subtitle="Confirm your security phrase, then enter your password."
        footer={
          <>
            Not you?{" "}
            <button type="button" onClick={resetToStart} className="text-primary font-medium">
              Start over
            </button>
          </>
        }
      >
        <div
          className="mb-5 rounded-lg border bg-muted/40 p-4"
          role="region"
          aria-label="Your security phrase"
        >
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Your security phrase
          </div>
          <p className="mt-2 text-lg font-semibold text-foreground break-words">
            {securityPhrase ?? "—"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Only continue if this matches the phrase you set during registration. If it doesn't
            match, stop and report it.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onVerify} noValidate>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input value={userId} disabled readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox
              id="phrase_confirmed"
              checked={phraseConfirmed}
              onCheckedChange={(v) => setPhraseConfirmed(v === true)}
            />
            <Label htmlFor="phrase_confirmed" className="text-sm font-normal leading-snug">
              I confirm this security phrase matches the one I set during registration
            </Label>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={resetToStart} disabled={loading}>
              Back
            </Button>
            <Button type="submit" className="w-full" disabled={loading || !!lockedUntil}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your SecureAttend account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onIdentify} noValidate>
        <div className="space-y-2">
          <Label htmlFor="user_id">User ID</Label>
          <Input
            id="user_id"
            name="user_id"
            placeholder="jdoe"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-center sm:justify-start overflow-hidden">
          <div className="origin-top-left scale-90 sm:scale-100 transform-gpu">
            {RecaptchaComponent ? (
              <RecaptchaComponent
                ref={captchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token) => {
                  setCaptchaToken(token);
                  if (token) setError(null);
                }}
                onExpired={() => {
                  setCaptchaToken(null);
                  setError("CAPTCHA expired. Please verify again.");
                }}
                onErrored={() => {
                  setCaptchaToken(null);
                  setError("CAPTCHA could not load. Please refresh the page and try again.");
                }}
              />
            ) : (
              <div className="flex h-[78px] w-[304px] items-center justify-center rounded border bg-muted/30 text-sm text-muted-foreground">
                Loading CAPTCHA...
              </div>
            )}
          </div>
        </div>
        {captchaToken && (
          <p className="text-sm text-green-600" role="status">
            CAPTCHA completed. Press Next to verify it.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading || !captchaToken}>
          {loading ? "Looking up…" : "Next"}
        </Button>
      </form>
    </AuthLayout>
  );
}
