"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Container as ContainersIcon,
  Euro,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  ArrowRight,
  Anchor,
  CheckCircle2,
  Clock,
  Zap,
  ListChecks,
  ClipboardCheck,
  Calendar,
  Filter,
  Users,
  Truck,
  FileText,
  MapPin,
  Package,
  Target,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import { getDashboardStats, getPratiche, getInboxStatus, getMyTasks, getApprovazioniConteggio, type DashboardStats, type Task } from "@/lib/api";
import { PRATICHE_MOCK, AGENT_RUNS_MOCK, FATTURATO_12M, TERMINAL_MOCK, TRASPORTI_MOCK } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-store";
import Link from "next/link";
import { cn } from "@/lib/utils";

const MapNavi = dynamic(() => import("@/components/dashboard/map-navi"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] w-full rounded-lg bg-muted animate-pulse" />
  ),
});

function formatEur(n: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatEurShort(n: number) {
  if (n >= 1_000_000) return `€ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€ ${(n / 1_000).toFixed(0)}k`;
  return `€ ${n}`;
}

const MONTHS_FULL = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const MONTHS_SHORT = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

// ══════════════════════════════════════════════════════════════════════════════
// SHARED: Revenue Chart
// ══════════════════════════════════════════════════════════════════════════════

function RevenueChart({ stats }: { stats: DashboardStats | null }) {
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const hasApiData = (stats?.fatturato_mensile || []).length > 0;

  const availableYears = Array.from(
    new Set(
      hasApiData
        ? (stats?.fatturato_mensile || []).map((r) => parseInt(String(r.mese).split("-")[0]))
        : FATTURATO_12M.map((r) => parseInt(r.mese.split(" ")[1]))
    )
  ).sort((a, b) => b - a).map(String);

  const allChartData = hasApiData
    ? (stats?.fatturato_mensile || []).map((r) => {
        const [y, m] = String(r.mese).split("-");
        return { anno: y, meseIdx: parseInt(m) - 1, mese: MONTHS_SHORT[parseInt(m) - 1], fatturato: r.totale, num_fatture: r.num_fatture };
      })
    : FATTURATO_12M.map((r) => {
        const [name, yearStr] = r.mese.split(" ");
        return { anno: yearStr, meseIdx: MONTHS_SHORT.indexOf(name), mese: name, fatturato: r.fatturato, num_fatture: 0 };
      });

  const filteredChartData = allChartData
    .filter((d) => d.anno === selectedYear)
    .filter((d) => selectedMonth === "all" || d.meseIdx === parseInt(selectedMonth))
    .sort((a, b) => a.meseIdx - b.meseIdx);

  const totalPeriodFatturato = filteredChartData.reduce((s, d) => s + d.fatturato, 0);
  const totalPeriodFatture = filteredChartData.reduce((s, d) => s + d.num_fatture, 0);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">Fatturato {selectedYear}</p>
          <p className="text-3xl font-bold tracking-tight mt-0.5">{formatEur(totalPeriodFatturato)}</p>
          <p className="text-xs text-muted-foreground mt-1">{totalPeriodFatture} fatture · {filteredChartData.length} {filteredChartData.length === 1 ? "mese" : "mesi"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v ?? String(new Date().getFullYear())); setSelectedMonth("all"); }}>
            <SelectTrigger className="w-[90px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v ?? "all")}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutto l'anno</SelectItem>
              {MONTHS_FULL.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMonth !== "all" && (
            <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => setSelectedMonth("all")}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFatt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mese" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="fatturato" stroke="var(--chart-1)" strokeWidth={2} fill="url(#colorFatt)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED: KpiCard — clean, no gradients
// ══════════════════════════════════════════════════════════════════════════════

function KpiCard({
  title, value, valueAsString, icon: Icon, delta, deltaPositive, danger, accent,
}: {
  title: string; value: number | string; valueAsString?: boolean; icon: React.ElementType;
  delta?: string; deltaPositive?: boolean; danger?: boolean; accent?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", accent || "bg-muted text-muted-foreground")}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className={cn("text-3xl font-bold tracking-tight", valueAsString && "text-2xl")}>{valueAsString ? value : value}</p>
        {delta && (
          <div className={cn("mt-2 text-xs flex items-center gap-1", deltaPositive ? "text-emerald-600" : danger ? "text-destructive" : "text-muted-foreground")}>
            {deltaPositive && <TrendingUp className="h-3 w-3" />}
            {!deltaPositive && !danger && <TrendingDown className="h-3 w-3" />}
            {delta}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED: AgentRunItem
// ══════════════════════════════════════════════════════════════════════════════

function AgentRunItem({ run }: { run: (typeof AGENT_RUNS_MOCK)[0] }) {
  const statusIcon = {
    running: <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />,
    completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    failed: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />,
    needs_review: <Clock className="h-3.5 w-3.5 text-warning" />,
    queued: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  }[run.stato];

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{run.agentLabel}</span>
          {run.praticaNumero && <><span className="text-muted-foreground">·</span><span className="text-muted-foreground truncate">{run.praticaNumero}</span></>}
        </div>
        {run.output && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{run.output}</p>}
        {run.stato === "running" && <p className="text-xs text-primary mt-0.5">In esecuzione…</p>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MANAGER DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function ManagerDashboard({ stats, pratiche, myTasks, pendingCount }: {
  stats: DashboardStats | null;
  pratiche: any[];
  myTasks: Task[];
  pendingCount: number;
}) {
  const praticheUrgenti = pratiche.filter((p) => p.urgenza === "critica" || p.urgenza === "alta").slice(0, 5);
  const praticheInDogana = pratiche.filter((p) => p.stato === "in_dogana").length;
  const praticheInTerminal = pratiche.filter((p) => p.stato === "in_terminal").length;
  const containerAlert = TERMINAL_MOCK.filter((t) => t.alert !== "ok").length;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisione operativa — {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Fatturato mese" value={formatEur(stats?.fatturato_anno ? stats.fatturato_anno / 12 : 0)} valueAsString icon={Euro} delta="+12.5% vs mese scorso" deltaPositive accent="bg-violet-500/10 text-violet-600" />
        <KpiCard title="Pratiche aperte" value={pratiche.filter((p) => p.stato !== "chiusa" && p.stato !== "fatturata").length} icon={Briefcase} delta={`${praticheInDogana} in dogana`} accent="bg-blue-500/10 text-blue-600" />
        <KpiCard title="In terminal" value={praticheInTerminal} icon={Anchor} delta={`${containerAlert} alert`} danger={containerAlert > 0} accent="bg-amber-500/10 text-amber-600" />
        <KpiCard title="Da approvare" value={pendingCount} icon={ClipboardCheck} delta="output AI in attesa" danger={pendingCount > 0} accent="bg-red-500/10 text-red-600" />
        <KpiCard title="Task team" value={myTasks.length} icon={ListChecks} delta={`${myTasks.filter((t) => t.stato === "completato").length} completati`} deltaPositive accent="bg-emerald-500/10 text-emerald-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <RevenueChart stats={stats} />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium mb-4">Carico per area</p>
          <div className="space-y-4">
            {[
              { team: "Import", pratiche: pratiche.filter((p) => p.team === "import").length, color: "text-blue-600", bg: "bg-blue-500/10" },
              { team: "Dogana", pratiche: praticheInDogana, color: "text-violet-600", bg: "bg-violet-500/10" },
              { team: "Terminal", pratiche: praticheInTerminal, color: "text-amber-600", bg: "bg-amber-500/10" },
              { team: "Trasporti", pratiche: TRASPORTI_MOCK.filter((t) => t.stato !== "consegnato").length, color: "text-emerald-600", bg: "bg-emerald-500/10" },
            ].map((t) => (
              <div key={t.team} className="flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", t.bg, t.color)}>
                  <span className="text-lg font-bold">{t.pratiche}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.team}</p>
                  <p className="text-xs text-muted-foreground">pratiche attive</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Approvals + Urgent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium">Coda approvazioni</p>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 h-6 text-xs">
                <Clock className="h-3 w-3 mr-1" />{pendingCount}
              </Badge>
            )}
          </div>
          {pendingCount > 0 ? (
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground mt-1">approvazioni in attesa</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">Tutto approvato</p>
            </div>
          )}
          <Link href="/approvazioni" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-2">
            Revisiona output <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Urgent pratiche */}
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium mb-4">Pratiche urgenti</p>
          <div className="space-y-0">
            {praticheUrgenti.length > 0 ? praticheUrgenti.map((p) => (
              <Link key={p.id} href={`/pratiche/${p.id}`} className="flex items-center gap-3 py-3 border-b last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded transition-colors">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", p.urgenza === "critica" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600")}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.numero} — {p.cliente}</p>
                  <p className="text-xs text-muted-foreground">Step {p.step_corrente}/12 · ETA {p.eta_italia || "—"}</p>
                </div>
                <Badge variant={p.urgenza === "critica" ? "destructive" : "outline"} className="text-[10px] h-5">{p.urgenza}</Badge>
              </Link>
            )) : (
              <div className="py-6 text-center text-muted-foreground text-sm">Nessuna pratica urgente</div>
            )}
          </div>
        </div>
      </div>

      {/* AI Activity */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">AI Activity</p>
            <p className="text-xs text-muted-foreground">{AGENT_RUNS_MOCK.length} run oggi · {AGENT_RUNS_MOCK.filter((r) => r.stato === "completed").length} completate</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
          {AGENT_RUNS_MOCK.slice(0, 6).map((run) => (
            <AgentRunItem key={run.id} run={run} />
          ))}
        </div>
        <Link href="/ai" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-4">
          Apri AI Console <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// OPERATOR DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function OperatorDashboard({ myTasks, pendingCount, pratiche }: {
  myTasks: Task[];
  pendingCount: number;
  pratiche: any[];
}) {
  const todayPratiche = pratiche.slice(0, 4);
  const terminalAlerts = TERMINAL_MOCK.filter((t) => t.alert !== "ok");
  const myPendingTasks = myTasks.filter((t) => t.stato !== "completato");
  const myCompletedTasks = myTasks.filter((t) => t.stato === "completato");

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Operatore</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Le tue attività — {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="I miei task" value={myPendingTasks.length} icon={ListChecks} delta={`${myCompletedTasks.length} completati`} deltaPositive accent="bg-blue-500/10 text-blue-600" />
        <KpiCard title="Pratiche assegnate" value={todayPratiche.length} icon={FileText} delta={`${todayPratiche.filter((p) => p.urgenza === "alta" || p.urgenza === "critica").length} urgenti`} danger={todayPratiche.some((p) => p.urgenza === "critica")} accent="bg-violet-500/10 text-violet-600" />
        <KpiCard title="Terminal alert" value={terminalAlerts.length} icon={MapPin} delta="container in sosta" danger={terminalAlerts.length > 0} accent="bg-amber-500/10 text-amber-600" />
        <KpiCard title="Da approvare" value={pendingCount} icon={ClipboardCheck} delta="output AI" danger={pendingCount > 0} accent="bg-red-500/10 text-red-600" />
      </div>

      {/* My tasks + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My tasks */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">I miei task</p>
              <p className="text-xs text-muted-foreground">{myPendingTasks.length} attivi · {myCompletedTasks.length} completati</p>
            </div>
            {myPendingTasks.filter((t) => t.priorita === "urgente").length > 0 && (
              <Badge variant="destructive" className="h-6 text-xs">
                {myPendingTasks.filter((t) => t.priorita === "urgente").length} urgenti
              </Badge>
            )}
          </div>
          {myPendingTasks.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">Nessun task attivo — ottimo lavoro!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {myPendingTasks.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-start gap-3 py-3 border-b last:border-0 -mx-2 px-2 hover:bg-muted/30 rounded transition-colors">
                  <div className={cn("mt-0.5 h-4 w-4 rounded-full border shrink-0", t.priorita === "urgente" && "border-red-500", t.priorita === "alta" && "border-amber-500")}>
                    {t.priorita === "urgente" && <div className="h-2 w-2 rounded-full bg-red-500 m-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t.titolo}</p>
                    {t.descrizione && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.descrizione}</p>}
                    <div className="flex items-center gap-2 mt-1.5">
                      {t.scadenza && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.scadenza).toLocaleDateString("it-IT")}
                        </span>
                      )}
                      <Badge variant="outline" className={cn("h-4 text-[9px]", t.priorita === "urgente" && "bg-red-500/10 text-red-600 border-red-500/30")}>
                        {t.priorita}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/tasks" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-4">
            Gestisci tutti i task <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium mb-4">Azioni rapide</p>
          <div className="space-y-1.5">
            {[
              { label: "Nuova pratica", icon: FileText, href: "/pratiche", color: "text-blue-600 hover:bg-blue-500/5" },
              { label: "Verifica terminal", icon: Anchor, href: "/terminal", color: "text-amber-600 hover:bg-amber-500/5" },
              { label: "Approvazioni", icon: ClipboardCheck, href: "/approvazioni", color: "text-red-600 hover:bg-red-500/5", badge: pendingCount > 0 ? pendingCount : undefined },
              { label: "AI Console", icon: Sparkles, href: "/ai", color: "text-violet-600 hover:bg-violet-500/5" },
              { label: "Bolle doganali", icon: Package, href: "/bolle", color: "text-emerald-600 hover:bg-emerald-500/5" },
              { label: "Trasporti", icon: Truck, href: "/trasporti", color: "text-cyan-600 hover:bg-cyan-500/5" },
            ].map((a) => (
              <Link key={a.label} href={a.href} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", a.color)}>
                <a.icon className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium flex-1">{a.label}</span>
                {a.badge && (
                  <Badge variant="destructive" className="h-5 text-[10px]">{a.badge}</Badge>
                )}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* My pratiche + Terminal alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My pratiche */}
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium mb-4">Le mie pratiche</p>
          <div className="space-y-0">
            {todayPratiche.map((p) => (
              <Link key={p.id} href={`/pratiche/${p.id}`} className="flex items-center gap-3 py-3 border-b last:border-0 -mx-2 px-2 hover:bg-muted/30 rounded transition-colors">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", p.urgenza === "critica" ? "bg-destructive/10 text-destructive" : p.urgenza === "alta" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground")}>
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.numero}</p>
                  <p className="text-xs text-muted-foreground">{p.cliente} · Step {p.step_corrente}/12</p>
                </div>
                <Badge variant="outline" className="text-[10px] h-5">{p.stato}</Badge>
              </Link>
            ))}
          </div>
          <Link href="/pratiche" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-4">
            Vedi tutte le pratiche <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Terminal alerts */}
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium mb-4">Alert terminal</p>
          {terminalAlerts.length > 0 ? (
            <div className="space-y-3">
              {terminalAlerts.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t.containerNumber}</p>
                    <p className="text-xs text-muted-foreground">{t.terminal} · {t.carrier}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-destructive">{formatEur(t.costoCumulato)}</p>
                    <p className="text-[10px] text-muted-foreground">{t.alert === "costo_alto" ? "Costo alto" : "Scadenza"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">Nessun alert</p>
            </div>
          )}
          <Link href="/terminal" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-4">
            Vai al terminal <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════

function AdminDashboard({ stats, pratiche, myTasks, pendingCount }: {
  stats: DashboardStats | null;
  pratiche: any[];
  myTasks: Task[];
  pendingCount: number;
}) {
  const pratiche_urgenti = pratiche.filter((p) => p.urgenza === "critica" || p.urgenza === "alta").slice(0, 5);

  const allChartData = (stats?.fatturato_mensile || []).length > 0
    ? (stats?.fatturato_mensile || []).map((r) => {
        const [y, m] = String(r.mese).split("-");
        return { anno: y, meseIdx: parseInt(m) - 1, mese: MONTHS_SHORT[parseInt(m) - 1], fatturato: r.totale, num_fatture: r.num_fatture };
      })
    : FATTURATO_12M.map((r) => {
        const [name, yearStr] = r.mese.split(" ");
        return { anno: yearStr, meseIdx: MONTHS_SHORT.indexOf(name), mese: name, fatturato: r.fatturato, num_fatture: 0 };
      });

  const currentMonthData = allChartData.find((d) => d.anno === String(new Date().getFullYear()) && d.meseIdx === new Date().getMonth());
  const prevMonthData = allChartData.find((d) => d.anno === String(new Date().getFullYear()) && d.meseIdx === new Date().getMonth() - 1);
  const monthTrend = currentMonthData && prevMonthData && prevMonthData.fatturato > 0
    ? ((currentMonthData.fatturato - prevMonthData.fatturato) / prevMonthData.fatturato) * 100
    : 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buongiorno, Francesco</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* AI Insight banner — clean, no gradient */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold">Master Orchestrator</p>
                <Badge variant="outline" className="h-5 text-[10px]">Insight</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">3 pratiche</strong> in terminal da più di 7 giorni — costi di sosta 880€ cumulati. Suggerito trasferimento a <strong className="text-foreground">Conateco</strong> (risparmio 105€/gg).
              </p>
            </div>
            <Link href="/terminal" className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted transition-colors gap-1.5">
              Vedi <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid — clean cards, no gradients */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Fatture totali" value={stats?.totale_fatture || 0} icon={Briefcase} delta={`${stats?.fatture_anno || 0} nel ${new Date().getFullYear()}`} deltaPositive accent="bg-blue-500/10 text-blue-600" />
        <KpiCard title="Anagrafiche" value={stats?.totale_anagrafiche || 0} icon={ContainersIcon} delta={`${stats?.totale_coge || 0} soggetti CoGe`} accent="bg-emerald-500/10 text-emerald-600" />
        <KpiCard title="Fatturato mese" value={formatEur(currentMonthData?.fatturato || 0)} valueAsString icon={Euro} delta={monthTrend !== 0 ? `${monthTrend > 0 ? "+" : ""}${monthTrend.toFixed(1)}% vs mese scorso` : "—"} deltaPositive={monthTrend >= 0} accent="bg-violet-500/10 text-violet-600" />
        <KpiCard title="Pratiche" value={pratiche.length} icon={AlertTriangle} delta={`${pratiche_urgenti.length} urgenti`} danger={pratiche_urgenti.length > 0} accent="bg-amber-500/10 text-amber-600" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <RevenueChart stats={stats} />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium mb-4">Ricavi per tipo</p>
          <div className="space-y-4">
            {(stats?.ricavi_per_tipo || []).slice(0, 5).map((r, i) => {
              const max = Math.max(...(stats?.ricavi_per_tipo || []).map(x => Number(x.totale)));
              const pct = max > 0 ? (Number(r.totale) / max) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{r.tipo_fattu || "—"}</span>
                    <span className="text-muted-foreground text-xs">{Number(r.num).toLocaleString("it-IT")} doc.</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatEur(r.totale)}</p>
                </div>
              );
            })}
            {(!stats?.ricavi_per_tipo?.length) && <p className="text-muted-foreground text-sm py-4">Nessun dato disponibile</p>}
          </div>
        </div>
      </div>

      {/* Map + AI Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Navi in arrivo</p>
              <p className="text-xs text-muted-foreground">Tracking AIS · 3 vessel monitorati</p>
            </div>
            <Badge variant="outline" className="gap-1.5 h-6 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </Badge>
          </div>
          <MapNavi />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm font-medium mb-1">AI Activity</p>
          <p className="text-xs text-muted-foreground mb-4">{AGENT_RUNS_MOCK.length} run oggi</p>
          <div className="space-y-0">
            {AGENT_RUNS_MOCK.map((run) => (
              <AgentRunItem key={run.id} run={run} />
            ))}
          </div>
          <Link href="/ai" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-4">
            Apri AI Console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Tasks + Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">I miei task</p>
              <p className="text-xs text-muted-foreground">{myTasks.filter(t => t.stato !== "completato").length} attivi · {myTasks.filter(t => t.stato === "completato").length} completati</p>
            </div>
            {myTasks.filter(t => t.priorita === "urgente" && t.stato !== "completato").length > 0 && (
              <Badge variant="destructive" className="h-6 text-xs">{myTasks.filter(t => t.priorita === "urgente" && t.stato !== "completato").length} urgenti</Badge>
            )}
          </div>
          {myTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nessun task assegnato</p>
          ) : (
            <div className="space-y-0">
              {myTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-start gap-3 py-3 border-b last:border-0 -mx-2 px-2 hover:bg-muted/30 rounded transition-colors">
                  <div className={cn("mt-0.5 h-3.5 w-3.5 rounded-full border shrink-0", t.stato === "completato" ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30", t.priorita === "urgente" && t.stato !== "completato" && "border-red-500")} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", t.stato === "completato" && "line-through text-muted-foreground")}>{t.titolo}</p>
                    {t.scadenza && t.stato !== "completato" && <p className="text-xs text-muted-foreground">Scadenza {new Date(t.scadenza).toLocaleDateString("it-IT")}</p>}
                  </div>
                  <Badge variant="outline" className={cn("h-4 text-[9px] shrink-0", t.priorita === "urgente" && "bg-red-500/10 text-red-600 border-red-500/30")}>{t.priorita}</Badge>
                </div>
              ))}
            </div>
          )}
          <Link href="/tasks" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-4">
            Gestisci task <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Approvals */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Da approvare</p>
              <p className="text-xs text-muted-foreground">Output AI in attesa</p>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 h-6 text-xs">
                <Clock className="h-3 w-3 mr-1" />{pendingCount}
              </Badge>
            )}
          </div>
          {pendingCount > 0 ? (
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-amber-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground mt-1">{pendingCount === 1 ? "approvazione" : "approvazioni"} in attesa</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-muted-foreground">Tutto approvato</p>
            </div>
          )}
          <Link href="/approvazioni" className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-sm font-medium hover:bg-muted transition-colors mt-4">
            {pendingCount > 0 ? "Revisiona output" : "Vedi storico"} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Urgent pratiche */}
      <div className="rounded-xl border bg-card p-6">
        <p className="text-sm font-medium mb-4">Pratiche urgenti</p>
        {pratiche_urgenti.length > 0 ? (
          <div className="space-y-0">
            {pratiche_urgenti.map((p) => (
              <Link key={p.id} href={`/pratiche/${p.id}`} className="flex items-center gap-4 py-3 border-b last:border-0 -mx-2 px-2 hover:bg-muted/30 rounded transition-colors">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", p.urgenza === "critica" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600")}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">#{p.id}</p>
                    <Badge variant="outline" className="text-[10px] h-5">Step {p.step_corrente}/12</Badge>
                    <Badge variant={p.urgenza === "critica" ? "destructive" : "outline"} className="text-[10px] h-5">{p.urgenza}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{p.cliente}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs text-muted-foreground">{p.n_container}× {p.tipo_container} · {p.compagnia_navigazione}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">ETA {p.eta_italia || "—"}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            <p className="text-sm">Nessuna pratica urgente</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE (role router)
// ══════════════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "admin";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pratiche, setPratiche] = useState<any[]>([]);
  const [inboxStatus, setInboxStatus] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardStats().catch(() => null),
      getPratiche().catch(() => []),
      getInboxStatus().catch(() => null),
      getMyTasks().catch(() => []),
      getApprovazioniConteggio().catch(() => ({ pending: 0 })),
    ]).then(([s, p, i, t, a]) => {
      setStats(s);
      setPratiche(p);
      setInboxStatus(i);
      setMyTasks(t);
      setPendingCount(a.pending || 0);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Caricamento dashboard...</p>
      </div>
    );
  }

  if (role === "manager") {
    return <ManagerDashboard stats={stats} pratiche={pratiche} myTasks={myTasks} pendingCount={pendingCount} />;
  }

  if (role === "operator") {
    return <OperatorDashboard myTasks={myTasks} pendingCount={pendingCount} pratiche={pratiche} />;
  }

  return <AdminDashboard stats={stats} pratiche={pratiche} myTasks={myTasks} pendingCount={pendingCount} />;
}