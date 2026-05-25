# PF Ship — Gestionale Aziendale

Piattaforma di gestione integrata per **PF Ship Srl** (Partners Friends & Ship, Napoli).
Gestione import, bolle doganali, terminal, trasporti, fatturazione, contabilità con orchestrazione di agenti AI specializzati.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind v4 + shadcn/ui
- **Backend**: FastAPI + SQLAlchemy 2.0 async + Pydantic v2
- **DB**: MySQL (legacy cliente, fase 1) + PostgreSQL (target fase 2)
- **AI**: Anthropic Claude (Sonnet 4.6) — Master Orchestrator + 12 agenti
- **Tracking navi**: AIS API Node/TypeScript (MarineTraffic + ADS-B)
- **Deploy**: Vercel (frontend) + Railway (backend, DB, AIS)

## Struttura

```
Gestione_Pfship/
├── frontend/          React + TS + Tailwind v4 + shadcn/ui
├── backend/           FastAPI
├── ais-api/           Servizio Node per tracking navi
├── samples/           Documenti di esempio
└── docs/              Documentazione progetto
```

## Avvio locale

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### AIS API
```bash
cd ais-api
npm install
npm run dev
```

## Moduli

| Modulo | Descrizione |
|---|---|
| **Pratiche Import** | Gestione ciclo completo dello shipping da Cina (12 step) |
| **Bolle Doganali** | Precompilazione PRADO con AI + workflow approvazione |
| **Terminal** | Tracking container nei terminal carrier, costi sosta |
| **Trasporti** | Booking spedizioniere terrestre, calendario, notifica cliente |
| **Fatturazione** | Emissione fatture con AI helper, integrazione Ge.FA |
| **Contabilità** | Scritture partita doppia, integrazione Ge.CO |
| **AI Console** | Master Orchestrator + agenti specializzati con streaming live |
| **Amministrazione** | Gestione utenti, ruoli, team, audit |

## Licenza

Proprietary — © 2026 Quixel per PF Ship Srl.
