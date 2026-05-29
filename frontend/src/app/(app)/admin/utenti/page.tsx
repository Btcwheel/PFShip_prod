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
  Avatar, AvatarFallback,
} from "@/components/ui/avatar";
import { ShieldCheck, Users, Briefcase, Plus } from "lucide-react";

const UTENTI = [
  { id: "u1", nome: "Francesco Esposito", email: "f.esposito@pfship.it", ruolo: "Super Admin", team: "Amministrazione", stato: "attivo" },
  { id: "u2", nome: "Anna Romano", email: "a.romano@pfship.it", ruolo: "Manager", team: "Import", stato: "attivo" },
  { id: "u3", nome: "Luca De Marco", email: "l.demarco@pfship.it", ruolo: "Operatore", team: "Import", stato: "attivo" },
  { id: "u4", nome: "Giovanni Bianchi", email: "g.bianchi@pfship.it", ruolo: "Manager", team: "Dogana", stato: "attivo" },
  { id: "u5", nome: "Maria Ferrara", email: "m.ferrara@pfship.it", ruolo: "Operatore", team: "Dogana", stato: "attivo" },
  { id: "u6", nome: "Antonio Esposito", email: "a.esposito@pfship.it", ruolo: "Operatore", team: "Terminal", stato: "inattivo" },
  { id: "u7", nome: "Carla Rossi", email: "c.rossi@pfship.it", ruolo: "Manager", team: "Trasporti", stato: "attivo" },
  { id: "u8", nome: "Paolo Marino", email: "p.marino@pfship.it", ruolo: "Contabile", team: "Contabilità", stato: "attivo" },
];

const ROLE_ICON: Record<string, React.ElementType> = {
  "Super Admin": ShieldCheck,
  "Manager": Users,
  "Operatore": Briefcase,
  "Contabile": Users,
};

export default function UtentiPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utenti & Team</h1>
          <p className="text-sm text-muted-foreground mt-1">{UTENTI.length} utenti · 5 team</p>
        </div>
        <Button size="sm" onClick={() => alert("Creazione nuovo utente — da implementare con form/dialog")}><Plus className="h-4 w-4" /> Nuovo utente</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {["Amministrazione", "Import", "Dogana", "Terminal", "Trasporti", "Contabilità"].map((t) => (
          <Card key={t}>
            <CardContent className="p-4 text-center">
              <div className="font-bold">{UTENTI.filter((u) => u.team === t).length}</div>
              <div className="text-xs text-muted-foreground mt-1">{t}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Utente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Stato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {UTENTI.map((u) => {
                const Icon = ROLE_ICON[u.ruolo] || Users;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{u.nome.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{u.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1.5">
                        <Icon className="h-3 w-3" />
                        {u.ruolo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.team}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.stato === "attivo" ? "text-emerald-600" : "text-muted-foreground"}>{u.stato}</Badge>
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
