// SECURITY:
// - The `user_roles` query uses Supabase JS / PostgREST with parameterized
//   filters (`user_id`, `role`) — no string-concatenated SQL.
// - `user_id` comes from the validated Supabase session, not user input.
// - Unauthenticated users are redirected to /login; non-admins are redirected
//   to /dashboard before the admin subtree renders. Server-side admin
//   functions re-verify admin status, so this route guard is defense in depth,
//   not the sole check.
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/_admin")({
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: () => <AppShell role="admin" />,
});
