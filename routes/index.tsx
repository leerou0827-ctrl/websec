import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Fingerprint, Clock, BarChart3, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecureAttend — Modern University Attendance System" },
      { name: "description", content: "Secure, fast, and reliable attendance tracking for universities. Mark, monitor, and manage attendance with confidence." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-subtle)" }} />
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Trusted by modern universities
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Secure attendance, <span className="text-primary">reimagined</span> for campus.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              A modern attendance platform built for students and faculty. Verified check-ins,
              real-time history, and powerful admin insights — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/register">Create account <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Everything you need</h2>
          <p className="mt-3 text-muted-foreground">Designed for the rhythms of academic life.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Fingerprint, title: "Verified check-ins", desc: "Secure attendance marking with code or biometric verification." },
            { icon: Clock, title: "Real-time tracking", desc: "See attendance status the moment it's recorded." },
            { icon: BarChart3, title: "Insightful analytics", desc: "Dashboards for students and admins to track performance." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-t border-border bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">How it works</h2>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Register", d: "Students and faculty sign up with university credentials." },
              { n: "02", t: "Check in", d: "Mark attendance securely from anywhere on campus." },
              { n: "03", t: "Review", d: "Track history and review reports in real time." },
            ].map((s) => (
              <div key={s.n} className="rounded-xl bg-card p-6">
                <div className="text-sm font-mono text-primary">{s.n}</div>
                <div className="mt-2 font-semibold text-foreground">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>© {new Date().getFullYear()} SecureAttend University System</span>
          </div>
          <div className="flex gap-4">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
