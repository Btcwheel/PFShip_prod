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
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from "recharts";
import {
  Receipt, Euro, Download, Plus, Sparkles, TrendingUp, Calendar,
} from "lucide-react";
import { FATTURE_MOCK, FATTURATO_12M } from "@/lib/mock-data";
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

export default function FatturePage() {
  const [anno, setAnno] = useState("2026");
  const [mese, setMese] = useState("");
  const [filtroStato, setFiltroStato] = useState("");

  const filtered = FATTURE_MOCK.filter((f) => {
    const d = new Date(f.data);
    const fAnno = d.getFullYear().toString();
    const fMese = String(d.getMonth() + 1).padStart(2, "0");
    if (fAnno !== anno) return false;
    if (mese && fMese !== mese) return false;
    if (filtroStato && f.stato !== filtroStato) return false;
    return true;
  });

  const totaleEmesso = filtered.filter(f => f.stato !== "bozza").reduce((a, f) => a + f.totale, 0);
  const totaleIncassato = filtered.filter(f => f.stato === "pagata").reduce((a, f) => a + f.totale, 0);
  const totaleDaIncassare = filtered.filter(f => f.stato !== "pagata" && f.stato !== "bozza").reduce((a, f) => a + f.totale, 0);

  const chartData = FATTURATO_12M.filter((r) => {
    const [, yearStr] = r.mese.split(" ");
    return yearStr === anno;
  }).map((r) => ({
    mese: r.mese.split(" ")[0],
    fatturato: r.fatturato,
    marginalita: r.marginalita,
  }));

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

      {/* Filtri anno/mese */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Storico fatturato
          </CardTitle>
          <CardDescription>Andamento mensile con marginalità %</CardDescription>
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
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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

      {/* Stats periodo selezionato */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="Fatture periodo" value={filtered.length} />
        <QuickStat label="Totale emesso" value={formatEur(totaleEmesso)} />
        <QuickStat label="Totale incassato" value={formatEur(totaleIncassato)} />
        <QuickStat label="Da incassare" value={formatEur(totaleDaIncassare)} />
      </div>

      {/* Tabella fatture */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base">Elenco fatture</CardTitle>
            <div className="flex gap-2">
              <Select value={filtroStato} onValueChange={(v) => setFiltroStato(v ?? "")}>
                <SelectTrigger className="w-36 h-8"><SelectValue placeholder="Stato" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutti gli stati</SelectItem>
                  {Object.entries(STATO_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
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
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nessuna fattura trovata per il periodo selezionato</TableCell></TableRow>
              ) : (
                filtered.map((f) => (
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
                ))
              )}
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