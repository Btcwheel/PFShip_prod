"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Stamp,
  Anchor,
  Truck,
  Receipt,
  BookOpen,
  Sparkles,
  Settings,
  Users,
  ShieldCheck,
  ScrollText,
  ChevronUp,
  LogOut,
  Sun,
  Moon,
  ListChecks,
  ClipboardCheck,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { getToken, clearToken } from "@/lib/api";

const NAV_OPERATIONS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pratiche Import", href: "/pratiche", icon: FileText },
  { label: "Bolle Doganali", href: "/bolle", icon: Stamp },
  { label: "Terminal", href: "/terminal", icon: Anchor },
  { label: "Trasporti", href: "/trasporti", icon: Truck },
];

const NAV_WORK = [
  { label: "Task", href: "/tasks", icon: ListChecks },
  { label: "Approvazioni", href: "/approvazioni", icon: ClipboardCheck, badge: "Da revisionare" },
];

const NAV_FINANCE = [
  { label: "Fatturazione", href: "/fatture", icon: Receipt },
  { label: "Contabilità", href: "/contabilita", icon: BookOpen },
];

const NAV_AI = [
  { label: "AI Console", href: "/ai", icon: Sparkles, badge: "Live" },
];

const NAV_ADMIN = [
  { label: "Utenti & Team", href: "/admin/utenti", icon: Users },
  { label: "Ruoli & Permessi", href: "/admin/ruoli", icon: ShieldCheck },
  { label: "Audit Log", href: "/admin/audit", icon: ScrollText },
  { label: "Impostazioni", href: "/admin/impostazioni", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, switchRole } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  const token = getToken() || "";
  const userSub = (() => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return { sub: "User", email: "", cognose: "" };
    }
  })();

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
    : userSub.sub
    ? userSub.sub.substring(0, 2).toUpperCase()
    : "U";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-14 items-center px-2">
          <Logo size="sm" className="group-data-[collapsible=icon]:hidden" />
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              PF
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operazioni</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_OPERATIONS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Amministrazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_FINANCE.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_WORK.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 px-1.5 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Intelligenza</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_AI.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 px-1.5 text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      >
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ADMIN.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                      <item.icon />
                      <span>{item.label}</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/15 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name || userSub.sub}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || userSub.email || "pfship.agent@quixel.it"}
                    </span>
                    <Badge variant="outline" className={cn(
                      "h-4 text-[9px] mt-0.5 w-fit",
                      user?.role === "manager" && "text-amber-600 border-amber-500/30",
                      user?.role === "operator" && "text-blue-600 border-blue-500/30",
                    )}>
                      {user?.role === "manager" ? "Manager" : user?.role === "operator" ? "Operatore" : "Admin"}
                    </Badge>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              } />
              <DropdownMenuContent
                side="right"
                align="end"
                className="min-w-56 rounded-lg"
              >
                <div className="px-2 py-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-2 mb-1">Cambia ruolo (demo)</p>
                  {(["admin", "manager", "operator"] as const).map((r) => {
                    const labels = { admin: "Admin", manager: "Manager", operator: "Operatore" };
                    const icons = { admin: ShieldCheck, manager: Users, operator: Briefcase };
                    const colors = { admin: "text-primary", manager: "text-amber-600", operator: "text-blue-600" };
                    const Icon = icons[r];
                    const isActive = user?.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => switchRole(r)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          isActive ? "bg-muted font-medium" : "hover:bg-muted/50"
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", colors[r])} />
                        <span>{labels[r]}</span>
                        {isActive && <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {theme === "dark" ? "Modalità chiara" : "Modalità scura"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
