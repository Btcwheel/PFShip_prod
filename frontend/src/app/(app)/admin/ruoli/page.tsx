"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ShieldCheck, Eye, Edit, Trash2, Lock, Globe } from "lucide-react";

const RUOLI = [
  { nome: "Super Admin", utenti: 1, permessi: 48, descrizione: "Accesso completo a tutti i moduli e azioni", icon: ShieldCheck },
  { nome: "Manager Reparto", utenti: 3, permessi: 32, descrizione: "Supervisiona il proprio team, approva output AI", icon: Eye },
  { nome: "Operatore", utenti: 3, permessi: 18, descrizione: "Gestione pratiche proprie, view reparto", icon: Edit },
  { nome: "Contabile", utenti: 1, permessi: 14, descrizione: "Accesso pieno a fatture e contabilità, view pratiche", icon: Lock },
  { nome: "Sola lettura", utenti: 0, permessi: 8, descrizione: "Visualizzazione di tutti i moduli senza modifiche", icon: Globe },
];

export default function RuoliPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ruoli & Permessi</h1>
        <p className="text-sm text-muted-foreground mt-1">{RUOLI.length} ruoli configurati</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Ruolo</TableHead>
                <TableHead>Utenti</TableHead>
                <TableHead>Permessi</TableHead>
                <TableHead>Descrizione</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RUOLI.map((r) => {
                const Icon = r.icon;
                return (
                  <TableRow key={r.nome}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="font-medium">{r.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{r.utenti}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{r.permessi}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.descrizione}</TableCell>
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
