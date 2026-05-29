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
import { getDashboardStats, getPratiche, getInboxStatus, getMyTasks, getApprovazioniConteggio, type DashboardStats, type Task } from "@/lib/api";
import { PRATICHE_MOCK, AGENT_RUNS_MOCK, FATTURATO_12M } from "@/lib/mock-data";
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pratiche, setPratiche] = useState<any[]>([]);
  const [inboxStatus, setInboxStatus] = useState<any>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

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

  const pratiche_urgenti = pratiche
    .filter((p) => p.urgenza === "critica" || p.urgenza === "alta")
    .slice(0, 5);

  const fatturatoMese = stats?.fatturato_anno
    ? stats.fatturato_anno / 12
    : 0;

  const availableYears = Array.from(
    new Set(
      (stats?.fatturato_mensile || []).length > 0
        ? (stats?.fatturato_mensile || []).map((r) =>
            parseInt(String(r.mese).split("-")[0])
          )
        : FATTURATO_12M.map((r) => parseInt(r.mese.split(" ")[1]))
    )
  ).sort((a, b) => b - a);

  const MONTHS = [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
    "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
  ];

  const hasApiData = (stats?.fatturato_mensile || []).length > 0;

  const filteredChartData = hasApiData
    ? (stats?.fatturato_mensile || [])
        .filter((r) => parseInt(String(r.mese).split("-")[0]) === selectedYear)
        .map((r) => {
          const [y, m] = String(r.mese).split("-");
          return {
            mese: MONTHS[parseInt(m) - 1],
            fatturato: r.totale,
            num_fatture: r.num_fatture,
          };
        })
    : FATTURATO_12M.filter((r) => {
        const [, yearStr] = r.mese.split(" ");
        const year = parseInt(yearStr);
        return year === selectedYear;
      }).map((r) => ({
        mese: r.mese.split(" ")[0],
        fatturato: r.fatturato,
        num_fatture: 0,
      }));

  const toggleMonth = (idx: number) => {
    setSelectedMonths((prev) =>
      prev.includes(idx) ? prev.filter((m) => m !== idx) : [...prev, idx]
    );
  };

  const displayData =
    selectedMonths.length > 0
      ? filteredChartData.filter((_, i) => selectedMonths.includes(i))
      : filteredChartData;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground">Caricamento dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buongiorno, Francesco</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ecco la situazione operativa di oggi —{" "}
            {new Date().toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Tutti i sistemi operativi
        </Badge>
      </div>

      {/* AI Insight banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Master Orchestrator</p>
                <Badge variant="outline" className="h-5 text-[10px]">
                  Insight giornaliero
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">3 pratiche</strong> in
                terminal da più di 7 giorni stanno generando costi di sosta
                elevati (880€ cumulati per CT Napoli). Suggerisco trasferimento a{" "}
                <strong className="text-foreground">Conateco</strong> — risparmio
                stimato 105€/giorno totali.
              </p>
            </div>
            <Link
              href="/terminal"
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground gap-1.5"
            >
              Vedi dettaglio
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fatture totali"
          value={stats?.totale_fatture || 0}
          icon={Briefcase}
          delta={`${stats?.fatture_anno || 0} nel ${new Date().getFullYear()}`}
          deltaPositive
          gradient="from-blue-500/10 to-cyan-500/5"
        />
        <KpiCard
          title="Anagrafiche"
          value={stats?.totale_anagrafiche || 0}
          icon={ContainersIcon}
          delta={`${stats?.totale_coge || 0} soggetti CoGe`}
          gradient="from-emerald-500/10 to-teal-500/5"
        />
        <KpiCard
          title="Fatturato anno"
          value={formatEur(stats?.fatturato_anno || 0)}
          valueAsString
          icon={Euro}
          delta={`${stats?.fatturato_mensile?.[stats.fatturato_mensile.length - 2]?.num_fatture || 0} fatture mese scorso`}
          deltaPositive
          gradient="from-violet-500/10 to-purple-500/5"
        />
        <KpiCard
          title="Pratiche (SQLite)"
          value={pratiche.length}
          icon={AlertTriangle}
          delta={`${pratiche_urgenti.length} urgenti`}
          danger={pratiche_urgenti.length > 0}
          gradient="from-amber-500/10 to-orange-500/5"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fatturato chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base">Andamento fatturato</CardTitle>
                <CardDescription>
                  {selectedYear} · {displayData.length} {displayData.length === 1 ? "mese" : "mesi"}
                </CardDescription>
              </div>
              <Badge variant="secondary">
                <TrendingUp className="h-3 w-3 mr-1" />
                {displayData.reduce((sum, d) => sum + d.num_fatture, 0)} fatture periodo
              </Badge>
            </div>

            {/* Year selector */}
            <div className="flex items-center gap-1.5 mt-3">
              {availableYears.map((y) => (
                <button
                  key={y}
                  onClick={() => { setSelectedYear(y); setSelectedMonths([]); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedYear === y
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* Month selector */}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {MONTHS.map((m, i) => {
                const hasData = filteredChartData[i] && filteredChartData[i].fatturato > 0;
                const isSelected = selectedMonths.length === 0 || selectedMonths.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleMonth(i)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      !hasData
                        ? "text-muted-foreground/30 cursor-default"
                        : isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground/40"
                    }`}
                    disabled={!hasData}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={displayData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFatt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="mese"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <RTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="fatturato"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#colorFatt)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ricavi per tipo */}
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
                    <span className="font-medium text-gray-700">{r.tipo_fattu || "—"}</span>
                    <span className="text-gray-500 text-xs">{Number(r.num).toLocaleString("it-IT")} doc.</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{formatEur(r.totale)}</p>
                </div>
              );
            })}
            {(!stats?.ricavi_per_tipo?.length) && (
              <p className="text-gray-400 text-sm">Nessun dato disponibile</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map + AI Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Anchor className="h-4 w-4" />
                Navi in arrivo
              </CardTitle>
              <CardDescription>Tracking AIS in tempo reale · 3 vessel monitorati</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live AIS
            </Badge>
          </CardHeader>
          <CardContent className="pb-3">
            <MapNavi />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              AI Activity
            </CardTitle>
            <CardDescription>{AGENT_RUNS_MOCK.length} run eseguite oggi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 pb-3">
            {AGENT_RUNS_MOCK.map((run) => (
              <AgentRunItem key={run.id} run={run} />
            ))}
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/ai"
              className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors"
            >
              Apri AI Console
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Pratiche urgenti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* I miei task */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                I miei task
              </CardTitle>
              <CardDescription>
                {myTasks.filter(t => t.stato !== "completato").length} attivi · {myTasks.filter(t => t.stato === "completato").length} completati
              </CardDescription>
            </div>
            {myTasks.filter(t => t.priorita === "urgente" && t.stato !== "completato").length > 0 && (
              <Badge variant="destructive" className="h-5 text-[10px]">
                {myTasks.filter(t => t.priorita === "urgente" && t.stato !== "completato").length} urgenti
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2 pb-3">
            {myTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Nessun task assegnato
              </p>
            ) : (
              myTasks.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-start gap-2 text-xs">
                  <div
                    className={cn(
                      "mt-0.5 h-3.5 w-3.5 rounded-full border shrink-0",
                      t.stato === "completato" ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30",
                      t.priorita === "urgente" && t.stato !== "completato" && "border-red-500"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-medium truncate", t.stato === "completato" && "line-through text-muted-foreground")}>
                      {t.titolo}
                    </p>
                    {t.scadenza && t.stato !== "completato" && (
                      <p className="text-muted-foreground">
                        Scadenza {new Date(t.scadenza).toLocaleDateString("it-IT")}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className={cn(
                    "h-4 text-[9px] shrink-0",
                    t.priorita === "urgente" && "bg-red-500/10 text-red-600 border-red-500/30"
                  )}>
                    {t.priorita}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/tasks"
              className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors"
            >
              Gestisci task
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Da approvare */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Da approvare
              </CardTitle>
              <CardDescription>
                Output agenti AI in attesa di revisione
              </CardDescription>
            </div>
            {pendingCount > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 h-5 text-[10px]">
                <Clock className="h-3 w-3" />
                {pendingCount}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            {pendingCount > 0 ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingCount === 1 ? "approvazione in attesa" : "approvazioni in attesa"}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-500 mb-1" />
                <p className="text-xs text-muted-foreground">Nessuna approvazione in attesa</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0">
            <Link
              href="/approvazioni"
              className="inline-flex w-full h-8 items-center justify-center gap-1.5 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-muted hover:text-foreground transition-colors"
            >
              {pendingCount > 0 ? "Revisiona output" : "Vedi storico"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Pratiche urgenti */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pratiche urgenti</CardTitle>
          <CardDescription>
            Pratiche con priorità alta o critica che richiedono attenzione
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {pratiche_urgenti.length > 0 ? pratiche_urgenti.map((p) => (
              <Link
                key={p.id}
                href={`/pratiche/${p.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                    p.urgenza === "critica"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-warning/15 text-warning",
                  )}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold">#{p.id}</p>
                    <Badge variant="outline" className="text-[10px] h-5">
                      Step {p.step_corrente}/12
                    </Badge>
                    <Badge
                      variant={p.urgenza === "critica" ? "destructive" : "secondary"}
                      className="text-[10px] h-5"
                    >
                      {p.urgenza}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{p.cliente}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-xs text-muted-foreground">
                    {p.n_container}× {p.tipo_container} · {p.compagnia_navigazione}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ETA {p.eta_italia || "—"}
                  </p>
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

function KpiCard({
  title,
  value,
  valueAsString,
  icon: Icon,
  delta,
  deltaPositive,
  danger,
  gradient,
}: {
  title: string;
  value: number | string;
  valueAsString?: boolean;
  icon: React.ElementType;
  delta?: string;
  deltaPositive?: boolean;
  danger?: boolean;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn("relative overflow-hidden", gradient && "bg-gradient-to-br", gradient)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {title}
            </div>
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                danger ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {valueAsString ? value : value}
          </div>
          {delta && (
            <div
              className={cn(
                "mt-2 text-xs flex items-center gap-1",
                deltaPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              {deltaPositive && <TrendingUp className="h-3 w-3" />}
              {delta}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
          {run.praticaNumero && (
            <span className="text-muted-foreground">·</span>
          )}
          {run.praticaNumero && (
            <span className="text-muted-foreground truncate">{run.praticaNumero}</span>
          )}
        </div>
        {run.output && (
          <p className="text-muted-foreground line-clamp-1 mt-0.5">{run.output}</p>
        )}
        {run.stato === "running" && (
          <p className="text-primary mt-0.5">In esecuzione…</p>
        )}
      </div>
    </div>
  );
}
