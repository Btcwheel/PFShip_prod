// ─── Tipi dominio PF Ship ────────────────────────────────────────────────────

export type Role = "admin" | "manager" | "operator";

export type Team =
  | "import"
  | "dogana"
  | "trasporti"
  | "terminal"
  | "contabilita"
  | "amministrazione";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  team?: Team;
  avatar?: string;
}

export type PraticaStato =
  | "bozza"
  | "booking_aperto"
  | "in_navigazione"
  | "in_arrivo"
  | "in_dogana"
  | "in_terminal"
  | "sdoganata"
  | "in_consegna"
  | "consegnata"
  | "chiusa"
  | "fatturata";

export type PraticaUrgenza = "bassa" | "normale" | "alta" | "critica";

export interface Pratica {
  id: string;
  numero: string; // es. "PF-2026-0148"
  cliente: string;
  clienteId: string;
  shipper: string;
  paeseOrigine: string;
  portoCarico: string;
  portoScarico: string;
  nave: string;
  viaggio: string;
  mmsi?: string;
  blNumber: string;
  bookingNumber: string;
  containerCount: number;
  containerType: string; // 40HC, 20DV, 40FR…
  pesoKg: number;
  valoreEur: number;
  descrizioneMerce: string;
  etdCina: string; // ISO date
  etaItalia: string;
  stato: PraticaStato;
  urgenza: PraticaUrgenza;
  stepCorrente: number; // 1-12
  operatore: string;
  team: Team;
  compagnia: string;
  terminal?: string;
  createdAt: string;
  updatedAt: string;
  documenti: Documento[];
  eventi: Evento[];
}

export interface Documento {
  id: string;
  praticaId: string;
  nome: string;
  tipo:
    | "fattura_commerciale"
    | "packing_list"
    | "bl"
    | "packing_declaration"
    | "certificato_origine"
    | "delivery_order"
    | "bolla_doganale"
    | "altro";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
}

export interface Evento {
  id: string;
  praticaId: string;
  tipo:
    | "creazione"
    | "step_completato"
    | "documento_caricato"
    | "ai_eseguito"
    | "alert"
    | "messaggio"
    | "stato_cambiato";
  testo: string;
  attore: string; // utente o "AI:NomeAgente"
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface BollaDoganale {
  id: string;
  numero: string;
  praticaId: string;
  praticaNumero: string;
  cliente: string;
  stato: "bozza" | "in_approvazione" | "inviata" | "accettata" | "respinta";
  valoreEur: number;
  daziEur: number;
  ivaEur: number;
  totale: number;
  containerCount: number;
  compilataIl: string;
  inviataIl?: string;
  precompilataDa?: string; // "AI" o nome operatore
}

export interface TerminalContainer {
  id: string;
  praticaId: string;
  praticaNumero: string;
  containerNumber: string; // es. MSCU1234567
  tipo: string;
  terminal: string; // CT Napoli, Salerno, etc.
  carrier: string; // MSC, Maersk, CMA CGM…
  arrivoTerminal: string; // ISO
  uscitaTerminal?: string;
  costoGiornaliero: number; // EUR/giorno
  costoCumulato: number;
  stato: "in_sosta" | "in_trasferimento" | "uscito" | "consegnato";
  cliente: string;
  alert?: "costo_alto" | "scadenza_vicina" | "ok";
}

export interface Trasporto {
  id: string;
  praticaId: string;
  praticaNumero: string;
  vettore: string;
  vettoreId: string;
  containerNumber: string;
  pickup: string; // luogo
  destinazione: string;
  dataPickup: string;
  oraSlot: string; // "08:00-10:00"
  stato:
    | "schedulato"
    | "notificato_cliente"
    | "confermato"
    | "in_transito"
    | "consegnato"
    | "annullato";
  cliente: string;
  contattoCliente: string;
  notifyClientAt?: string;
  confermaClienteAt?: string;
  note?: string;
}

export interface Fattura {
  id: string;
  numero: string;
  praticaId?: string;
  praticaNumero?: string;
  cliente: string;
  data: string;
  scadenza: string;
  imponibile: number;
  iva: number;
  totale: number;
  stato: "bozza" | "emessa" | "inviata" | "pagata" | "scaduta";
  voci: VoceFattura[];
}

export interface VoceFattura {
  descrizione: string;
  quantita: number;
  prezzoUnitario: number;
  totale: number;
}

export interface AgentRun {
  id: string;
  agentName: string;
  agentLabel: string;
  praticaId?: string;
  praticaNumero?: string;
  stato: "queued" | "running" | "completed" | "failed" | "needs_review";
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  costoEur?: number;
  input?: Record<string, unknown>;
  output?: string;
  validationByMaster?: "ok" | "review_needed" | "rejected";
  reviewer?: string;
}

export interface KpiData {
  pratiche_aperte: number;
  pratiche_chiuse_mese: number;
  container_in_transito: number;
  container_in_terminal: number;
  fatturato_mese_eur: number;
  fatturato_mese_delta_pct: number;
  margine_medio_pct: number;
  eta_in_ritardo: number;
  ai_runs_oggi: number;
  ai_costo_oggi_eur: number;
}
