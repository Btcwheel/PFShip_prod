"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Plus,
  Clock,
  AlertTriangle,
  Trash2,
  Loader2,
  Calendar,
  User,
} from "lucide-react";
import { getTasks, createTask, updateTask, deleteTask, type Task } from "@/lib/api";
import { cn } from "@/lib/utils";

const PRIORITA_COLORS: Record<string, string> = {
  urgente: "bg-red-500/10 text-red-600 border-red-500/30",
  alta: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  normale: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  bassa: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

const STATO_COLORS: Record<string, string> = {
  da_fare: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  in_corso: "bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
  completato: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  annullato: "bg-gray-500/10 text-gray-500 border-gray-500/30 line-through",
};

const STATO_LABELS: Record<string, string> = {
  da_fare: "Da fare",
  in_corso: "In corso",
  completato: "Completato",
  annullato: "Annullato",
};

const PRIORITA_LABELS: Record<string, string> = {
  urgente: "Urgente",
  alta: "Alta",
  normale: "Normale",
  bassa: "Bassa",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStato, setFiltroStato] = useState<string>("");
  const [taskInModifica, setTaskInModifica] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  const [form, setForm] = useState({
    titolo: "",
    descrizione: "",
    assegnato_a: "",
    priorita: "normale",
    categoria: "operativo",
    scadenza: "",
  });

  const loadTasks = useCallback(async () => {
    try {
      const data = await getTasks(filtroStato ? { stato: filtroStato } : undefined);
      setTasks(data);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [filtroStato]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async () => {
    if (!form.titolo.trim()) return;
    await createTask(form);
    setShowNew(false);
    setForm({ titolo: "", descrizione: "", assegnato_a: "", priorita: "normale", categoria: "operativo", scadenza: "" });
    loadTasks();
  };

  const handleComplete = async (id: number) => {
    await updateTask(id, { stato: "completato" });
    loadTasks();
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    loadTasks();
  };

  const handleInCorso = async (id: number) => {
    await updateTask(id, { stato: "in_corso" });
    loadTasks();
  };

  const daFareCount = tasks.filter((t) => t.stato === "da_fare").length;
  const inCorsoCount = tasks.filter((t) => t.stato === "in_corso").length;
  const completatiCount = tasks.filter((t) => t.stato === "completato").length;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Task</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestione attività operative del team
          </p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger
            render={
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Nuovo task
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea nuovo task</DialogTitle>
              <DialogDescription>
                Assegna un'attività operativa a un membro del team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Titolo</Label>
                <Input
                  value={form.titolo}
                  onChange={(e) => setForm({ ...form, titolo: e.target.value })}
                  placeholder="Es. Verifica documenti cliente X"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrizione</Label>
                <Textarea
                  value={form.descrizione}
                  onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
                  placeholder="Dettagli del task..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Assegnato a</Label>
                  <Input
                    value={form.assegnato_a}
                    onChange={(e) => setForm({ ...form, assegnato_a: e.target.value })}
                    placeholder="Username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priorità</Label>
                  <Select
                    value={form.priorita}
                    onValueChange={(v) => setForm({ ...form, priorita: v ?? "normale" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITA_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    placeholder="Es. Dogana, Terminal..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scadenza</Label>
                  <Input
                    type="date"
                    value={form.scadenza}
                    onChange={(e) => setForm({ ...form, scadenza: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNew(false)}>
                Annulla
              </Button>
              <Button onClick={handleCreate}>Crea task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-sm p-3 bg-slate-500/10 rounded-lg border border-slate-500/20 text-center">
          <div className="text-2xl font-bold">{daFareCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Da fare</div>
        </div>
        <div className="text-sm p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-center">
          <div className="text-2xl font-bold text-cyan-600">{inCorsoCount}</div>
          <div className="text-xs text-muted-foreground mt-1">In corso</div>
        </div>
        <div className="text-sm p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-center">
          <div className="text-2xl font-bold text-emerald-600">{completatiCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Completati</div>
        </div>
        <div className="text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
          <div className="text-2xl font-bold text-red-600">
            {tasks.filter((t) => t.priorita === "urgente" && t.stato !== "completato").length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Urgenti</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { label: "Tutti", value: "" },
          { label: "Da fare", value: "da_fare" },
          { label: "In corso", value: "in_corso" },
          { label: "Completati", value: "completato" },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filtroStato === f.value ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFiltroStato(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Task list */}
      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nessun task trovato
            </div>
          ) : (
            <div className="divide-y">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors",
                    task.stato === "completato" && "opacity-60"
                  )}
                >
                  <button
                    onClick={() =>
                      task.stato === "completato"
                        ? null
                        : handleComplete(task.id)
                    }
                    className={cn(
                      "mt-0.5 h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                      task.stato === "completato"
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-muted-foreground/30 hover:border-emerald-500"
                    )}
                  >
                    {task.stato === "completato" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        task.stato === "completato" && "line-through"
                      )}
                    >
                      {task.titolo}
                    </p>
                    {task.descrizione && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {task.descrizione}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn("h-5 text-[10px]", PRIORITA_COLORS[task.priorita] || "")}
                      >
                        {PRIORITA_LABELS[task.priorita] || task.priorita}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("h-5 text-[10px]", STATO_COLORS[task.stato] || "")}
                      >
                        {STATO_LABELS[task.stato] || task.stato}
                      </Badge>
                      {task.assegnato_a && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assegnato_a}
                        </span>
                      )}
                      {task.scadenza && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.scadenza).toLocaleDateString("it-IT")}
                        </span>
                      )}
                      {task.categoria && task.categoria !== "operativo" && (
                        <span className="text-[10px] text-muted-foreground">
                          {task.categoria}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {task.stato === "da_fare" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleInCorso(task.id)}
                        title="Inizia"
                      >
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(task.id)}
                      title="Elimina"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}