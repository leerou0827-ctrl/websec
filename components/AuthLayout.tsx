import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-6 w-6" /> SecureAttend
        </Link>
        <div>
          <h2 className="text-3xl font-bold">A secure way to track campus attendance.</h2>
          <p className="mt-3 max-w-md text-primary-foreground/80">
            Built for universities. Trusted by faculty. Loved by students.
          </p>
        </div>
        <div className="text-sm text-primary-foreground/70">© SecureAttend University</div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
