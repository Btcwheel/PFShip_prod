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
  BookOpen, Euro, TrendingUp, TrendingDown, Download, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOVIMENTI = [
  { data: "25/05/2026", descrizione: "Fattura FA-2026-00284 — Aurora Fashion Group", dare: 0, avere: 10272.4, stato: "aperto" },
  { data: "18/05/2026", descrizione: "Fattura FA-2026-00283 — Vesuvio Logistica", dare: 0, avere: 6392.8, stato: "aperto" },
  { data: "12/05/2026", descrizione: "Pagamento Maersk — Booking FB240598776", dare: 4850.0, avere: 0, stato: "chiuso" },
  { data: "08/05/2026", descrizione: "Fattura FA-2026-00282 — Magnolia Distribuzione", dare: 0, avere: 4819.0, stato: "aperto" },
  { data: "05/05/2026", descrizione: "Bonifico cliente — Galileo Import Export", dare: 79806.0, avere: 0, stato: "chiuso" },
  { data: "02/05/2026", descrizione: "Fattura FA-2026-00280 — Tessuti Mediterraneo", dare: 0, avere: 10272.4, stato: "pagato" },
  { data: "28/04/2026", descrizione: "Spese terminal CT Napoli — Pratica PF-2026-0146", dare: 2640.0, avere: 0, stato: "da_pagare" },
];

export default function ContabilitaPage() {
  const totDare = MOVIMENTI.reduce((a, m) => a + m.dare, 0);
  const totAvere = MOVIMENTI.reduce((a, m) => a + m.avere, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Contabilità</h1>
          <p className="text-sm text-muted-foreground mt-1">Partita doppia · integrazione Ge.CO · scadenzario</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Esporta</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="Totale dare" value={`€ ${totDare.toLocaleString()}`} />
        <QuickStat label="Totale avere" value={`€ ${totAvere.toLocaleString()}`} />
        <QuickStat label="Fatture aperte" value={MOVIMENTI.filter(m => m.stato === "aperto" || m.stato === "da_pagare").length} />
        <QuickStat label="Saldo" value={`€ ${(totAvere - totDare).toLocaleString()}`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prima nota movimenti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Data</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead className="text-right">Dare</TableHead>
                <TableHead className="text-right">Avere</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOVIMENTI.map((m, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{m.data}</TableCell>
                  <TableCell className="text-sm">{m.descrizione}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-destructive">{m.dare ? `€ ${m.dare.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600">{m.avere ? `€ ${m.avere.toLocaleString()}` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      m.stato === "chiuso" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                      m.stato === "aperto" && "bg-amber-500/10 text-amber-700 dark:text-amber-300",
                      m.stato === "pagato" && "bg-blue-500/10 text-blue-700 dark:text-blue-300",
                      m.stato === "da_pagare" && "bg-destructive/10 text-destructive",
                    )}>{m.stato}</Badge>
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
