import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { getAttendanceHistory } from "@/lib/attendance.functions";

export const Route = createFileRoute("/_student/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SecureAttend" }] }),
  component: Dashboard,
});

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "primary",
  loading,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "success" | "accent";
  loading?: boolean;
}) {
  const accentClass =
    accent === "success"
      ? "bg-success/10 text-success"
      : accent === "accent"
        ? "bg-accent/15 text-accent-foreground"
        : "bg-primary/10 text-primary";
  return (
    <div
      className="card-hover relative overflow-hidden rounded-xl border border-border bg-card p-5 animate-scale-in"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {loading ? <span className="inline-block h-7 w-16 rounded skeleton-shimmer" /> : value}
          </div>
          {hint && (
            <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
          )}
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const fetchHistory = useServerFn(getAttendanceHistory);
  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "history"],
    queryFn: () => fetchHistory(),
  });

  const records = data?.records ?? [];
  const today = todayISO();

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const rate = total ? Math.round((present / total) * 100) : 0;
    const last7 = (() => {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      const startIso = start.toISOString().slice(0, 10);
      return records.filter((r) => r.attendance_date >= startIso).length;
    })();
    const last30 = (() => {
      const start = new Date();
      start.setDate(start.getDate() - 29);
      const startIso = start.toISOString().slice(0, 10);
      return records.filter((r) => r.attendance_date >= startIso).length;
    })();
    const todays = records.find((r) => r.attendance_date === today) ?? null;
    return { total, present, rate, last7, last30, todays };
  }, [records, today]);

  const recent = records.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero / welcome */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border p-5 sm:p-7 animate-fade-in"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-4 text-primary-foreground">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Welcome back</h1>
            <p className="mt-1 max-w-md text-sm text-primary-foreground/85">
              {stats.todays
                ? "You're already checked in for today. Have a great class."
                : "You haven't checked in yet today. It only takes a second."}
            </p>
          </div>
          <Button asChild variant="secondary" size="lg" className="shadow-sm">
            <Link to="/attendance">
              {stats.todays ? "View today" : "Mark attendance"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attendance rate"
          value={`${stats.rate}%`}
          hint={`${stats.present} of ${stats.total} recorded`}
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatCard
          label="Today"
          value={stats.todays ? "Present" : "Pending"}
          hint={stats.todays ? "Checked in" : "Tap to check in"}
          icon={stats.todays ? CheckCircle2 : Clock}
          accent={stats.todays ? "success" : "accent"}
          loading={isLoading}
        />
        <StatCard
          label="Last 7 days"
          value={stats.last7}
          hint="check-ins"
          icon={CalendarCheck}
          loading={isLoading}
        />
        <StatCard
          label="Last 30 days"
          value={stats.last30}
          hint="check-ins"
          icon={ShieldCheck}
          loading={isLoading}
        />
      </div>

      {/* Detail panels */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div
          className="card-hover rounded-xl border border-border bg-card p-5 sm:p-6 lg:col-span-2"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent check-ins</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/history">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-md skeleton-shimmer" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No check-ins yet. Head to{" "}
              <Link to="/attendance" className="text-primary font-medium">Mark Attendance</Link>{" "}
              to get started.
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CalendarCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {new Date(r.attendance_date).toLocaleDateString(undefined, {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.check_in_time
                          ? new Date(r.check_in_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                      r.status === "present"
                        ? "bg-success/15 text-success"
                        : r.status === "late"
                          ? "bg-accent/20 text-accent-foreground"
                          : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="card-hover rounded-xl border border-border bg-card p-5 sm:p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="font-semibold text-foreground">Quick actions</h2>
          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/attendance">
                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                Mark attendance
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/history">
                <CalendarCheck className="mr-2 h-4 w-4 text-primary" />
                View history
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                Back to landing
              </Link>
            </Button>
          </div>

          <div className="mt-5 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            Your attendance is encrypted and tied to your university account.
          </div>
        </div>
      </div>
    </div>
  );
}
