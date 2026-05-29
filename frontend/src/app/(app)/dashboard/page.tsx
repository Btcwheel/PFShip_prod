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
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { getDashboardStats, getPratiche, getInboxStatus, getMyTasks, getApprovazioniConteggio, getApprovazioni, type DashboardStats, type Task, type Approvazione } from "@/lib/api";
import { PRATICHE_MOCK, AGENT_RUNS_MOCK, FATTURATO_12M, BOLLE_MOCK, TERMINAL_MOCK, TRASPORTI_MOCK } from "@/lib/mock-data";
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

const MONTHS_FULL = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];
const MONTHS_SHORT = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

// ─── Shared: Revenue Chart ───────────────────────────────────────────────────

function RevenueChart({ stats, className }: { stats: DashboardStats | null; className?: string }) {
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
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-base">Andamento fatturato</CardTitle>
            <CardDescription>
              {selectedYear} · {filteredChartData.length > 0 ? formatEur(totalPeriodFatturato) : "Nessun dato"}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            <TrendingUp className="h-3 w-3 mr-1" />
            {totalPeriodFatture} fatture periodo
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Periodo:</span>
          </div>
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
            <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setSelectedMonth("all")}>
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={filteredChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFatt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mese" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
            <Area type="monotone" dataKey="fatturato" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#colorFatt)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── Shared: KpiCard ─────────────────────────────────────────────────────────

function KpiCard({
  title, value, valueAsString, icon: Icon, delta, deltaPositive, danger, gradient,
}: {
  title: string; value: number | string; valueAsString?: boolean; icon: React.ElementType;
  delta?: string; deltaPositive?: boolean; danger?: boolean; gradient?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn("relative overflow-hidden", gradient && "bg-gradient-to-br", gradient)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</div>
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", danger ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary")}>
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">{valueAsString ? value : value}</div>
          {delta && (
            <div className={cn("mt-2 text-xs flex items-center gap-1", deltaPositive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
              {deltaPositive && <TrendingUp className="h-3 w-3" />}
              {!deltaPositive && !danger && <TrendingDown className="h-3 w-3" />}
              {delta}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Shared: AgentRunItem ────────────────────────────────────────────────────

function AgentRunItem({ run }: { run: (typeof AGENT_RUNS_MOCK)[0] }) {
  const statusIcon = {
    running: <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />,
    completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    failed: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />,
    needs_review: <Clock className="h-3.5 w-3.5 text-warning" />,
    queued: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  }[run.stato];

  return (
    <div className="flex items-start gap-2 text-xs">
      <div className="mt-0.5">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium truncate">{run.agentLabel}</span>
          {run.praticaNumero && <><span className="text-muted-foreground">·</span><span className="text-muted-foreground truncate">{run.praticaNumero}</span></>}
        </div>
        {run.output && <p className="text-muted-foreground line-clamp-1 mt-0.5">{run.output}</p>}
        {run.stato === "running" && <p className="text-primary mt-0.5">In esecuzione…</p>}
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisione operativa — {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Tutti i sistemi operativi
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Fatturato mese" value={formatEur(stats?.fatturato_anno ? stats.fatturato_anno / 12 : 0)} valueAsString icon={Euro} delta="+12.5% vs mese scorso" deltaPositive gradient="from-violet-500/10 to-purple-500/5" />
        <KpiCard title="Pratiche aperte" value={pratiche.filter((p) => p.stato !== "chiusa" && p.stato !== "fatturata").length} icon={Briefcase} delta={`${praticheInDogana} in dogana`} gradient="from-blue-500/10 to-cyan-500/5" />
        <KpiCard title="In terminal" value={praticheInTerminal} icon={Anchor} delta={`${containerAlert} alert`} danger={containerAlert > 0} gradient="from-amber-500/10 to-orange-500/5" />
        <KpiCard title="Da approvare" value={pendingCount} icon={ClipboardCheck} delta="output AI in attesa" danger={pendingCount > 0} gradient="from-red-500/10 to-rose-500/5" />
        <KpiCard title="Task team" value={myTasks.length} icon={ListChecks} delta={`${myTasks.filter((t) => t.stato === "completato").length} completati`} deltaPositive gradient="from-emerald-500/10 to-teal-500/5" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart stats={stats} className="lg:col-span-2" />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Team workload</CardTitle>
            <CardDescription>Carico operativo per area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { team: "Import", pratiche: pratiche.filter((p) => p.team === "import").length, icon: FileText, color: "text-blue-600" },
              { team: "Dogana", pratiche: praticheInDogana, icon: ClipboardCheck, color: "text-violet-600" },
              { team: "Terminal", pratiche: praticheInTerminal, icon: Anchor, color: "text-amber-600" },
              { team: "Trasporti", pratiche: TRASPORTI_MOCK.filter((t) => t.stato !== "consegnato").length, icon: Truck, color: "text-emerald-600" },
            ].map((t) => (
              <div key={t.team} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <t.icon className={cn("h-5 w-5 shrink-0", t.color)} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{t.team}</div>
                  <div className="text-xs text-muted-foreground">{t.pratiche} pratiche attive</div>
                </div>
                <div className="text-2xl font-bold">{t.pratiche}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Approvals + Urgent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Approvals queue */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Coda approvazioni
              </CardTitle>
              <CardDescription>Output AI in attesa di revisione umana</CardDescription>
            </div>
            {pendingCount > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 h-5 text-[10px]">
                <Clock className="h-3 w-3" />{pendingCount}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            {pendingCount > 0 ? (
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-sm text-muted-foreground mt-1">approvazioni in attesa</p>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm text-muted-foreground">Nessuna approvazione in attesa</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/approvazioni" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
              Revisiona output <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Urgent pratiche */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Pratiche urgenti
            </CardTitle>
            <CardDescription>Priorità alta o critica</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {praticheUrgenti.length > 0 ? praticheUrgenti.map((p) => (
                <Link key={p.id} href={`/pratiche/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", p.urgenza === "critica" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning")}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.numero} — {p.cliente}</p>
                    <p className="text-xs text-muted-foreground">Step {p.step_corrente}/12 · ETA {p.eta_italia || "—"}</p>
                  </div>
                  <Badge variant={p.urgenza === "critica" ? "destructive" : "secondary"} className="text-[10px] h-5">{p.urgenza}</Badge>
                </Link>
              )) : (
                <div className="p-6 text-center text-muted-foreground text-sm">Nessuna pratica urgente</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Activity */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              AI Activity
            </CardTitle>
            <CardDescription>{AGENT_RUNS_MOCK.length} run oggi · {AGENT_RUNS_MOCK.filter((r) => r.stato === "completed").length} completate</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2.5 pb-3">
          {AGENT_RUNS_MOCK.slice(0, 6).map((run) => (
            <AgentRunItem key={run.id} run={run} />
          ))}
        </CardContent>
        <CardFooter className="pt-0">
          <Link href="/ai" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
            Apri AI Console <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardFooter>
      </Card>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Operatore</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Le tue attività operative — {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Operativo
        </Badge>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="I miei task" value={myPendingTasks.length} icon={ListChecks} delta={`${myCompletedTasks.length} completati`} deltaPositive gradient="from-blue-500/10 to-cyan-500/5" />
        <KpiCard title="Pratiche assegnate" value={todayPratiche.length} icon={FileText} delta={`${todayPratiche.filter((p) => p.urgenza === "alta" || p.urgenza === "critica").length} urgenti`} danger={todayPratiche.some((p) => p.urgenza === "critica")} gradient="from-violet-500/10 to-purple-500/5" />
        <KpiCard title="Terminal alert" value={terminalAlerts.length} icon={MapPin} delta="container in sosta" danger={terminalAlerts.length > 0} gradient="from-amber-500/10 to-orange-500/5" />
        <KpiCard title="Da approvare" value={pendingCount} icon={ClipboardCheck} delta="output AI" danger={pendingCount > 0} gradient="from-red-500/10 to-rose-500/5" />
      </div>

      {/* My tasks + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                I miei task
              </CardTitle>
              <CardDescription>{myPendingTasks.length} attivi · {myCompletedTasks.length} completati</CardDescription>
            </div>
            {myPendingTasks.filter((t) => t.priorita === "urgente").length > 0 && (
              <Badge variant="destructive" className="h-5 text-[10px]">
                {myPendingTasks.filter((t) => t.priorita === "urgente").length} urgenti
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            {myPendingTasks.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm text-muted-foreground">Nessun task attivo — ottimo lavoro!</p>
              </div>
            ) : (
              myPendingTasks.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
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
              ))
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/tasks" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
              Gestisci tutti i task <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Azioni rapide</CardTitle>
            <CardDescription>Operazioni frequenti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Nuova pratica", icon: FileText, href: "/pratiche", color: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
              { label: "Verifica terminal", icon: Anchor, href: "/terminal", color: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" },
              { label: "Approvazioni", icon: ClipboardCheck, href: "/approvazioni", color: "bg-red-500/10 text-red-600 hover:bg-red-500/20", badge: pendingCount > 0 ? pendingCount : undefined },
              { label: "AI Console", icon: Sparkles, href: "/ai", color: "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20" },
              { label: "Bolle doganali", icon: Package, href: "/bolle", color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
              { label: "Trasporti", icon: Truck, href: "/trasporti", color: "bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20" },
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
          </CardContent>
        </Card>
      </div>

      {/* My pratiche + Terminal alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My pratiche */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Le mie pratiche</CardTitle>
            <CardDescription>Pratiche assegnate al tuo team</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {todayPratiche.map((p) => (
                <Link key={p.id} href={`/pratiche/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", p.urgenza === "critica" ? "bg-destructive/15 text-destructive" : p.urgenza === "alta" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground")}>
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
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/pratiche" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
              Vedi tutte le pratiche <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Terminal alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Alert terminal
            </CardTitle>
            <CardDescription>Container con costi elevati o scadenze vicine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            {terminalAlerts.length > 0 ? terminalAlerts.map((t) => (
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
            )) : (
              <div className="py-8 text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-sm text-muted-foreground">Nessun alert terminal</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/terminal" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
              Vai al terminal <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>
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

  // ─── ADMIN DASHBOARD (default) ─────────────────────────────────────────────

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buongiorno, Francesco</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Situazione operativa — {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Tutti i sistemi operativi
        </Badge>
      </div>

      {/* AI Insight banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Master Orchestrator</p>
                <Badge variant="outline" className="h-5 text-[10px]">Insight giornaliero</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">3 pratiche</strong> in terminal da più di 7 giorni stanno generando costi di sosta elevati (880€ cumulati per CT Napoli). Suggerisco trasferimento a <strong className="text-foreground">Conateco</strong> — risparmio stimato 105€/giorno totali.
              </p>
            </div>
            <Link href="/terminal" className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground gap-1.5">
              Vedi dettaglio <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Fatture totali" value={stats?.totale_fatture || 0} icon={Briefcase} delta={`${stats?.fatture_anno || 0} nel ${new Date().getFullYear()}`} deltaPositive gradient="from-blue-500/10 to-cyan-500/5" />
        <KpiCard title="Anagrafiche" value={stats?.totale_anagrafiche || 0} icon={ContainersIcon} delta={`${stats?.totale_coge || 0} soggetti CoGe`} gradient="from-emerald-500/10 to-teal-500/5" />
        <KpiCard title="Fatturato mese" value={formatEur(currentMonthData?.fatturato || 0)} valueAsString icon={Euro} delta={monthTrend !== 0 ? `${monthTrend > 0 ? "+" : ""}${monthTrend.toFixed(1)}% vs mese scorso` : "Dati in caricamento"} deltaPositive={monthTrend >= 0} gradient="from-violet-500/10 to-purple-500/5" />
        <KpiCard title="Pratiche (SQLite)" value={pratiche.length} icon={AlertTriangle} delta={`${pratiche_urgenti.length} urgenti`} danger={pratiche_urgenti.length > 0} gradient="from-amber-500/10 to-orange-500/5" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart stats={stats} className="lg:col-span-2" />
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ricavi per tipo</CardTitle>
            <CardDescription>Distribuzione documenti Ge.FA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stats?.ricavi_per_tipo || []).slice(0, 5).map((r, i) => {
              const max = Math.max(...(stats?.ricavi_per_tipo || []).map(x => Number(x.totale)));
              const pct = max > 0 ? (Number(r.totale) / max) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{r.tipo_fattu || "—"}</span>
                    <span className="text-muted-foreground text-xs">{Number(r.num).toLocaleString("it-IT")} doc.</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatEur(r.totale)}</p>
                </div>
              );
            })}
            {(!stats?.ricavi_per_tipo?.length) && <p className="text-muted-foreground text-sm">Nessun dato disponibile</p>}
          </CardContent>
        </Card>
      </div>

      {/* Map + AI Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Anchor className="h-4 w-4" /> Navi in arrivo</CardTitle>
              <CardDescription>Tracking AIS in tempo reale · 3 vessel monitorati</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live AIS</Badge>
          </CardHeader>
          <CardContent className="pb-3"><MapNavi /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> AI Activity</CardTitle>
            <CardDescription>{AGENT_RUNS_MOCK.length} run eseguite oggi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pb-3">
            {AGENT_RUNS_MOCK.map((run) => (<AgentRunItem key={run.id} run={run} />))}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/ai" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
              Apri AI Console <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Tasks + Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" /> I miei task</CardTitle>
              <CardDescription>{myTasks.filter(t => t.stato !== "completato").length} attivi · {myTasks.filter(t => t.stato === "completato").length} completati</CardDescription>
            </div>
            {myTasks.filter(t => t.priorita === "urgente" && t.stato !== "completato").length > 0 && (
              <Badge variant="destructive" className="h-5 text-[10px]">{myTasks.filter(t => t.priorita === "urgente" && t.stato !== "completato").length} urgenti</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            {myTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Nessun task assegnato</p>
            ) : (
              myTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-start gap-2 text-xs">
                  <div className={cn("mt-0.5 h-3.5 w-3.5 rounded-full border shrink-0", t.stato === "completato" ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30", t.priorita === "urgente" && t.stato !== "completato" && "border-red-500")} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium truncate", t.stato === "completato" && "line-through text-muted-foreground")}>{t.titolo}</p>
                    {t.scadenza && t.stato !== "completato" && <p className="text-muted-foreground">Scadenza {new Date(t.scadenza).toLocaleDateString("it-IT")}</p>}
                  </div>
                  <Badge variant="outline" className={cn("h-4 text-[9px] shrink-0", t.priorita === "urgente" && "bg-red-500/10 text-red-600 border-red-500/30")}>{t.priorita}</Badge>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/tasks" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
              Gestisci task <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Da approvare</CardTitle>
              <CardDescription>Output agenti AI in attesa di revisione</CardDescription>
            </div>
            {pendingCount > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 h-5 text-[10px]"><Clock className="h-3 w-3" />{pendingCount}</Badge>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            {pendingCount > 0 ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingCount === 1 ? "approvazione in attesa" : "approvazioni in attesa"}</p>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs text-muted-foreground">Nessuna approvazione in attesa</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/approvazioni" className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors">
              {pendingCount > 0 ? "Revisiona output" : "Vedi storico"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Urgent pratiche */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pratiche urgenti</CardTitle>
          <CardDescription>Pratiche con priorità alta o critica che richiedono attenzione</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {pratiche_urgenti.length > 0 ? pratiche_urgenti.map((p) => (
              <Link key={p.id} href={`/pratiche/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", p.urgenza === "critica" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning")}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">#{p.id}</p>
                    <Badge variant="outline" className="text-[10px] h-5">Step {p.step_corrente}/12</Badge>
                    <Badge variant={p.urgenza === "critica" ? "destructive" : "secondary"} className="text-[10px] h-5">{p.urgenza}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{p.cliente}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs text-muted-foreground">{p.n_container}× {p.tipo_container} · {p.compagnia_navigazione}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">ETA {p.eta_italia || "—"}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            )) : (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nessuna pratica urgente</p>
                <p className="text-xs mt-1">Le pratiche create appariranno qui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}