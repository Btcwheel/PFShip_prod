"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Search, Plus, Stamp, FileDown, CheckCircle2, AlertTriangle, Clock, Sparkles,
} from "lucide-react";
import { BOLLE_MOCK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STATO_VARIANT: Record<string, string> = {
  bozza: "bg-muted text-muted-foreground border-border",
  in_approvazione: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  inviata: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  accettata: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  respinta: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatEur(n: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);
}

export default function BollePage() {
  const [search, setSearch] = useState("");
  const [statoFilter, setStatoFilter] = useState<string | null>("all");

  const filtered = BOLLE_MOCK.filter((b) => {
    const ms = !search || b.numero.includes(search) || b.cliente.toLowerCase().includes(search.toLowerCase());
    const mf = statoFilter === "all" || b.stato === statoFilter;
    return ms && mf;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Bolle Doganali</h1>
          <p className="text-sm text-muted-foreground mt-1">Precompilazione AI · workflow approvazione · invio PRADO</p>
        </div>
        <Button size="sm"><Stamp className="h-4 w-4" /> Nuova bolla</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="Bozze" value={BOLLE_MOCK.filter((b) => b.stato === "bozza").length} />
        <QuickStat label="In approvazione" value={BOLLE_MOCK.filter((b) => b.stato === "in_approvazione").length} />
        <QuickStat label="Inviate" value={BOLLE_MOCK.filter((b) => b.stato === "inviata").length} />
        <QuickStat label="Accettate" value={BOLLE_MOCK.filter((b) => b.stato === "accettata").length} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cerca bolla…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statoFilter} onValueChange={setStatoFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                <SelectItem value="bozza">Bozza</SelectItem>
                <SelectItem value="in_approvazione">In approvazione</SelectItem>
                <SelectItem value="inviata">Inviata</SelectItem>
                <SelectItem value="accettata">Accettata</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Numero</TableHead>
                <TableHead>Pratica</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Container</TableHead>
                <TableHead>Valore</TableHead>
                <TableHead>Dazi + IVA</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>AI Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.numero}</TableCell>
                  <TableCell>{b.praticaNumero}</TableCell>
                  <TableCell>{b.cliente}</TableCell>
                  <TableCell>{b.containerCount} cnt</TableCell>
                  <TableCell className="font-mono text-xs">{formatEur(b.valoreEur)}</TableCell>
                  <TableCell className="font-mono text-xs">{formatEur(b.daziEur + b.ivaEur)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", STATO_VARIANT[b.stato])}>{b.stato}</Badge>
                  </TableCell>
                  <TableCell>
                    {b.precompilataDa?.startsWith("AI") && (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <Sparkles className="h-3 w-3" /> AI
                      </Badge>
                    )}
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
function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="p-4"><div className="text-2xl font-bold">{value}</div><div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div></CardContent></Card>
  );
}
