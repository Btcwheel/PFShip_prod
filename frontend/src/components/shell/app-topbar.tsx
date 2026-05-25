"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Sun, Moon, Sparkles, Command as CmdIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FileText,
  Stamp,
  Anchor,
  Truck,
  Receipt,
  BookOpen,
} from "lucide-react";

function getBreadcrumb(pathname: string): string {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/pratiche": "Pratiche Import",
    "/bolle": "Bolle Doganali",
    "/terminal": "Terminal",
    "/trasporti": "Trasporti",
    "/fatture": "Fatturazione",
    "/contabilita": "Contabilità",
    "/ai": "AI Console",
    "/admin/utenti": "Utenti & Team",
    "/admin/ruoli": "Ruoli & Permessi",
    "/admin/audit": "Audit Log",
    "/admin/impostazioni": "Impostazioni",
  };
  const seg = Object.keys(map).find((k) => pathname.startsWith(k));
  if (!seg) return "PF Ship";
  // /pratiche/p001 → "Pratiche Import › Dettaglio"
  if (pathname !== seg) return `${map[seg]} › Dettaglio`;
  return map[seg];
}

export function AppTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (cmd: () => void) => {
    setCmdOpen(false);
    cmd();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-5" />
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <h1 className="text-sm font-medium truncate">{getBreadcrumb(pathname)}</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCmdOpen(true)}
          className="hidden md:flex h-8 gap-2 px-3 text-muted-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Cerca…</span>
          <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
            <CmdIcon className="h-3 w-3" />K
          </kbd>
        </Button>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{theme === "dark" ? "Tema chiaro" : "Tema scuro"}</TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <div className="text-sm font-medium">Notifiche</div>
              <Badge variant="secondary" className="text-[10px]">3 nuove</Badge>
            </div>
            <div className="max-h-80 overflow-auto divide-y">
              <NotifItem
                icon={<Sparkles className="h-4 w-4 text-primary" />}
                title="Master Orchestrator"
                text="Pratica PF-2026-0147: bolla doganale pronta per revisione"
                time="2 min fa"
                unread
              />
              <NotifItem
                icon={<Anchor className="h-4 w-4 text-chart-2" />}
                title="Vessel Tracker"
                text="Bangkok Express in arrivo Napoli 28/05 — ETA confermata"
                time="12 min fa"
                unread
              />
              <NotifItem
                icon={<Truck className="h-4 w-4 text-chart-3" />}
                title="Trasporto confermato"
                text="Cliente Magnolia ha confermato consegna slot 08-10"
                time="1 h fa"
                unread
              />
              <NotifItem
                icon={<Stamp className="h-4 w-4 text-warning" />}
                title="Bolla in approvazione"
                text="BD-2026-00148 attende approvazione manager"
                time="3 h fa"
              />
            </div>
          </PopoverContent>
        </Popover>
      </header>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput placeholder="Cerca pratiche, clienti, navi, bolle…" />
        <CommandList>
          <CommandEmpty>Nessun risultato.</CommandEmpty>
          <CommandGroup heading="Navigazione">
            <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/pratiche"))}>
              <FileText className="h-4 w-4" /> Pratiche Import
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/bolle"))}>
              <Stamp className="h-4 w-4" /> Bolle Doganali
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/terminal"))}>
              <Anchor className="h-4 w-4" /> Terminal
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/trasporti"))}>
              <Truck className="h-4 w-4" /> Trasporti
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/fatture"))}>
              <Receipt className="h-4 w-4" /> Fatturazione
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/contabilita"))}>
              <BookOpen className="h-4 w-4" /> Contabilità
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/ai"))}>
              <Sparkles className="h-4 w-4" /> AI Console
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Pratiche recenti">
            <CommandItem onSelect={() => runCommand(() => router.push("/pratiche/p001"))}>
              PF-2026-0148 — Tessuti Mediterraneo
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/pratiche/p002"))}>
              PF-2026-0147 — Galileo Import Export
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/pratiche/p003"))}>
              PF-2026-0146 — Casa Bella Living
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function NotifItem({
  icon,
  title,
  text,
  time,
  unread,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{title}</p>
          {unread && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{text}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
