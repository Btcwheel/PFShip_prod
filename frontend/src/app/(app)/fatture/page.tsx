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
  Receipt, Euro, Download, Plus, Sparkles, TrendingUp,
} from "lucide-react";
import { FATTURE_MOCK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function formatEur(n: number) { return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n); }

const STATO_LABEL: Record<string, string> = {
  bozza: "Bozza",
  emessa: "Emessa",
  inviata: "Inviata",
  pagata: "Pagata",
  scaduta: "Scaduta",
};

const STATO_COLOR: Record<string, string> = {
  bozza: "bg-muted text-muted-foreground border-border",
  emessa: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  inviata: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  pagata: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  scaduta: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function FatturePage() {
  const totaleOpen = FATTURE_MOCK.filter(f => f.stato !== "pagata").reduce((a, f) => a + f.totale, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Fatturazione</h1>
          <p className="text-sm text-muted-foreground mt-1">Emissione fatture con AI · integrazione Ge.FA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Esporta</Button>
          <Button size="sm"><Plus className="h-4 w-4" /> Nuova fattura</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="Da emettere" value={FATTURE_MOCK.filter(f => f.stato === "bozza").length} />
        <QuickStat label="Emesse" value={FATTURE_MOCK.filter(f => f.stato === "emessa" || f.stato === "inviata").length} />
        <QuickStat label="Totale da incassare" value={formatEur(totaleOpen)} />
        <QuickStat label="Fatturato mese" value={formatEur(184350)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Fattura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pratica</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Scadenza</TableHead>
                <TableHead className="text-right">Imponibile</TableHead>
                <TableHead className="text-right">IVA</TableHead>
                <TableHead className="text-right">Totale</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>AI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FATTURE_MOCK.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs font-medium">{f.numero}</TableCell>
                  <TableCell className="text-sm">{f.cliente}</TableCell>
                  <TableCell className="text-xs">{f.praticaNumero}</TableCell>
                  <TableCell className="text-xs">{new Date(f.data).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell className="text-xs">{new Date(f.scadenza).toLocaleDateString("it-IT")}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatEur(f.imponibile)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatEur(f.iva)}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">{formatEur(f.totale)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", STATO_COLOR[f.stato])}>{STATO_LABEL[f.stato]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] gap-1"><Sparkles className="h-3 w-3" /> AI</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card><CardContent className="p-4"><div className="text-2xl font-bold">{value}</div><div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div></CardContent></Card>
  );
}
