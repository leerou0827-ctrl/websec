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
const getAttendanceHistory_createServerFn_handler = createServerRpc({
  id: "f9ed4aa88018a21073a262800373d7915ffe6fbed5474169cb7eec0124c56fbe",
  name: "getAttendanceHistory",
  filename: "src/lib/attendance.functions.ts"
}, (opts) => getAttendanceHistory.__executeServer(opts));
const getAttendanceHistory = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getAttendanceHistory_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("attendance").select("id, attendance_date, check_in_time, status, created_at").eq("user_id", userId).order("attendance_date", {
    ascending: false
  });
  if (error) throw error;
  return {
    records: data ?? []
  };
});
export {
  getAttendanceHistory_createServerFn_handler
};
