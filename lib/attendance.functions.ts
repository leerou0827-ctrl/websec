// SECURITY:
// - Uses the Supabase JS client; filter values (`user_id`) are sent as
//   parameters via PostgREST — never interpolated into SQL — so SQL injection
//   is not possible.
// - `userId` comes from `requireSupabaseAuth`, which validates the bearer
//   token server-side. The client cannot spoof another user's id.
// - The query is also defended in depth by the RLS policy
//   `user_id = auth.uid()` on `public.attendance`.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const APP_TIME_ZONE = "Asia/Kuala_Lumpur";
const LATE_CUTOFF_HOUR = 9;

function todayISO() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function attendanceStatusFor(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  return hour >= LATE_CUTOFF_HOUR ? "late" : "present";
}

export const getTodaysAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("attendance")
      .select("id, status, check_in_time, attendance_date")
      .eq("user_id", userId)
      .eq("attendance_date", todayISO())
      .maybeSingle();

    if (error) throw error;
    return { record: data ?? null };
  });

export const markAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const attendanceDate = todayISO();
    const { data, error } = await supabase
      .from("attendance")
      .insert({
        user_id: userId,
        attendance_date: attendanceDate,
        check_in_time: new Date().toISOString(),
        status: attendanceStatusFor(),
      })
      .select("id, status, check_in_time, attendance_date")
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: existing, error: existingError } = await supabase
          .from("attendance")
          .select("id, status, check_in_time, attendance_date")
          .eq("user_id", userId)
          .eq("attendance_date", attendanceDate)
          .maybeSingle();

        if (existingError) throw existingError;
        return { record: existing, alreadyCheckedIn: true };
      }

      throw error;
    }

    return { record: data, alreadyCheckedIn: false };
  });

export const getAttendanceHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("attendance")
      .select("id, attendance_date, check_in_time, status, created_at")
      .eq("user_id", userId)
      .order("attendance_date", { ascending: false });

    if (error) throw error;
    return { records: data ?? [] };
  });
