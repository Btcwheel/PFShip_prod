"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CheckCircle2, AlertTriangle, Clock, Zap,
  Play, StopCircle, RefreshCw, Database, FileText, Anchor,
  Truck, Stamp, Euro, Bot, ArrowRight, Brain,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENT_RUNS_MOCK, PRATICHE_MOCK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const AGENTS = [
  { id: "EmailReaderAgent", label: "Email Reader", icon: FileText, color: "text-blue-500", desc: "Legge email EML ed estrae dati ordine", team: "Import" },
  { id: "BookingAgent", label: "Booking Agent", icon: FileText, color: "text-cyan-500", desc: "Richiede e gestisce booking alla compagnia", team: "Import" },
  { id: "VesselTrackerAgent", label: "Vessel Tracker", icon: Anchor, color: "text-teal-500", desc: "Monitora AIS e calcola ETA stimato", team: "Import" },
  { id: "DocRequestAgent", label: "Doc Request", icon: FileText, color: "text-violet-500", desc: "Richiede documenti al cliente", team: "Import" },
  { id: "DocCheckAgent", label: "Doc Checker", icon: FileText, color: "text-indigo-500", desc: "Verifica completezza documentale", team: "Dogana" },
  { id: "CustomsFilerAgent", label: "Customs Filer", icon: Stamp, color: "text-amber-500", desc: "Precompila bolla doganale PRADO", team: "Dogana" },
  { id: "DOAgent", label: "DO Agent", icon: FileText, color: "text-orange-500", desc: "Richiede delivery order al carrier", team: "Import" },
  { id: "TerminalAgent", label: "Terminal Manager", icon: Database, color: "text-rose-500", desc: "Monitora costi terminal e suggerisce trasferimenti", team: "Terminal" },
  { id: "PaymentAgent", label: "Payment Agent", icon: Euro, color: "text-emerald-500", desc: "Gestisce pagamenti e verifiche fatture carrier", team: "Contabilità" },
  { id: "TransportAgent", label: "Transport Agent", icon: Truck, color: "text-sky-500", desc: "Booking trasporto terrestre + notifica cliente", team: "Trasporti" },
  { id: "DeliveryAgent", label: "Delivery Agent", icon: Truck, color: "text-lime-500", desc: "Conferma consegna e chiusura operativa", team: "Trasporti" },
  { id: "InvoiceAgent", label: "Invoice Agent", icon: Euro, color: "text-purple-500", desc: "Prepara fatturazione con voci AI", team: "Contabilità" },
  { id: "AccountingAgent", label: "Accounting Agent", icon: Database, color: "text-pink-500", desc: "Registra in contabilità e chiude pratica", team: "Contabilità" },
];

