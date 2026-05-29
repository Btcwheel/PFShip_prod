"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Download,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Sparkles,
  FileText,
} from "lucide-react";
import { PRATICHE_MOCK } from "@/lib/mock-data";
import type { PraticaStato, PraticaUrgenza } from "@/lib/types";
import { cn } from "@/lib/utils";

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

const STATO_VARIANT: Record<PraticaStato, string> = {
  bozza: "bg-muted text-muted-foreground border-border",
  booking_aperto: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  in_navigazione: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
  in_arrivo: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  in_dogana: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  in_terminal: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  sdoganata: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  in_consegna: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  consegnata: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  chiusa: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  fatturata: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
};

const URGENZA_VARIANT: Record<PraticaUrgenza, string> = {
  bassa: "text-muted-foreground",
  normale: "text-foreground",
  alta: "text-amber-600 dark:text-amber-400",
  critica: "text-destructive",
};

export default function PratichePage() {
  const [search, setSearch] = useState("");
  const [statoFilter, setStatoFilter] = useState<string | null>("all");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = PRATICHE_MOCK.filter((p) => {
    const matchSearch =
      !search ||
      p.numero.toLowerCase().includes(search.toLowerCase()) ||
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.nave.toLowerCase().includes(search.toLowerCase());
    const matchStato = statoFilter === "all" || p.stato === statoFilter;
    return matchSearch && matchStato;
  }).sort((a, b) => {
    const dA = new Date(a.etaItalia).getTime();
    const dB = new Date(b.etaItalia).getTime();
    return sortAsc ? dA - dB : dB - dA;
  });

  const handleExport = () => {
    const csv = [
      ["Numero", "Cliente", "Nave", "Viaggio", "Container", "Stato", "Step", "ETA", "Operatore"].join(","),
      ...filtered.map(p =>
        [p.numero, p.cliente, p.nave, p.viaggio, `${p.containerCount}x ${p.containerType}`, p.stato, `${p.stepCorrente}/12`, p.etaItalia, p.operatore].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pratiche_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = (id: string) => {
    alert(`Esportazione PDF per pratica ${id} — da implementare con generazione PDF lato server`);
  };

  const handleRunAI = (id: string) => {
    alert(`Esecuzione AI agent per pratica ${id} — chiamerà POST /api/agenti/step${id}/...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pratiche Import</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestione completa del ciclo di importazione · {PRATICHE_MOCK.length} pratiche totali
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Esporta
          </Button>
          <Button size="sm" onClick={() => alert("Creazione nuova pratica — da implementare con form/dialog")}>
            <Plus className="h-4 w-4" />
            Nuova pratica
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="Aperte" value={PRATICHE_MOCK.filter((p) => p.stato !== "chiusa" && p.stato !== "fatturata").length} />
        <QuickStat label="In dogana" value={PRATICHE_MOCK.filter((p) => p.stato === "in_dogana").length} />
        <QuickStat label="In terminal" value={PRATICHE_MOCK.filter((p) => p.stato === "in_terminal").length} />
        <QuickStat label="Da fatturare" value={PRATICHE_MOCK.filter((p) => p.stato === "consegnata").length} />
      </div>

      {/* Filters + table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per numero, cliente, nave…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statoFilter} onValueChange={setStatoFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-3.5 w-3.5" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                {Object.entries(STATO_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setSortAsc(!sortAsc)}>
              <ArrowUpDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-32">Numero</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Nave / Viaggio</TableHead>
                <TableHead className="text-center">Container</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead className="text-center">Step</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Operatore</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} className="cursor-pointer group">
                  <TableCell className="font-mono text-xs font-medium">
                    <Link href={`/pratiche/${p.id}`} className="hover:text-primary">
                      {p.numero}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/pratiche/${p.id}`} className="block">
                      <div className="font-medium text-sm">{p.cliente}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className={URGENZA_VARIANT[p.urgenza]}>●</span>
                        {p.urgenza}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{p.nave}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.compagnia} · {p.viaggio}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm font-medium">{p.containerCount}× {p.containerType}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", STATO_VARIANT[p.stato])}>
                      {STATO_LABEL[p.stato]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 text-xs">
                      <span className="font-semibold">{p.stepCorrente}</span>
                      <span className="text-muted-foreground">/12</span>
                    </div>
                    <div className="mt-1 h-1 w-12 mx-auto bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(p.stepCorrente / 12) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(p.etaItalia).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.operatore}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/pratiche/${p.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          Apri dettaglio
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRunAI(p.id)}>
                          <Sparkles className="h-3.5 w-3.5" />
                          Esegui AI agent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPDF(p.id)}>
                          <FileText className="h-3.5 w-3.5" />
                          Esporta PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
    <Card>
      <CardContent className="p-4">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}
