// SECURITY:
// - All DB calls go through the Supabase JS client (PostgREST). Filter values
//   are sent as parameters, never interpolated into SQL.
// - `requireSupabaseAuth` validates the caller's JWT and provides a verified
//   `userId`. `assertAdmin()` checks `user_roles` for the `admin` role before
//   privileged reads run. Only after that check do overview reads use the
//   server-side service role client, so admin reports can read all rows without
//   depending on browser-visible permissions.
// - `todayISO` is generated server-side from `new Date()`, not from input.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin access required");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    const todayISO = new Date(today.getTime() - tzOffset).toISOString().slice(0, 10);

    const [studentsRes, attendanceRes, todayRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, matric_number, user_id, created_at"),
      supabaseAdmin
        .from("attendance")
        .select("id, user_id, attendance_date, check_in_time, status, created_at")
        .order("attendance_date", { ascending: false })
        .limit(500),
      supabaseAdmin.from("attendance").select("id, status").eq("attendance_date", todayISO),
    ]);

    if (studentsRes.error) throw studentsRes.error;
    if (attendanceRes.error) throw attendanceRes.error;
    if (todayRes.error) throw todayRes.error;

    const attendanceRows = attendanceRes.data ?? [];
    const todayRows = todayRes.data ?? [];
    const stats = {
      totalStudents: studentsRes.data?.length ?? 0,
      totalRecords: attendanceRows.length,
      attendanceStudents: new Set(attendanceRows.map((r: any) => r.user_id)).size,
      todayCheckIns: todayRows.length,
      todayPresent: todayRows.filter((r: any) => r.status === "present").length,
    };

    return {
      students: studentsRes.data ?? [],
      attendance: attendanceRows,
      stats,
    };
  });
