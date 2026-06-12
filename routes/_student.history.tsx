import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, CalendarCheck, Clock, FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAttendanceHistory } from "@/lib/attendance.functions";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_student/history")({
  head: () => ({ meta: [{ title: "Attendance History — SecureAttend" }] }),
  component: HistoryPage,
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusOptions = ["all", "present", "late", "absent"] as const;

type StatusFilter = (typeof statusOptions)[number];

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "present")
    return "bg-success/15 text-success";
  if (s === "late")
    return "bg-accent/20 text-accent-foreground";
  return "bg-destructive/15 text-destructive";
}

const historyQueryOptions = () => ({
  queryKey: ["attendance", "history"],
  queryFn: () => getAttendanceHistory(),
});

function HistoryPage() {
  const fetchHistory = useServerFn(getAttendanceHistory);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["attendance", "history"],
    queryFn: () => fetchHistory(),
  });

  const records = data?.records ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesSearch =
        !q ||
        formatDate(r.attendance_date).toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        r.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance history</h1>
          <p className="text-sm text-muted-foreground">
            A complete record of your check-ins.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by date or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <FilterX className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Status filter chips — desktop */}
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setStatusFilter(opt)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === opt
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-md skeleton-shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <CalendarCheck className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-medium text-foreground">
              {hasFilters ? "No records match your filters." : "No attendance records yet."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filter."
                : "Check in on the Mark Attendance page to see your history here."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Date</TableHead>
                  <TableHead className="w-32">Check-in</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{formatDate(r.attendance_date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(r.check_in_time)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(r.status)}`}
                      >
                        {r.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Mobile card view for narrow screens */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3 sm:hidden">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-border bg-card p-4"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  {formatDate(r.attendance_date)}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge(r.status)}`}
                >
                  {r.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatTime(r.check_in_time)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
