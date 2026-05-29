"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Save, CheckCircle2 } from "lucide-react";

export default function ImpostazioniPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    ragioneSociale: "PF Ship Srl",
    piva: "IT01234567890",
    indirizzo: "Via Brin 57, 80142 Napoli",
    telefono: "+39 081 5567890",
    orchestrator: true,
    gateBolle: true,
    gateFatture: true,
    notificaTrasporti: true,
    modello: "quixel-ai",
    budgetAI: "500",
    syncGeFA: true,
    syncGeCO: true,
    trackingAIS: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        <p className="text-sm text-muted-foreground mt-1">Configurazione della piattaforma</p>
      </div>

      {saved && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Impostazioni salvate con successo</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Azienda</CardTitle><CardDescription>Informazioni generali</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Ragione sociale</Label><Input value={form.ragioneSociale} onChange={(e) => setForm({ ...form, ragioneSociale: e.target.value })} /></div>
            <div className="space-y-2"><Label>P.IVA</Label><Input value={form.piva} onChange={(e) => setForm({ ...form, piva: e.target.value })} /></div>
            <div className="space-y-2"><Label>Indirizzo</Label><Input value={form.indirizzo} onChange={(e) => setForm({ ...form, indirizzo: e.target.value })} /></div>
            <div className="space-y-2"><Label>Telefono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">AI & Orchestrator</CardTitle><CardDescription>Configurazione agenti e modello</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Master Orchestrator attivo</Label><Switch checked={form.orchestrator} onCheckedChange={(v) => setForm({ ...form, orchestrator: v })} /></div>
          <div className="flex items-center justify-between"><Label>Gate umano su bolle doganali</Label><Switch checked={form.gateBolle} onCheckedChange={(v) => setForm({ ...form, gateBolle: v })} /></div>
          <div className="flex items-center justify-between"><Label>Gate umano su fatture</Label><Switch checked={form.gateFatture} onCheckedChange={(v) => setForm({ ...form, gateFatture: v })} /></div>
          <div className="flex items-center justify-between"><Label>Notifica cliente automatica per trasporti</Label><Switch checked={form.notificaTrasporti} onCheckedChange={(v) => setForm({ ...form, notificaTrasporti: v })} /></div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2"><Label>Modello AI</Label><Select value={form.modello} onValueChange={(v) => setForm({ ...form, modello: v ?? "quixel-ai" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="quixel-ai">Quixel Ai</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Budget mensile AI (€)</Label><Input value={form.budgetAI} onChange={(e) => setForm({ ...form, budgetAI: e.target.value })} type="number" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Integrazioni</CardTitle><CardDescription>Connessione sistemi legacy</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><Label>Sincronizzazione Ge.FA (fatturazione)</Label><Switch checked={form.syncGeFA} onCheckedChange={(v) => setForm({ ...form, syncGeFA: v })} /></div>
          <div className="flex items-center justify-between"><Label>Sincronizzazione Ge.CO (contabilità)</Label><Switch checked={form.syncGeCO} onCheckedChange={(v) => setForm({ ...form, syncGeCO: v })} /></div>
          <div className="flex items-center justify-between"><Label>Tracking AIS Marinetraffic</Label><Switch checked={form.trackingAIS} onCheckedChange={(v) => setForm({ ...form, trackingAIS: v })} /></div>
        </CardContent>
      </Card>

      <Button size="sm" onClick={handleSave}><Save className="h-4 w-4" /> Salva impostazioni</Button>
    </div>
  );
}