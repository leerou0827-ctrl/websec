import { c as createServerRpc } from "./createServerRpc-pXnG1tzv.js";
import { c as createServerFn } from "./server-B6Ie_dUR.js";
import { r as requireSupabaseAuth } from "./auth-middleware-23Q58zyY.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
async function assertAdmin(supabase, userId) {
  const {
    data,
    error
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin access required");
}
const getAdminOverview_createServerFn_handler = createServerRpc({
  id: "98193c088815d6bbdd4155ffbad4b125116e51df7ef81d3d6aef43156e028e01",
  name: "getAdminOverview",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAdminOverview.__executeServer(opts));
const getAdminOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getAdminOverview_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const today = /* @__PURE__ */ new Date();
  const tzOffset = today.getTimezoneOffset() * 6e4;
  const todayISO = new Date(today.getTime() - tzOffset).toISOString().slice(0, 10);
  const [studentsRes, attendanceRes, todayRes] = await Promise.all([supabase.from("profiles").select("id, full_name, email, matric_number, user_id, created_at"), supabase.from("attendance").select("id, user_id, attendance_date, check_in_time, status, created_at").order("attendance_date", {
    ascending: false
  }).limit(500), supabase.from("attendance").select("id, status").eq("attendance_date", todayISO)]);
  if (studentsRes.error) throw studentsRes.error;
  if (attendanceRes.error) throw attendanceRes.error;
  if (todayRes.error) throw todayRes.error;
  const todayRows = todayRes.data ?? [];
  const stats = {
    totalStudents: studentsRes.data?.length ?? 0,
    totalRecords: attendanceRes.data?.length ?? 0,
    todayCheckIns: todayRows.length,
    todayPresent: todayRows.filter((r) => r.status === "present").length
  };
  return {
    students: studentsRes.data ?? [],
    attendance: attendanceRes.data ?? [],
    stats
  };
});
export {
  getAdminOverview_createServerFn_handler
};
