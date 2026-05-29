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
  Truck, CalendarDays, Phone, MapPin, CheckCircle2, Clock, AlertTriangle, Send, Sparkles,
} from "lucide-react";
import { TRASPORTI_MOCK } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STATO_LABEL: Record<string, string> = {
  schedulato: "Schedulato",
  notificato_cliente: "Notificato",
  confermato: "Confermato",
  in_transito: "In transito",
  consegnato: "Consegnato",
  annullato: "Annullato",
};

const STATO_COLOR: Record<string, string> = {
  schedulato: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  notificato_cliente: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  confermato: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  in_transito: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  consegnato: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  annullato: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function TrasportiPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Trasporti</h1>
          <p className="text-sm text-muted-foreground mt-1">Spedizione terrestre · calendario vettori · conferma cliente</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => alert("Calendario interattivo — da implementare con vista calendario")}><CalendarDays className="h-4 w-4" /> Calendario</Button>
          <Button size="sm" onClick={() => alert("Creazione nuovo trasporto — da implementare con form")}><Truck className="h-4 w-4" /> Nuovo trasporto</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="Da schedulare" value={TRASPIORTI_MOCK.filter(t => t.stato === "schedulato").length} />
        <QuickStat label="In attesa conferma" value={TRASPIORTI_MOCK.filter(t => t.stato === "notificato_cliente").length} />
        <QuickStat label="Confermati" value={TRASPIORTI_MOCK.filter(t => t.stato === "confermato").length} />
        <QuickStat label="Consegnati" value={TRASPIORTI_MOCK.filter(t => t.stato === "consegnato").length} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Container</TableHead>
                <TableHead>Pratica</TableHead>
                <TableHead>Vettore</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Destinazione</TableHead>
                <TableHead>Data/ora</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Cliente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRASPORTI_MOCK.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs font-semibold">{t.containerNumber}</TableCell>
                  <TableCell>{t.praticaNumero}</TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{t.vettore}</div>
                  </TableCell>
                  <TableCell className="text-xs">{t.pickup}</TableCell>
                  <TableCell className="text-xs">{t.destinazione}</TableCell>
                  <TableCell className="text-xs">
                    {new Date(t.dataPickup).toLocaleDateString("it-IT")}
                    <div className="text-muted-foreground">{t.oraSlot}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", STATO_COLOR[t.stato])}>
                      {STATO_LABEL[t.stato]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{t.cliente}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Calendar placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendario spedizioniere
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center bg-muted/20 rounded-lg border border-dashed">
          <div className="text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Calendario interattivo con slot vettori e conferme cliente</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => alert("Notifica cliente per conferma trasporto — invierà email/SMS")}>
              <Send className="h-4 w-4" /> Notifica cliente per conferma
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const TRASPIORTI_MOCK = TRASPORTI_MOCK;

function QuickStat({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="p-4"><div className="text-2xl font-bold">{value}</div><div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div></CardContent></Card>
  );
}
