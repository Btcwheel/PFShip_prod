"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ScrollText, ShieldCheck, FileText, Sparkles, AlertTriangle, LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LOGS = [
  { data: "25/05/2026 11:23", utente: "Francesco Esposito", azione: "update", risorsa: "Pratica PF-2026-0147", dettaglio: "Stato cambiato da in_arrivo a in_terminal", icon: FileText },
  { data: "25/05/2026 11:20", utente: "AI:VesselTrackerAgent", azione: "ai", risorsa: "Pratica PF-2026-0148", dettaglio: "Posizione nave aggiornata: 36.5N 14.8E", icon: Sparkles },
  { data: "25/05/2026 10:45", utente: "Anna Romano", azione: "approve", risorsa: "Bolla BD-2026-00148", dettaglio: "Approvata bolla doganale", icon: ShieldCheck },
  { data: "25/05/2026 10:12", utente: "AI:TerminalAgent", azione: "alert", risorsa: "Terminal CT Napoli", dettaglio: "Alert costo alto: 3 container in sosta da 8gg", icon: AlertTriangle },
  { data: "25/05/2026 09:30", utente: "Luca De Marco", azione: "login", risorsa: "Sessione utente", dettaglio: "Login riuscito", icon: LogIn },
  { data: "25/05/2026 08:15", utente: "AI:CustomsFilerAgent", azione: "ai", risorsa: "Bolla BD-2026-00149", dettaglio: "Bolla precompilata per pratica PF-2026-0147", icon: Sparkles },
];

const VARIANTS: Record<string, string> = {
  update: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  ai: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  approve: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  alert: "bg-destructive/10 text-destructive",
  login: "bg-muted text-muted-foreground",
};

export default function AuditPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Registro cronologico di tutte le operazioni · append-only</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Data/Ora</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Azione</TableHead>
                <TableHead>Risorsa</TableHead>
                <TableHead>Dettaglio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LOGS.map((l, i) => {
                const Icon = l.icon;
                return (
                  <TableRow key={i}>
                    <TableCell className="text-xs whitespace-nowrap">{l.data}</TableCell>
                    <TableCell className="text-sm">{l.utente}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", VARIANTS[l.azione])}>
                        <Icon className="h-3 w-3" />
                        {l.azione}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{l.risorsa}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.dettaglio}</TableCell>
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
