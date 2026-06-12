import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CheckSquare,
  History,
  Users,
  ShieldCheck,
  LogOut,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Role = "student" | "admin";

async function destroySession() {
  await supabase.auth.signOut({ scope: "global" });
}

const studentNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mark Attendance", url: "/attendance", icon: CheckSquare },
  { title: "History", url: "/history", icon: History },
];

const adminNav = [
  { title: "Admin Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Students", url: "/admin", icon: Users },
  { title: "Settings", url: "/admin", icon: Settings },
];

export function AppShell({ role }: { role: Role }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const items = role === "admin" ? adminNav : studentNav;

  async function handleLogout() {
    await destroySession();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2 px-2 py-2 text-sidebar-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-semibold">SecureAttend</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                {role === "admin" ? "Administration" : "Student"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={path === item.url}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur sm:px-4">
            <SidebarTrigger />
            <div className="truncate text-sm font-medium text-foreground sm:font-normal sm:text-muted-foreground">
              {role === "admin" ? "Administrator Console" : "Student Portal"}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
