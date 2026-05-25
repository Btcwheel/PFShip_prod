"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "./types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  switchRole: (role: Role) => void;
}

export const DEMO_USERS: Record<Role, User> = {
  admin: {
    id: "u-admin",
    name: "Francesco Esposito",
    email: "f.esposito@pfship.it",
    role: "admin",
    team: "amministrazione",
  },
  manager: {
    id: "u-mgr",
    name: "Anna Romano",
    email: "a.romano@pfship.it",
    role: "manager",
    team: "import",
  },
  operator: {
    id: "u-ops",
    name: "Luca De Marco",
    email: "l.demarco@pfship.it",
    role: "operator",
    team: "import",
  },
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      switchRole: (role) => set({ user: DEMO_USERS[role], isAuthenticated: true }),
    }),
    { name: "pfship-auth" },
  ),
);
