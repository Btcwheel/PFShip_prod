"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Anchor, AlertTriangle, DollarSign, MapPin, ArrowRight, Sparkles,
} from "lucide-react";
import { TERMINAL_MOCK } from "@/lib/mock-data";
import Link from "next/link";
import { cn } from "@/lib/utils";

function formatEur(n: number) { return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n); }

const STATO_LABEL: Record<string, string> = {
  in_sosta: "In sosta",
  in_trasferimento: "In trasferimento",
  uscito: "Uscito",
  consegnato: "Consegnato",
};

const ALERT_COLORS: Record<string, string> = {
  ok: "text-emerald-600 dark:text-emerald-400",
  costo_alto: "text-destructive",
  scadenza_vicina: "text-warning",
};

export default function TerminalPage() {
  const totaleGiornaliero = TERMINAL_MOCK.filter(t => t.stato === "in_sosta" || t.stato === "in_trasferimento").reduce((a, t) => a + t.costoGiornaliero, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Terminal</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitoraggio container ai terminal · movimenti · costi sosta</p>
        </div>
        <Button size="sm" variant="outline">
          <MapPin className="h-4 w-4" /> Trasferisci container
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="In sosta" value={TERMINAL_MOCK.filter(t => t.stato === "in_sosta").length} />
        <QuickStat label="In trasferimento" value={TERMINAL_MOCK.filter(t => t.stato === "in_trasferimento").length} />
        <QuickStat label="Costo giornaliero" value={formatEur(totaleGiornaliero)} />
        <QuickStat label="Alert" value={TERMINAL_MOCK.filter(t => t.alert !== "ok").length} danger />
      </div>

      {/* Terminal cost alert */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong>2 container</strong> in sosta da 8 giorni a CT Napoli (110€/g). Costo cumulato: 2.640€. Suggerito trasferimento a Conateco (75€/g).
            <Button variant="link" size="sm" className="h-auto p-0 ml-2">Avvia trasferimento</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Container</TableHead>
                <TableHead>Pratica</TableHead>
                <TableHead>Terminal</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Arrivo</TableHead>
                <TableHead>Giorni</TableHead>
                <TableHead className="text-right">Costo/g</TableHead>
                <TableHead className="text-right">Cumulato</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TERMINAL_MOCK.map((t) => {
                const giorni = Math.ceil((Date.now() - new Date(t.arrivoTerminal).getTime()) / 86400000);
                return (
                  <TableRow key={t.id} className={t.alert !== "ok" ? "bg-destructive/5" : ""}>
                    <TableCell className="font-mono text-xs font-semibold">{t.containerNumber}</TableCell>
                    <TableCell>{t.praticaNumero}</TableCell>
                    <TableCell>{t.terminal}</TableCell>
                    <TableCell>{t.carrier}</TableCell>
                    <TableCell className="text-xs">{new Date(t.arrivoTerminal).toLocaleDateString("it-IT")}</TableCell>
                    <TableCell>{giorni}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatEur(t.costoGiornaliero)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatEur(t.costoCumulato)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{STATO_LABEL[t.stato]}</Badge>
                        <span className={cn("h-2 w-2 rounded-full", t.alert ? ALERT_COLORS[t.alert] : "")} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStat({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={cn("text-2xl font-bold", danger && "text-destructive")}>{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
