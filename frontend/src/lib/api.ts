const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://pfshipprod-production.up.railway.app/api";

let _token: string | null = null;

export function getToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pfship_token");
  }
  return _token;
}

export function setToken(token: string) {
  _token = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("pfship_token", token);
  }
}

export function clearToken() {
  _token = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("pfship_token");
    localStorage.removeItem("pfship_user");
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  const data = await apiFetch<{ access_token: string; token_type: string }>(
    "/auth/login-json",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }
  );
  setToken(data.access_token);
  return data;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totale_fatture: number;
  fatture_anno: number;
  fatturato_anno: number;
  totale_anagrafiche: number;
  totale_coge: number;
  ultime_fatture: {
    anno_fattu: number;
    nume_docum: number;
    data_docum: string;
    desc_clien: string;
    importo: number;
    tipo_fattu: string;
  }[];
  fatturato_mensile: {
    mese: string;
    num_fatture: number;
    totale: number;
  }[];
  ricavi_per_tipo: {
    tipo_fattu: string;
    num: number;
    totale: number;
  }[];
}

export async function getDashboardStats() {
  return apiFetch<DashboardStats>("/dashboard/stats");
}

// ─── Pratiche ────────────────────────────────────────────────────────────────

export interface Pratica {
  id: number;
  cliente: string;
  paese_origine: string;
  shipper: string;
  n_container: number;
  tipo_container: string;
  peso_totale_kg: number;
  peso_netto_kg: number;
  descrizione_merce: string;
  porto_carico: string;
  porto_scarico: string;
  nave: string;
  nave_attuale: string;
  viaggio: string;
  compagnia_navigazione: string;
  bl_number: string;
  hbl_number: string;
  booking_number: string;
  invoice_number: string;
  container_number: string;
  seal_number: string;
  valore_merce_eur: number;
  n_colli: number;
  n_pezzi: number;
  consignee: string;
  consignee_piva: string;
  eta_italia: string;
  etd_cina: string;
  gedoanag_id: number;
  stato: string;
  urgenza: string;
  step_corrente: number;
  note: string;
  operatore: string;
  allegati_json: string;
  creata_il: string;
}

export async function getPratiche() {
  return apiFetch<Pratica[]>("/agenti/pratiche");
}

export async function getPratica(id: number) {
  return apiFetch<Pratica>(`/agenti/pratiche/${id}`);
}

// ─── Anagrafiche ─────────────────────────────────────────────────────────────

export interface Anagrafica {
  id: number;
  ragi_socia: string;
  indirizzo: string;
  localita: string;
  provincia: string;
  part_iva: string;
  codi_fisca: string;
  email: string;
  nume_telef: string;
  tipo: string;
}

export async function getAnagrafiche(search = "", limit = 50, offset = 0) {
  const params = new URLSearchParams({
    search,
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<{ total: number; items: Anagrafica[] }>(
    `/anagrafiche?${params}`
  );
}

// ─── Fatture ─────────────────────────────────────────────────────────────────

export interface Fattura {
  id: number;
  anno_fattu: number;
  nume_docum: number;
  data_docum: string;
  desc_clien: string;
  importo: number;
  tipo_fattu: string;
  codi_causa: string;
}

export async function getFatture(search = "", limit = 50, offset = 0) {
  const params = new URLSearchParams({
    search,
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<{ total: number; items: Fattura[] }>(
    `/fatture?${params}`
  );
}

// ─── Email Inbox ─────────────────────────────────────────────────────────────

export interface InboxStatus {
  running: boolean;
  last_poll: string;
  total_emails: number;
  unprocessed: number;
}

export interface InboxEmail {
  uid: string;
  mittente: string;
  destinatari: string;
  oggetto: string;
  data: string;
  corpo: string;
  allegati: { nome: string; testo: string }[];
  status: string;
}

export async function getInboxStatus() {
  return apiFetch<InboxStatus>("/agenti/inbox/status");
}

export async function getInboxEmails() {
  return apiFetch<{ emails: InboxEmail[] }>("/agenti/inbox/emails");
}

export async function processEmail(uid: string) {
  return apiFetch("/agenti/inbox/process", {
    method: "POST",
    body: JSON.stringify({ uid }),
  });
}

// ─── Manifesti ───────────────────────────────────────────────────────────────

export async function getManifesti(page = 1, limit = 20) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiFetch(`/manifesti?${params}`);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export interface Task {
  id: number;
  titolo: string;
  descrizione: string;
  assegnato_a: string;
  creato_da: string;
  priorita: string;
  stato: string;
  categoria: string;
  pratica_id: number | null;
  scadenza: string | null;
  completato_il: string | null;
  creato_il: string;
}

export async function getTasks(params?: {
  stato?: string;
  assegnato_a?: string;
  priorita?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.stato) qs.set("stato", params.stato);
  if (params?.assegnato_a) qs.set("assegnato_a", params.assegnato_a);
  if (params?.priorita) qs.set("priorita", params.priorita);
  const query = qs.toString();
  return apiFetch<Task[]>(`/tasks${query ? `?${query}` : ""}`);
}

export async function getMyTasks() {
  return apiFetch<Task[]>("/tasks/mie");
}

export async function createTask(data: {
  titolo: string;
  descrizione?: string;
  assegnato_a?: string;
  priorita?: string;
  categoria?: string;
  pratica_id?: number;
  scadenza?: string;
}) {
  return apiFetch<{ id: number }>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  id: number,
  data: {
    titolo?: string;
    descrizione?: string;
    assegnato_a?: string;
    priorita?: string;
    stato?: string;
    categoria?: string;
    scadenza?: string;
  }
) {
  return apiFetch<Task>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTask(id: number) {
  return apiFetch<{ status: string }>(`/tasks/${id}`, { method: "DELETE" });
}

// ─── Approvazioni ─────────────────────────────────────────────────────────────

export interface Approvazione {
  id: number;
  pratica_id: number;
  step_numero: number;
  agente: string;
  output_ai: string;
  stato: string;
  revisore: string | null;
  note_revisore: string | null;
  creato_il: string;
  revisionato_il: string | null;
  pratica_cliente: string | null;
  bl_number: string | null;
}

export async function getApprovazioni(stato?: string) {
  const qs = stato ? `?stato=${stato}` : "";
  return apiFetch<Approvazione[]>(`/approvazioni${qs}`);
}

export async function getApprovazioniConteggio() {
  return apiFetch<{ pending: number }>("/approvazioni/conteggio");
}

export async function approvaApprovazione(id: number, note: string = "") {
  return apiFetch<{ status: string; nuovo_step: number }>(
    `/approvazioni/${id}/approva`,
    { method: "POST", body: JSON.stringify({ note }) }
  );
}

export async function respingiApprovazione(id: number, note: string = "") {
  return apiFetch<{ status: string }>(
    `/approvazioni/${id}/respingi`,
    { method: "POST", body: JSON.stringify({ note }) }
  );
}
