"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Separator,
} from "@/components/ui/separator";
import { Save } from "lucide-react";

export default function ImpostazioniPage() {
  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurazione della piattaforma</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Azienda</CardTitle><CardDescription>Informazioni generali</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Ragione sociale</Label><Input defaultValue="PF Ship Srl" /></div>
            <div className="space-y-2"><Label>P.IVA</Label><Input defaultValue="IT01234567890" /></div>
            <div className="space-y-2"><Label>Indirizzo</Label><Input defaultValue="Via Brin 57, 80142 Napoli" /></div>
            <div className="space-y-2"><Label>Telefono</Label><Input defaultValue="+39 081 5567890" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">AI & Orchestrator</CardTitle><CardDescription>Configurazione agenti e modello</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Master Orchestrator attivo</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Gate umano su bolle doganali</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Gate umano su fatture</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Notifica cliente automatica per trasporti</Label><Switch defaultChecked /></div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2"><Label>Modello AI</Label><Select defaultValue="quixel-ai"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="quixel-ai">Quixel Ai</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Budget mensile AI (€)</Label><Input defaultValue="500" type="number" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Integrazioni</CardTitle><CardDescription>Connessione sistemi legacy</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Sincronizzazione Ge.FA (fatturazione)</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Sincronizzazione Ge.CO (contabilità)</Label><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><Label>Tracking AIS Marinetraffic</Label><Switch defaultChecked /></div>
        </CardContent>
      </Card>

      <Button size="sm"><Save className="h-4 w-4" /> Salva impostazioni</Button>
    </div>
  );
}