export default function AIConsolePage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [simStream, setSimStream] = useState<string>("");

  const simulateRun = (agentId: string) => {
    setRunningAgent(agentId);
    setSimStream("");
    const outputs = [
      "Analisi in corso…",
      "Recupero dati dal contesto pratica…",
      "Elaborazione con modello Claude Sonnet 4.6…",
      "Validazione output in corso…",
      "Master Orchestrator: verifico coerenza con stato pratica…",
    ];
    let i = 0;
    const int = setInterval(() => {
      if (i < outputs.length) {
        setSimStream((s) => s + `\n> ${outputs[i]}`);
        i++;
      } else {
        setSimStream(
          (s) =>
            s +
            "\n\n✅ Operazione completata. Output valido. " +
            "Master Orchestrator: APPROVATO. Stato pratica aggiornato.",
        );
        clearInterval(int);
        setRunningAgent(null);
      }
    }, 600);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">AI Console</h1>
            <Badge variant="secondary" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {AGENT_RUNS_MOCK.filter((r) => r.stato === "completed").length} run oggi
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Master Orchestrator · {AGENTS.length} agenti specializzati · Claude Sonnet 4.6
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><RefreshCw className="h-4 w-4" /> Aggiorna</Button>
          <Button size="sm" className="gap-1.5">
            <Brain className="h-4 w-4" />
            Orchestratore attivo
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="text-sm p-3 bg-primary/10 rounded-lg border border-primary/20 text-center">
          <div className="text-2xl font-bold text-primary">{AGENT_RUNS_MOCK.filter(r => r.stato === "completed").length}</div>
          <div className="text-xs text-muted-foreground mt-1">Oggi</div>
        </div>
        <div className="text-sm p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center">
          <div className="text-2xl font-bold text-emerald-600">€ 4.82</div>
          <div className="text-xs text-muted-foreground mt-1">Costo AI oggi</div>
        </div>
        <div className="text-sm p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
          <div className="text-2xl font-bold text-amber-600">1</div>
          <div className="text-xs text-muted-foreground mt-1">Da revisionare</div>
        </div>
        <div className="text-sm p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
          <div className="text-2xl font-bold text-blue-600">99.2%</div>
          <div className="text-xs text-muted-foreground mt-1">Validazione OK</div>
        </div>
        <div className="text-sm p-3 bg-violet-500/10 rounded-lg border border-violet-500/20 text-center">
          <div className="text-2xl font-bold text-violet-600">12</div>
          <div className="text-xs text-muted-foreground mt-1">Agenti attivi</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Agent list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Agent Registry
            </CardTitle>
            <CardDescription>
              {AGENTS.filter((a) => !selectedAgent || a.id === selectedAgent).length} agenti disponibili
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {AGENTS.map((a) => {
                  const run = AGENT_RUNS_MOCK.find((r) => r.agentName === a.id);
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAgent(a.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                        selectedAgent === a.id && "bg-muted",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4 shrink-0", a.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{a.label}</span>
                            <Badge variant="outline" className="text-[9px] h-4 px-1">{a.team}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{a.desc}</p>
                        </div>
                        {run && (
                          <div>
                            {run.stato === "completed" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            {run.stato === "needs_review" && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                            {run.stato === "running" && <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Agent detail + execution */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {selectedAgent
                    ? AGENTS.find((a) => a.id === selectedAgent)?.label
                    : "Seleziona un agente"}
                </CardTitle>
                <CardDescription>
                  {selectedAgent
                    ? AGENTS.find((a) => a.id === selectedAgent)?.desc
                    : "Clicca su un agente per vedere dettagli ed eseguirlo"}
                </CardDescription>
              </div>
              {selectedAgent && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSimStream("");
                      setRunningAgent(null);
                    }}
                  >
                    <StopCircle className="h-3.5 w-3.5" /> Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => simulateRun(selectedAgent)}
                    disabled={runningAgent !== null}
                    className="gap-1.5"
                  >
                    {runningAgent ? (
                      <>
                        <Zap className="h-3.5 w-3.5 animate-pulse" />
                        In esecuzione…
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Esegui agente
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedAgent ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                <Brain className="h-12 w-12 opacity-20" />
                <p className="text-sm">Seleziona un agente per iniziare</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Input mock */}
                <Card className="bg-muted/30">
                  <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase">Input</CardTitle></CardHeader>
                  <CardContent>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{
`{
  "pratica_id": "p001",
  "pratica": "PF-2026-0148",
  "cliente": "Tessuti Mediterraneo S.r.l.",
  "container": "2x 40HC",
  "nave": "BANGKOK EXPRESS",
  "eta": "28/05/2026"
}`}</pre>
                  </CardContent>
                </Card>

                {/* Output / streaming */}
                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs text-muted-foreground uppercase">Output stream</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] bg-muted/40 rounded-lg p-4 font-mono text-xs leading-relaxed overflow-auto">
                      {simStream ? (
                        <AnimatePresence>
                          {simStream.split("\n").map((line, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={cn(
                                "py-0.5",
                                line.startsWith("✅") && "text-emerald-600 dark:text-emerald-400",
                                line.startsWith("> Elaborazione") && "text-primary",
                                line.startsWith("> Validazione") && "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {line}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      ) : (
                        <div className="text-muted-foreground flex items-center gap-2 h-full">
                          <Clock className="h-4 w-4" />
                          Premete "Esegui agente" per vedere lo stream AI in tempo reale
                        </div>
                      )}
                      {runningAgent && (
                        <div className="mt-2">
                          <Progress value={65} className="h-1" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cost / tokens */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-xs p-2 rounded bg-muted/30 text-center">
                    <div className="font-semibold text-foreground">~4.2s</div>
                    <div className="text-muted-foreground">Tempo medio</div>
                  </div>
                  <div className="text-xs p-2 rounded bg-muted/30 text-center">
                    <div className="font-semibold text-foreground">~1,240</div>
                    <div className="text-muted-foreground">Token stimati</div>
                  </div>
                  <div className="text-xs p-2 rounded bg-muted/30 text-center">
                    <div className="font-semibold text-foreground">~€ 0.034</div>
                    <div className="text-muted-foreground">Costo per run</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Run history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cronologia esecuzioni oggi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {AGENT_RUNS_MOCK.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-sm">
                <div>
                  {r.stato === "completed" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {r.stato === "needs_review" && <AlertTriangle className="h-4 w-4 text-warning" />}
                  {r.stato === "running" && <Zap className="h-4 w-4 text-primary animate-pulse" />}
                </div>
                <div className="font-medium min-w-[120px]">{r.agentLabel}</div>
                {r.praticaNumero && (
                  <Badge variant="outline" className="text-[10px] font-mono">{r.praticaNumero}</Badge>
                )}
                <div className="flex-1 text-muted-foreground text-xs truncate">{r.output?.slice(0, 120)}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : ""}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {r.costoEur ? `€ ${r.costoEur.toFixed(3)}` : ""}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
