"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowRight,
  FileText,
} from "lucide-react";
import {
  getApprovazioni,
  getApprovazioniConteggio,
  approvaApprovazione,
  respingiApprovazione,
  type Approvazione,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

const AGENT_LABELS: Record<string, string> = {
  VesselTracker: "Monitoraggio Nave (Step 3)",
  DocRequest: "Richiesta Documenti (Step 4)",
  DocCheck: "Controllo Documenti (Step 5)",
  CustomsFiler: "Bolla Doganale (Step 6)",
  DOAgent: "Delivery Order (Step 7)",
  PaymentAgent: "Pagamento Fatture (Step 8)",
  TransportAgent: "Prenota Trasportatore (Step 9)",
  DeliveryAgent: "Conferma Consegna (Step 10)",
  InvoiceAgent: "Fatturazione (Step 11)",
  AccountingAgent: "Contabilità (Step 12)",
};

export default function ApprovazioniPage() {
  const [approvazioni, setApprovazioni] = useState<Approvazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState<"pending" | "tutte">("pending");
  const [note, setNote] = useState<Record<number, string>>({});
  const [processing, setProcessing] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getApprovazioni(filtroStato === "pending" ? "pending" : undefined);
      setApprovazioni(data);
    } catch {
      setApprovazioni([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filtroStato]);

  const handleApprova = async (id: number) => {
    setProcessing(id);
    try {
      await approvaApprovazione(id, note[id] || "");
      setNote((prev) => ({ ...prev, [id]: "" }));
      load();
    } catch {
      // ignore
    } finally {
      setProcessing(null);
    }
  };

  const handleRespingi = async (id: number) => {
    setProcessing(id);
    try {
      await respingiApprovazione(id, note[id] || "");
      setNote((prev) => ({ ...prev, [id]: "" }));
      load();
    } catch {
      // ignore
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = approvazioni.filter((a) => a.stato === "pending").length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Approvazioni</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revisione output degli agenti AI — ogni step richiede approvazione umana
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "gap-1.5 h-7",
            pendingCount > 0
              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
              : ""
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          {pendingCount} in attesa
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: "In attesa", value: "pending" as const },
          { label: "Tutte", value: "tutte" as const },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filtroStato === f.value ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFiltroStato(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {approvazioni.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
            Nessuna approvazione in attesa
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {approvazioni.map((a) => (
            <Card
              key={a.id}
              className={cn(
                a.stato === "pending" ? "border-amber-500/30" : "opacity-60"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {AGENT_LABELS[a.agente] || `${a.agente} (Step ${a.step_numero})`}
                      {a.stato === "pending" && (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 h-5 text-[10px]">
                          In attesa
                        </Badge>
                      )}
                      {a.stato === "approvato" && (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 h-5 text-[10px]">
                          Approvato {a.revisore ? `da ${a.revisore}` : ""}
                        </Badge>
                      )}
                      {a.stato === "respinto" && (
                        <Badge className="bg-red-500/10 text-red-600 border-red-500/30 h-5 text-[10px]">
                          Respinto
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {a.pratica_cliente ? (
                        <span>
                          Pratica {a.pratica_cliente}{" "}
                          {a.bl_number && `· B/L ${a.bl_number}`}
                          <Link
                            href={`/pratiche/${a.pratica_id}`}
                            className="ml-2 inline-flex items-center gap-1 text-xs hover:underline"
                          >
                            Apri pratica <ArrowRight className="h-3 w-3" />
                          </Link>
                        </span>
                      ) : (
                        `Pratica #${a.pratica_id}`
                      )}
                    </CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.creato_il).toLocaleString("it-IT")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium mb-1 text-muted-foreground">
                    Output AI:
                  </p>
                  <pre className="text-xs whitespace-pre-wrap font-mono max-h-48 overflow-auto">
                    {a.output_ai?.substring(0, 2000) || "—"}
                  </pre>
                </div>

                {a.note_revisore && (
                  <div className="bg-muted/30 rounded-lg p-2 mb-3 text-xs">
                    <span className="font-medium text-muted-foreground">Note revisore: </span>
                    {a.note_revisore}
                  </div>
                )}

                {a.stato === "pending" && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Note di revisione (opzionale)..."
                      rows={2}
                      className="text-xs"
                      value={note[a.id] || ""}
                      onChange={(e) =>
                        setNote((prev) => ({ ...prev, [a.id]: e.target.value }))
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleApprova(a.id)}
                        disabled={processing === a.id}
                      >
                        {processing === a.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Approva e avanza
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleRespingi(a.id)}
                        disabled={processing === a.id}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Respingi
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}