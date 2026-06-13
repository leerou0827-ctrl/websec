import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Users, CheckCircle2, ClipboardList, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAdminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — SecureAttend" }] }),
  component: AdminDashboard,
});

function statusBadge(status: string) {
  const variant =
    status === "present" ? "default" : status === "late" ? "secondary" : "destructive";
  return <Badge variant={variant as any}>{status}</Badge>;
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function AdminDashboard() {
  const fetchOverview = useServerFn(getAdminOverview);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview", "v2"],
    queryFn: () => fetchOverview(),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const [studentSearch, setStudentSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");

  const students = data?.students ?? [];
  const attendance = data?.attendance ?? [];
  const stats = data?.stats;

  const studentMap = useMemo(() => {
    const m = new Map<string, any>();
    students.forEach((s: any) => m.set(s.id, s));
    return m;
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s: any) =>
      [s.full_name, s.email, s.matric_number, s.user_id]
        .filter(Boolean)
        .some((v: string) => v.toLowerCase().includes(q))
    );
  }, [students, studentSearch]);

  const filteredRecords = useMemo(() => {
    const q = recordSearch.trim().toLowerCase();
    if (!q) return attendance;
    return attendance.filter((r: any) => {
      const s = studentMap.get(r.user_id);
      const haystack = [
        s?.full_name,
        s?.email,
        s?.matric_number,
        r.attendance_date,
        r.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [attendance, recordSearch, studentMap]);

  const statCards = [
    { label: "Total students", value: stats?.totalStudents ?? 0, icon: Users },
    { label: "Attendance records", value: stats?.totalRecords ?? 0, icon: ClipboardList },
    { label: "Attendance students", value: stats?.attendanceStudents ?? 0, icon: UserCheck },
    { label: "Today's check-ins", value: stats?.todayCheckIns ?? 0, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin overview</h1>
        <p className="text-sm text-muted-foreground">
          Manage students and monitor attendance activity.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {(error as Error).message}
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="card-hover rounded-xl border border-border bg-card p-5 animate-scale-in"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  {isLoading ? <span className="inline-block h-7 w-16 rounded skeleton-shimmer" /> : s.value}
                </div>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <section
        className="rounded-xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-semibold text-foreground">Students</h2>
            <p className="text-xs text-muted-foreground">
              {filteredStudents.length} of {students.length}
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search by name, email, matric…"
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Matric</TableHead>
                <TableHead>User ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name ?? "—"}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.matric_number ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.user_id ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section
        className="rounded-xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <h2 className="font-semibold text-foreground">Attendance records</h2>
            <p className="text-xs text-muted-foreground">
              {filteredRecords.length} of {attendance.length} (latest 500)
            </p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={recordSearch}
              onChange={(e) => setRecordSearch(e.target.value)}
              placeholder="Search student, date, status…"
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((r: any) => {
                  const s = studentMap.get(r.user_id);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{r.attendance_date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{s?.full_name ?? "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">
                          {s?.matric_number ?? s?.email ?? r.user_id}
                        </div>
                      </TableCell>
                      <TableCell>{formatTime(r.check_in_time)}</TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
