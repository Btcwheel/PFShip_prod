"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Truck,
  Sparkles,
  Download,
  ChevronRight,
} from "lucide-react";
import { PRATICHE_MOCK } from "@/lib/mock-data";
import type { PraticaStato } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Analisi email", agent: "EmailReader" },
  { n: 2, label: "Apri pratica", agent: "BookingAgent" },
  { n: 3, label: "Monitora nave", agent: "VesselTracker" },
  { n: 4, label: "Richiedi documenti", agent: "DocRequestAgent" },
  { n: 5, label: "Controlla documenti", agent: "DocCheckAgent" },
  { n: 6, label: "Bolla doganale", agent: "CustomsFilerAgent" },
  { n: 7, label: "Delivery order", agent: "DOAgent" },
  { n: 8, label: "Pagamento fatture", agent: "PaymentAgent" },
  { n: 9, label: "Booking trasporto", agent: "TransportAgent" },
  { n: 10, label: "Consegna", agent: "DeliveryAgent" },
  { n: 11, label: "Fatturazione", agent: "InvoiceAgent" },
  { n: 12, label: "Contabilità", agent: "AccountingAgent" },
];

const STATO_LABEL: Record<PraticaStato, string> = {
  bozza: "Bozza",
  booking_aperto: "Booking aperto",
  in_navigazione: "In navigazione",
  in_arrivo: "In arrivo",
  in_dogana: "In dogana",
  in_terminal: "In terminal",
  sdoganata: "Sdoganata",
  in_consegna: "In consegna",
  consegnata: "Consegnata",
  chiusa: "Chiusa",
  fatturata: "Fatturata",
};

export default function PraticaDettaglioPage() {
  const params = useParams();
  const router = useRouter();
  const pratica = PRATICHE_MOCK.find((p) => p.id === params.id);
  const [activeTab, setActiveTab] = useState("generale");

  if (!pratica) {
    return (
      <div className="p-6">
        <Link href="/pratiche" className="inline-flex h-8 items-center justify-center rounded-lg text-sm font-medium hover:bg-muted px-2 gap-1.5"><ArrowLeft className="h-4 w-4" /> Torna alle pratiche</Link>
        <div className="mt-8 text-center text-muted-foreground">Pratica non trovata</div>
      </div>
    );
  }

  const stepPos = pratica.stepCorrente - 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{pratica.numero}</h1>
              <Badge variant="outline" className="text-[10px]">{pratica.compagnia}</Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  pratica.urgenza === "critica" && "bg-destructive",
                  pratica.urgenza === "alta" && "bg-warning",
                  pratica.urgenza === "normale" && "bg-muted-foreground",
                )} />
                {pratica.urgenza}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{pratica.cliente}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Sparkles className="h-4 w-4" />
            Esegui prossimo step
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4" />
            Scarica riepilogo
          </Button>
        </div>
      </div>

      {/* Stepper workflow */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-0 overflow-x-auto">
            {STEPS.map((s, i) => {
              const completed = i < stepPos;
              const current = i === stepPos;
              return (
                <div key={s.n} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                      completed && "bg-primary border-primary text-primary-foreground",
                      current && "border-primary text-primary ring-2 ring-primary/30",
                      !completed && !current && "border-border text-muted-foreground",
                    )}>
                      {completed ? <CheckCircle2 className="h-4 w-4" /> : s.n}
                    </div>
                    <div className="text-[10px] text-center whitespace-nowrap">
                      <div className="font-medium">{s.label}</div>
                      <div className="text-muted-foreground">{s.agent}</div>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "w-8 md:w-12 h-0.5 mx-1 mt-[-18px]",
                      i < stepPos ? "bg-primary" : "bg-border",
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs row */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generale">Generale</TabsTrigger>
          <TabsTrigger value="documenti">Documenti</TabsTrigger>
          <TabsTrigger value="eventi">Timeline</TabsTrigger>
          <TabsTrigger value="ai">AI Agent</TabsTrigger>
        </TabsList>

        <TabsContent value="generale" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard label="Shipper" value={pratica.shipper} />
            <InfoCard label="Porto carico" value={pratica.portoCarico} />
            <InfoCard label="Porto scarico" value={pratica.portoScarico} />
            <InfoCard label="Nave" value={pratica.nave} />
            <InfoCard label="Viaggio" value={pratica.viaggio} />
            <InfoCard label="MMSI" value={pratica.mmsi || "—"} />
            <InfoCard label="B/L Number" value={pratica.blNumber} />
            <InfoCard label="Booking N°" value={pratica.bookingNumber} />
            <InfoCard label="Container" value={`${pratica.containerCount}× ${pratica.containerType}`} />
            <InfoCard label="Peso totale" value={`${(pratica.pesoKg / 1000).toFixed(2)} t`} />
            <InfoCard label="Valore dichiarato" value={`€ ${pratica.valoreEur.toLocaleString()}`} />
            <InfoCard label="Descrizione merce" value={pratica.descrizioneMerce} className="md:col-span-2 lg:col-span-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">ETD Cina</CardTitle></CardHeader>
              <CardContent><div className="text-lg font-semibold">{new Date(pratica.etdCina).toLocaleDateString("it-IT")}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">ETA Italia</CardTitle></CardHeader>
              <CardContent><div className="text-lg font-semibold">{new Date(pratica.etaItalia).toLocaleDateString("it-IT")}</div></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documenti" className="mt-4">
          <Card>
            <CardContent className="divide-y p-0">
              {pratica.documenti.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nessun documento caricato
                </div>
              )}
              {pratica.documenti.map((d) => (
                <div key={d.id} className="flex items-center gap-4 p-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {(d.size / 1024).toFixed(0)} KB · caricato da {d.uploadedBy}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eventi" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                {pratica.eventi.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nessun evento registrato
                  </div>
                ) : (
                  <div className="space-y-0">
                    {pratica.eventi.map((e) => (
                      <div key={e.id} className="relative flex gap-4 p-4">
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border">
                          {e.tipo === "creazione" && <FileText className="h-3.5 w-3.5 text-primary" />}
                          {e.tipo === "step_completato" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          {e.tipo === "documento_caricato" && <FileText className="h-3.5 w-3.5 text-chart-2" />}
                          {e.tipo === "ai_eseguito" && <Sparkles className="h-3.5 w-3.5 text-primary" />}
                          {e.tipo === "alert" && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{e.attore}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(e.timestamp).toLocaleString("it-IT")}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{e.testo}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <Sparkles className="h-10 w-10 mx-auto text-primary" />
              <div className="text-lg font-semibold">Master Orchestrator — Pratica #{pratica.numero}</div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                L&apos;AI ha completato gli step 1-{stepPos + 1}. Il prossimo agente da eseguire è{" "}
                <strong className="text-foreground">{STEPS[stepPos + 1]?.label || "—"}</strong>.
              </p>
              <Button>
                <Sparkles className="h-4 w-4" />
                Esegui {STEPS[stepPos + 1]?.agent || "prossimo agente"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-sm font-medium">{value}</div></CardContent>
    </Card>
  );
}
