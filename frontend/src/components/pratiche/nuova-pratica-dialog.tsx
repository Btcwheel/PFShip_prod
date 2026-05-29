"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, Ship, Package, Calendar, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTAINER_TYPES = ["20DV", "40DV", "40HC", "40FR", "20RF", "40RF"];
const URGENZE = ["bassa", "normale", "alta", "critica"];
const PORTI = [
  "Shanghai", "Ningbo", "Shenzhen", "Qingdao", "Tianjin",
  "Xiamen", "Guangzhou", "Hong Kong", "Singapore", "Busan",
  "Yantian", "Shekou",
];
const PORTI_SCARICO = ["Napoli", "Salerno", "Gioia Tauro", "Genova", "La Spezia", "Livorno", "Trieste", "Venezia", "Taranto", "Bari"];
const COMPAGNIE = ["MSC", "Maersk", "CMA CGM", "COSCO", "Hapag-Lloyd", "ONE", "Evergreen", "Yang Ming"];

const STEPS = [
  { id: "cliente", label: "Cliente", icon: FileText },
  { id: "spedizione", label: "Spedizione", icon: Ship },
  { id: "container", label: "Container", icon: Package },
  { id: "date", label: "Date", icon: Calendar },
];

export function NuovaPraticaDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    cliente: "",
    shipper: "",
    paeseOrigine: "Cina",
    portoCarico: "",
    portoScarico: "",
    nave: "",
    viaggio: "",
    mmsi: "",
    compagnia: "",
    blNumber: "",
    bookingNumber: "",
    containerCount: 1,
    containerType: "40HC",
    pesoKg: 0,
    valoreEur: 0,
    descrizioneMerce: "",
    etdCina: "",
    etaItalia: "",
    urgenza: "normale",
    operatore: "",
  });

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canNext = () => {
    if (step === 0) return form.cliente.trim() && form.shipper.trim() && form.portoCarico && form.portoScarico;
    if (step === 1) return form.nave.trim() && form.viaggio.trim() && form.blNumber.trim() && form.bookingNumber.trim();
    if (step === 2) return form.containerCount > 0 && form.containerType && form.pesoKg > 0;
    if (step === 3) return form.etdCina && form.etaItalia;
    return true;
  };

  const handleSubmit = () => {
    console.log("Nuova pratica:", form);
    setOpen(false);
    setStep(0);
    setForm({
      cliente: "", shipper: "", paeseOrigine: "Cina", portoCarico: "", portoScarico: "",
      nave: "", viaggio: "", mmsi: "", compagnia: "", blNumber: "", bookingNumber: "",
      containerCount: 1, containerType: "40HC", pesoKg: 0, valoreEur: 0, descrizioneMerce: "",
      etdCina: "", etaItalia: "", urgenza: "normale", operatore: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Nuova pratica
        </Button>
      } />
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Nuova pratica import</DialogTitle>
          <DialogDescription>
            Inserisci i dati della pratica — {step + 1}/4: {STEPS[step].label}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 py-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors",
                i < step && "bg-primary text-primary-foreground",
                i === step && "bg-primary/15 text-primary ring-2 ring-primary/30",
                i > step && "bg-muted text-muted-foreground"
              )}>
                {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-xs hidden sm:inline", i === step && "font-medium", i > step && "text-muted-foreground")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className={cn("h-px flex-1", i < step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        {/* Step 0: Cliente */}
        {step === 0 && (
          <div className="space-y-5 py-3">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Input value={form.cliente} onChange={(e) => update("cliente", e.target.value)} placeholder="Es. Galileo Import Export" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Shipper *</Label>
                <Input value={form.shipper} onChange={(e) => update("shipper", e.target.value)} placeholder="Es. Shanghai Trading Co." className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label>Paese origine</Label>
                <Input value={form.paeseOrigine} onChange={(e) => update("paeseOrigine", e.target.value)} placeholder="Cina" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Porto carico *</Label>
                <Select value={form.portoCarico} onValueChange={(v) => update("portoCarico", v ?? "")}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>
                    {PORTI.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Porto scarico *</Label>
                <Select value={form.portoScarico} onValueChange={(v) => update("portoScarico", v ?? "")}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>
                    {PORTI_SCARICO.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Spedizione */}
        {step === 1 && (
          <div className="space-y-5 py-3">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Nave *</Label>
                <Input value={form.nave} onChange={(e) => update("nave", e.target.value)} placeholder="Es. Bangkok Express" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Viaggio *</Label>
                <Input value={form.viaggio} onChange={(e) => update("viaggio", e.target.value)} placeholder="Es. 2614E" className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Compagnia</Label>
                <Select value={form.compagnia} onValueChange={(v) => update("compagnia", v ?? "")}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Seleziona" /></SelectTrigger>
                  <SelectContent>
                    {COMPAGNIE.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>MMSI</Label>
                <Input value={form.mmsi} onChange={(e) => update("mmsi", e.target.value)} placeholder="Es. 477123456" className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>B/L Number *</Label>
                <Input value={form.blNumber} onChange={(e) => update("blNumber", e.target.value)} placeholder="Es. MEDU123456789" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Booking N° *</Label>
                <Input value={form.bookingNumber} onChange={(e) => update("bookingNumber", e.target.value)} placeholder="Es. FB240598776" className="h-10" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Container */}
        {step === 2 && (
          <div className="space-y-5 py-3">
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label>N° container *</Label>
                <Input type="number" min={1} value={form.containerCount} onChange={(e) => update("containerCount", parseInt(e.target.value) || 0)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.containerType} onValueChange={(v) => update("containerType", v ?? "40HC")}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTAINER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Peso (kg) *</Label>
                <Input type="number" min={0} value={form.pesoKg || ""} onChange={(e) => update("pesoKg", parseFloat(e.target.value) || 0)} placeholder="Es. 18500" className="h-10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>Valore merce (€)</Label>
                <Input type="number" min={0} value={form.valoreEur || ""} onChange={(e) => update("valoreEur", parseFloat(e.target.value) || 0)} placeholder="Es. 85000" className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>Urgenza</Label>
                <Select value={form.urgenza} onValueChange={(v) => update("urgenza", v ?? "normale")}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {URGENZE.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrizione merce</Label>
              <Textarea value={form.descrizioneMerce} onChange={(e) => update("descrizioneMerce", e.target.value)} placeholder="Es. Tessuti misti cotone-poliestere, HS Code 5208.32" rows={4} className="min-h-[100px]" />
            </div>
          </div>
        )}

        {/* Step 3: Date */}
        {step === 3 && (
          <div className="space-y-5 py-3">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label>ETD Cina *</Label>
                <Input type="date" value={form.etdCina} onChange={(e) => update("etdCina", e.target.value)} className="h-10" />
              </div>
              <div className="space-y-2">
                <Label>ETA Italia *</Label>
                <Input type="date" value={form.etaItalia} onChange={(e) => update("etaItalia", e.target.value)} className="h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Operatore assegnato</Label>
              <Input value={form.operatore} onChange={(e) => update("operatore", e.target.value)} placeholder="Es. Luca De Marco" className="h-10" />
            </div>

            {/* Riepilogo */}
            <div className="rounded-lg border bg-muted/30 p-5 space-y-3">
              <p className="text-sm font-semibold">Riepilogo pratica</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <span className="text-muted-foreground">Cliente:</span><span className="font-medium">{form.cliente || "—"}</span>
                <span className="text-muted-foreground">Shipper:</span><span className="font-medium">{form.shipper || "—"}</span>
                <span className="text-muted-foreground">Nave:</span><span className="font-medium">{form.nave || "—"} · {form.viaggio || ""}</span>
                <span className="text-muted-foreground">Compagnia:</span><span className="font-medium">{form.compagnia || "—"}</span>
                <span className="text-muted-foreground">B/L:</span><span className="font-medium">{form.blNumber || "—"}</span>
                <span className="text-muted-foreground">Booking:</span><span className="font-medium">{form.bookingNumber || "—"}</span>
                <span className="text-muted-foreground">Container:</span><span className="font-medium">{form.containerCount}× {form.containerType}</span>
                <span className="text-muted-foreground">Peso:</span><span className="font-medium">{form.pesoKg ? `${form.pesoKg.toLocaleString("it-IT")} kg` : "—"}</span>
                <span className="text-muted-foreground">Porto:</span><span className="font-medium">{form.portoCarico} → {form.portoScarico}</span>
                <span className="text-muted-foreground">Urgenza:</span><span className="font-medium">{form.urgenza}</span>
                <span className="text-muted-foreground">ETD:</span><span className="font-medium">{form.etdCina ? new Date(form.etdCina).toLocaleDateString("it-IT") : "—"}</span>
                <span className="text-muted-foreground">ETA:</span><span className="font-medium">{form.etaItalia ? new Date(form.etaItalia).toLocaleDateString("it-IT") : "—"}</span>
              </div>
              {form.descrizioneMerce && (
                <>
                  <span className="text-muted-foreground">Merce:</span>
                  <span className="font-medium col-span-2">{form.descrizioneMerce}</span>
                </>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <DialogClose render={
            <Button variant="outline">Annulla</Button>
          } />
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Indietro
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}>
              Avanti
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canNext()}>
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Crea pratica
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}