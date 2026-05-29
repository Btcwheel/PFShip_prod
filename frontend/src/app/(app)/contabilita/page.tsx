"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend,
} from "recharts";
import {
  BookOpen, Euro, TrendingUp, TrendingDown, Download, Calendar,
} from "lucide-react";
import { FATTURATO_12M } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const MOVIMENTI = [
  { data: "25/05/2026", descrizione: "Fattura FA-2026-00284 — Aurora Fashion Group", dare: 0, avere: 10272.4, stato: "aperto", anno: "2026", mese: "05" },
  { data: "18/05/2026", descrizione: "Fattura FA-2026-00283 — Vesuvio Logistica", dare: 0, avere: 6392.8, stato: "aperto", anno: "2026", mese: "05" },
  { data: "12/05/2026", descrizione: "Pagamento Maersk — Booking FB240598776", dare: 4850.0, avere: 0, stato: "chiuso", anno: "2026", mese: "05" },
  { data: "08/05/2026", descrizione: "Fattura FA-2026-00282 — Magnolia Distribuzione", dare: 0, avere: 4819.0, stato: "aperto", anno: "2026", mese: "05" },
  { data: "05/05/2026", descrizione: "Bonifico cliente — Galileo Import Export", dare: 79806.0, avere: 0, stato: "chiuso", anno: "2026", mese: "05" },
  { data: "02/05/2026", descrizione: "Fattura FA-2026-00280 — Tessuti Mediterraneo", dare: 0, avere: 10272.4, stato: "pagato", anno: "2026", mese: "05" },
  { data: "28/04/2026", descrizione: "Spese terminal CT Napoli — Pratica PF-2026-0146", dare: 2640.0, avere: 0, stato: "da_pagare", anno: "2026", mese: "04" },
  { data: "15/04/2026", descrizione: "Fattura FA-2026-00278 — Sirena Trade Co.", dare: 0, avere: 8450.0, stato: "pagato", anno: "2026", mese: "04" },
  { data: "10/04/2026", descrizione: "Pagamento dogana — Pratica PF-2026-0145", dare: 3200.0, avere: 0, stato: "chiuso", anno: "2026", mese: "04" },
  { data: "22/03/2026", descrizione: "Fattura FA-2026-00275 — Etna Casalinghi", dare: 0, avere: 12340.0, stato: "pagato", anno: "2026", mese: "03" },
  { data: "18/03/2026", descrizione: "Spese trasporto — Pratica PF-2026-0143", dare: 1850.0, avere: 0, stato: "chiuso", anno: "2026", mese: "03" },
  { data: "05/02/2026", descrizione: "Fattura FA-2026-00270 — Lago Maggiore Import", dare: 0, avere: 9870.0, stato: "pagato", anno: "2026", mese: "02" },
  { data: "28/01/2026", descrizione: "Pagamento terminal — Pratica PF-2026-0140", dare: 2100.0, avere: 0, stato: "chiuso", anno: "2026", mese: "01" },
  { data: "15/12/2025", descrizione: "Fattura FA-2025-00268 — Partenope Forniture", dare: 0, avere: 11200.0, stato: "pagato", anno: "2025", mese: "12" },
  { data: "10/12/2025", descrizione: "Pagamento Maersk — Booking FB240598770", dare: 5200.0, avere: 0, stato: "chiuso", anno: "2025", mese: "12" },
];

const ANNI = ["2026", "2025", "2024"];
const MESI = [
  { value: "", label: "Tutti i mesi" },
  { value: "01", label: "Gennaio" },
  { value: "02", label: "Febbraio" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Aprile" },
  { value: "05", label: "Maggio" },
  { value: "06", label: "Giugno" },
  { value: "07", label: "Luglio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Settembre" },
  { value: "10", label: "Ottobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Dicembre" },
];

const MESI_LABEL = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];

export default function ContabilitaPage() {
  const [anno, setAnno] = useState("2026");
  const [mese, setMese] = useState("");
  const [filtroStato, setFiltroStato] = useState("");

  const filtered = MOVIMENTI.filter((m) => {
    if (m.anno !== anno) return false;
    if (mese && m.mese !== mese) return false;
    if (filtroStato && m.stato !== filtroStato) return false;
    return true;
  });

  const totDare = filtered.reduce((a, m) => a + m.dare, 0);
  const totAvere = filtered.reduce((a, m) => a + m.avere, 0);
  const saldo = totAvere - totDare;

  // Chart data: monthly dare/avere for selected year
  const chartData = MESI_LABEL.map((m, i) => {
    const meseNum = String(i + 1).padStart(2, "0");
    const meseMov = MOVIMENTI.filter((mv) => mv.anno === anno && mv.mese === meseNum);
    return {
      mese: m,
      dare: meseMov.reduce((a, mv) => a + mv.dare, 0),
      avere: meseMov.reduce((a, mv) => a + mv.avere, 0),
    };
  }).filter((d) => d.dare > 0 || d.avere > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Contabilità</h1>
          <p className="text-sm text-muted-foreground mt-1">Partita doppia · integrazione Ge.CO · scadenzario</p>
        </div>
        <Button variant="outline" size="sm"><Download className="h-4 w-4" /> Esporta</Button>
      </div>

      {/* Storico annuale/mensile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Storico movimenti
          </CardTitle>
          <CardDescription>Andamento dare/avere per mese</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <div className="w-40">
              <Select value={anno} onValueChange={(v) => setAnno(v ?? "2026")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ANNI.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={mese} onValueChange={(v) => setMese(v ?? "")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MESI.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="mese" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend />
              <Bar dataKey="dare" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Dare" />
              <Bar dataKey="avere" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Avere" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stats periodo selezionato */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="Totale dare" value={`€ ${totDare.toLocaleString()}`} />
        <QuickStat label="Totale avere" value={`€ ${totAvere.toLocaleString()}`} />
        <QuickStat label="Fatture aperte" value={filtered.filter(m => m.stato === "aperto" || m.stato === "da_pagare").length} />
        <QuickStat label="Saldo" value={`€ ${saldo.toLocaleString()}`} positive={saldo >= 0} />
      </div>

      {/* Tabella movimenti */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Prima nota movimenti</CardTitle>
            <div className="flex gap-2">
              <Select value={filtroStato} onValueChange={(v) => setFiltroStato(v ?? "")}>
                <SelectTrigger className="w-36 h-8"><SelectValue placeholder="Stato" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutti gli stati</SelectItem>
                  <SelectItem value="aperto">Aperto</SelectItem>
                  <SelectItem value="chiuso">Chiuso</SelectItem>
                  <SelectItem value="pagato">Pagato</SelectItem>
                  <SelectItem value="da_pagare">Da pagare</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nessun movimento per il periodo selezionato</TableCell></TableRow>
              ) : (
                filtered.map((m, i) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStat({ label, value, positive }: { label: string; value: string | number; positive?: boolean }) {
  return (
    <Card><CardContent className="p-4"><div className={cn("text-2xl font-bold", positive === true && "text-emerald-600", positive === false && "text-destructive")}>{value}</div><div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div></CardContent></Card>
  );
}