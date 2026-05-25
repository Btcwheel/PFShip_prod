"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DEMO_USERS, useAuth } from "@/lib/auth-store";
import { Eye, EyeOff, Loader2, ShieldCheck, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const ROLE_CARDS: { role: Role; title: string; subtitle: string; icon: React.ElementType; gradient: string }[] = [
  {
    role: "admin",
    title: "Super Admin",
    subtitle: "Accesso completo a tutti i moduli e reparti",
    icon: ShieldCheck,
    gradient: "from-blue-500/15 to-cyan-500/10",
  },
  {
    role: "manager",
    title: "Manager Reparto",
    subtitle: "Supervisiona il proprio team e workflow",
    icon: Users,
    gradient: "from-emerald-500/15 to-teal-500/10",
  },
  {
    role: "operator",
    title: "Operatore",
    subtitle: "Gestisce le proprie pratiche operative",
    icon: Briefcase,
    gradient: "from-amber-500/15 to-orange-500/10",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, switchRole } = useAuth();
  const [email, setEmail] = useState("f.esposito@pfship.it");
  const [password, setPassword] = useState("demo2026");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("admin");

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    switchRole(selectedRole);
    router.push("/dashboard");
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setEmail(DEMO_USERS[role].email);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background animated mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-chart-2/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-3/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center"
        >
          {/* Left: branding + claims */}
          <div className="space-y-8 lg:pr-8">
            <Logo size="xl" />
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
                Il sistema operativo
                <br />
                <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  della tua spedizione.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Gestione integrata di import, dogana, terminal, trasporti e fatturazione con
                agenti AI specializzati guidati dal Master Orchestrator.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60">
              <div>
                <div className="text-2xl font-semibold">12</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Agenti AI
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold">8</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Moduli
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold">24/7</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Tracking nave
                </div>
              </div>
            </div>
          </div>

          {/* Right: login card */}
          <Card className="border-border/60 bg-card/80 backdrop-blur-xl p-8 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold tracking-tight">Accedi alla piattaforma</h2>
                <p className="text-sm text-muted-foreground">
                  Demo — seleziona un ruolo per esplorare le diverse viste
                </p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-3 gap-2">
                {ROLE_CARDS.map((rc) => {
                  const active = selectedRole === rc.role;
                  const Icon = rc.icon;
                  return (
                    <button
                      key={rc.role}
                      type="button"
                      onClick={() => handleRoleSelect(rc.role)}
                      className={cn(
                        "relative rounded-lg border p-3 text-left transition-all",
                        "bg-gradient-to-br",
                        rc.gradient,
                        active
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-border/80",
                      )}
                    >
                      <Icon className={cn("h-4 w-4 mb-2", active && "text-primary")} />
                      <div className="text-xs font-medium">{rc.title}</div>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Hai dimenticato la password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Accesso in corso…
                    </>
                  ) : (
                    "Accedi"
                  )}
                </Button>
              </form>

              <div className="pt-4 border-t border-border/60">
                <p className="text-xs text-center text-muted-foreground">
                  © 2026 PF Ship Srl — Partners Friends & Ship
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
