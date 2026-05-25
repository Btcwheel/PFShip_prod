import httpx
import json
import mailparser
import pdfplumber
import openpyxl
import docx
import io
import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from typing import Optional
from anthropic import Anthropic
from app.database import get_mysql, get_sqlite
from app.auth import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/agenti", tags=["agenti"])

AIS_BASE = "http://localhost:5001"
anthropic = Anthropic()


# ─── Helper: estrai testo da allegato ───────────────────────────────────────

def estrai_testo_allegato(nome: str, payload: bytes) -> str:
    ext = nome.lower().rsplit(".", 1)[-1] if "." in nome else ""
    try:
        if ext == "pdf":
            testo = []
            with pdfplumber.open(io.BytesIO(payload)) as pdf:
                for page in pdf.pages[:10]:
                    t = page.extract_text()
                    if t:
                        testo.append(t)
            return "\n".join(testo)[:4000]
        elif ext in ("docx", "doc"):
            d = docx.Document(io.BytesIO(payload))
            return "\n".join(p.text for p in d.paragraphs if p.text.strip())[:4000]
        elif ext in ("xlsx",):
            wb = openpyxl.load_workbook(io.BytesIO(payload), read_only=True, data_only=True)
            righe = []
            for ws in wb.worksheets[:3]:
                for row in ws.iter_rows(max_row=100, values_only=True):
                    riga = " | ".join(str(c) for c in row if c is not None)
                    if riga.strip():
                        righe.append(riga)
            return "\n".join(righe)[:4000]
    except Exception as e:
        return f"[Errore estrazione {nome}: {e}]"
    return ""


def ai(prompt: str, max_tokens: int = 800) -> str:
    msg = anthropic.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return msg.content[0].text


def parse_json_safe(text: str) -> dict:
    text = text.strip()
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        raw = match.group(0)
    else:
        raw = text
    try:
        return json.loads(raw)
    except:
        try:
            open_b = raw.count('{') - raw.count('}')
            open_s = raw.count('[') - raw.count(']')
            fixed = raw + ']' * open_s + '}' * open_b
            return json.loads(fixed)
        except:
            return {"errore": "parsing fallito", "raw": raw[:300]}


# ─── STEP 1a: Upload EML ────────────────────────────────────────────────────

@router.post("/step1/upload-eml")
async def step1_upload_eml(file: UploadFile = File(...), user=Depends(get_current_user)):
    contenuto = await file.read()
    try:
        mail = mailparser.parse_from_bytes(contenuto)
        corpo = ""
        if mail.text_plain:
            corpo = "\n".join(mail.text_plain)
        elif mail.text_html:
            corpo = re.sub(r'<[^>]+>', ' ', "\n".join(mail.text_html))
            corpo = re.sub(r'\s+', ' ', corpo).strip()
        else:
            corpo = mail.body or ""
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore parsing EML: {e}")

    allegati_estratti = []
    ESCLUDI_EXT = (".jpg", ".png", ".gif", ".jpeg", ".bmp", ".txt")
    for att in (mail.attachments or []):
        nome = att.get("filename", "") or att.get("mail_content_type", "allegato")
        if any(nome.lower().endswith(ext) for ext in ESCLUDI_EXT):
            allegati_estratti.append({"nome": nome, "testo": "(contenuto non estraibile)"})
            continue
        payload = att.get("payload")
        if payload and isinstance(payload, bytes):
            testo = estrai_testo_allegato(nome, payload)
        elif payload and isinstance(payload, str):
            try:
                import base64
                testo = estrai_testo_allegato(nome, base64.b64decode(payload))
            except:
                testo = ""
        else:
            testo = ""
        allegati_estratti.append({"nome": nome, "testo": testo if testo else "(contenuto non estraibile)"})

    return {
        "mittente": str(mail.from_),
        "destinatari": str(mail.to),
        "oggetto": mail.subject or "",
        "data": str(mail.date),
        "corpo": corpo[:6000],
        "allegati": allegati_estratti,
    }


# ─── STEP 1: Analisi email → estrai dati spedizione ─────────────────────────

class EmailInput(BaseModel):
    testo_email: str
    allegati: Optional[list] = []

@router.post("/step1/leggi-email")
async def step1_leggi_email(body: EmailInput, user=Depends(get_current_user)):
    ESCLUDI = ("(contenuto non estraibile)", "[Errore estrazione")
    testo_allegati = ""
    for a in (body.allegati or []):
        if not isinstance(a, dict):
            continue
        testo = a.get("testo", "")
        nome = a.get("nome", "")
        if any(testo.startswith(e) for e in ESCLUDI):
            continue
        testo_allegati += f"\n\n--- ALLEGATO: {nome} ---\n{testo[:2000]}"

    risposta = ai(f"""Sei un operatore di PF Ship Srl, agenzia spedizioni di Napoli.
Hai ricevuto questa email da un cliente italiano o dal tuo agente in Cina con un ordine di spedizione.
Devi estrarre tutti i dati per preparare la richiesta di booking alla compagnia di navigazione.

EMAIL:
{body.testo_email[:3000]}
{testo_allegati[:6000]}

Rispondi SOLO con JSON valido:
{{
  "tipo_richiesta": "ordine_spedizione",
  "cliente": {{"nome": "...", "paese": "IT", "email": null, "piva": null, "telefono": null}},
  "shipper": {{"nome": null, "paese": "CN", "indirizzo": null}},
  "consegnatario": {{"nome": null, "indirizzo": null, "citta": null}},
  "spedizione": {{
    "booking_number": null,
    "n_container": null,
    "tipo_container": null,
    "peso_totale_kg": null,
    "descrizione_merce": null,
    "hs_codes": [],
    "porto_carico": null,
    "porto_scarico": "NAPOLI",
    "nave_richiesta": null,
    "data_carico_richiesta": null,
    "eta_italia_richiesta": null
  }},
  "compagnia_preferita": null,
  "note_cliente": null,
  "urgenza": "alta",
  "richiesta_booking_carrier": "testo della email da inviare alla compagnia di navigazione per aprire il booking, in inglese, professionale"
}}""", max_tokens=2500)

    return {
        "step": 1,
        "stato": "ordine_analizzato",
        "dati_estratti": parse_json_safe(risposta),
        "operatore": user["sub"],
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 2: Apri pratica + genera booking confirmation ─────────────────────

class AperturaPraticaInput(BaseModel):
    dati_spedizione: dict
    booking_number_confermato: Optional[str] = ""
    compagnia_navigazione: Optional[str] = ""
    nave_confermata: Optional[str] = ""
    eta_confermata: Optional[str] = ""
    note_operatore: Optional[str] = ""
    allegati: Optional[list] = []

@router.post("/step2/apri-pratica")
async def step2_apri_pratica(body: AperturaPraticaInput, db: AsyncSession = Depends(get_sqlite), user=Depends(get_current_user)):
    await db.execute(text("""
        CREATE TABLE IF NOT EXISTS pratiche (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente TEXT, paese_origine TEXT, shipper TEXT,
            n_container INTEGER, tipo_container TEXT,
            peso_totale_kg REAL, descrizione_merce TEXT,
            porto_carico TEXT, porto_scarico TEXT,
            nave TEXT, viaggio TEXT,
            compagnia_navigazione TEXT, bl_number TEXT, booking_number TEXT,
            eta_italia TEXT, etd_cina TEXT,
            stato TEXT DEFAULT 'aperta', urgenza TEXT DEFAULT 'alta',
            step_corrente INTEGER DEFAULT 2,
            note TEXT, operatore TEXT,
            allegati_json TEXT,
            creata_il TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """))

    sp = body.dati_spedizione.get("spedizione", {})
    cl = body.dati_spedizione.get("cliente", {})
    sh = body.dati_spedizione.get("shipper", {})

    # I campi confermati dal carrier sovrascrivono quelli dall'ordine
    if body.booking_number_confermato:
        sp["booking_number"] = body.booking_number_confermato
    if body.compagnia_navigazione:
        body.dati_spedizione["compagnia_navigazione"] = body.compagnia_navigazione
    if body.nave_confermata:
        sp["nave"] = body.nave_confermata
    if body.eta_confermata:
        sp["eta_italia"] = body.eta_confermata

    # Salva solo allegati con testo utile
    ESCLUDI = ("(contenuto non estraibile)", "[Errore")
    allegati_utili = [
        a for a in (body.allegati or [])
        if isinstance(a, dict) and not any(a.get("testo","").startswith(e) for e in ESCLUDI)
        and not a.get("nome","").lower().endswith((".jpg",".png",".gif",".txt"))
    ]

    result = await db.execute(text("""
        INSERT INTO pratiche (cliente, paese_origine, shipper, n_container, tipo_container,
            peso_totale_kg, descrizione_merce, porto_carico, porto_scarico,
            nave, viaggio, compagnia_navigazione, bl_number, booking_number,
            eta_italia, etd_cina, urgenza, note, operatore, step_corrente, allegati_json)
        VALUES (:cliente,:paese,:shipper,:n_cont,:tipo_cont,:peso,:merce,:porto_c,:porto_s,
                :nave,:viaggio,:compagnia,:bl,:booking,:eta,:etd,:urgenza,:note,:operatore,2,:allegati)
    """), {
        "cliente": cl.get("nome",""), "paese": cl.get("paese",""),
        "shipper": sh.get("nome","") if sh else "",
        "n_cont": sp.get("n_container",0), "tipo_cont": sp.get("tipo_container",""),
        "peso": sp.get("peso_totale_kg",0), "merce": sp.get("descrizione_merce",""),
        "porto_c": sp.get("porto_carico",""), "porto_s": sp.get("porto_scarico","NAPOLI"),
        "nave": sp.get("nave",""), "viaggio": sp.get("viaggio",""),
        "compagnia": body.dati_spedizione.get("compagnia_navigazione",""),
        "bl": body.dati_spedizione.get("bl_number",""),
        "booking": sp.get("booking_number",""),
        "eta": sp.get("eta_italia",""), "etd": sp.get("etd_cina",""),
        "urgenza": body.dati_spedizione.get("urgenza","alta"),
        "note": body.note_operatore, "operatore": user["sub"],
        "allegati": json.dumps(allegati_utili, ensure_ascii=False)
    })
    await db.commit()
    pratica_id = result.lastrowid

    booking_conf = ai(f"""Sei un operatore di PF Ship Srl Napoli.
Genera la booking confirmation da inviare all'agente per la pratica #{pratica_id}.

Dati spedizione:
- Cliente: {cl.get('nome','')}
- Nave: {sp.get('nave','')} Viaggio: {sp.get('viaggio','')}
- Da: {sp.get('porto_carico','')} A: {sp.get('porto_scarico','NAPOLI')}
- Container: {sp.get('n_container','')} x {sp.get('tipo_container','')}
- ETD: {sp.get('etd_cina','')} ETA: {sp.get('eta_italia','')}
- Booking N°: {sp.get('booking_number','')}

Scrivi email professionale in inglese con oggetto e corpo.
Firma: PF Ship Srl - Import Dept""", max_tokens=500)

    return {
        "step": 2, "stato": "pratica_aperta",
        "pratica_id": pratica_id,
        "booking_confirmation": booking_conf,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 3: Monitora nave AIS ───────────────────────────────────────────────

class MonitoraggioInput(BaseModel):
    pratica_id: int
    mmsi: Optional[str] = None
    nave: Optional[str] = None
    eta_dichiarata: Optional[str] = None

@router.post("/step3/monitora-nave")
async def step3_monitora_nave(body: MonitoraggioInput, user=Depends(get_current_user)):
    ais_data = None
    if body.mmsi:
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                resp = await client.get(f"{AIS_BASE}/ais/mt/{body.mmsi}/location/latest")
                ais_data = resp.json()
            except:
                ais_data = None

    # Mock realistico se AIS non disponibile
    if not ais_data:
        ais_data = {
            "mock": True, "mmsi": body.mmsi or "N/D",
            "vessel_name": body.nave or "BANGKOK EXPRESS",
            "lat": 36.5, "lon": 14.8,
            "speed": 18.4, "destination": "NAPLES",
            "eta": body.eta_dichiarata or "2026-01-28",
            "status": "Under way using engine",
            "distance_to_naples_nm": 420
        }

    analisi = ai(f"""Operatore doganale PF Ship Srl. Pratica #{body.pratica_id}.
Nave: {body.nave or 'N/D'} - ETA dichiarata: {body.eta_dichiarata or 'N/D'}
Dati AIS: {json.dumps(ais_data)}

Calcola e rispondi in italiano:
1. Giorni mancanti all'arrivo a Napoli
2. Entro quando richiedere i documenti al cliente (2 sett. prima ETA)
3. Entro quando fare richiesta delivery order a Maersk
4. Segnala se c'è ritardo rispetto all'ETA dichiarata
Sii conciso.""", max_tokens=300)

    return {
        "step": 3, "stato": "nave_monitorata",
        "pratica_id": body.pratica_id,
        "ais": ais_data, "analisi": analisi,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 4: Richiesta documenti al cliente ──────────────────────────────────

class RichiestaDocInput(BaseModel):
    pratica_id: int
    cliente_nome: str
    cliente_email: str
    eta_nave: Optional[str] = ""
    n_container: Optional[int] = 0
    lingua: Optional[str] = "italiano"

@router.post("/step4/richiedi-documenti")
async def step4_richiedi_documenti(body: RichiestaDocInput, user=Depends(get_current_user)):
    email_richiesta = ai(f"""PF Ship Srl Napoli, pratica #{body.pratica_id}.
Genera email professionale in {body.lingua} per richiedere documentazione di sdoganamento a:
Cliente: {body.cliente_nome} - Email: {body.cliente_email}
ETA nave a Napoli: {body.eta_nave}
N° container: {body.n_container}

Documenti da richiedere:
1. Fattura commerciale (in inglese, con valori doganali)
2. Packing list dettagliata
3. Polizza di carico (B/L originale o copia)
4. Packing declaration
5. Certificato di origine (se richiesto)

Spiega l'urgenza (arrivo nave tra circa 2 settimane).
Oggetto + corpo email. Firma: Ufficio Import PF Ship Srl""", max_tokens=500)

    return {
        "step": 4, "stato": "documenti_richiesti",
        "pratica_id": body.pratica_id,
        "email_cliente": body.cliente_email,
        "bozza_email": email_richiesta,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 5: Controllo documenti ricevuti ────────────────────────────────────

class DocumentiInput(BaseModel):
    pratica_id: int
    cliente: str
    email_cliente: str
    eta_nave: Optional[str] = ""
    documenti_ricevuti: list[str]
    note_anomalie: Optional[str] = ""
    lingua: Optional[str] = "italiano"

@router.post("/step5/controlla-documenti")
async def step5_controlla_documenti(body: DocumentiInput, user=Depends(get_current_user)):
    obbligatori = ["Fattura commerciale", "Packing list", "Polizza di carico (B/L)"]
    raccomandati = ["Packing declaration", "Certificato di origine"]

    mancanti_obb = [d for d in obbligatori if d not in body.documenti_ricevuti]
    mancanti_racc = [d for d in raccomandati if d not in body.documenti_ricevuti]
    stato = "BLOCCATO" if mancanti_obb else ("INCOMPLETO" if mancanti_racc else "OK")

    azione = ai(f"""Esperto doganale PF Ship Srl. Pratica #{body.pratica_id} - {body.cliente}
ETA nave: {body.eta_nave}
Documenti ricevuti: {', '.join(body.documenti_ricevuti) or 'Nessuno'}
Mancanti obbligatori: {', '.join(mancanti_obb) or 'Nessuno'}
Anomalie: {body.note_anomalie or 'Nessuna'}
Stato: {stato}

{"Genera email di sollecito/correzione in " + body.lingua + " per " + body.cliente + " (" + body.email_cliente + ") con oggetto e corpo." if stato != "OK" else "Conferma completezza e indica prossimi step operativi (bolla doganale)."}""", max_tokens=600)

    return {
        "step": 5, "stato": stato,
        "pratica_id": body.pratica_id,
        "mancanti_obbligatori": mancanti_obb,
        "mancanti_raccomandati": mancanti_racc,
        "azione": azione,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 6: Bolla doganale ──────────────────────────────────────────────────

class BollaInput(BaseModel):
    pratica_id: int

@router.post("/step6/bolla-doganale")
async def step6_bolla_doganale(body: BollaInput, db: AsyncSession = Depends(get_sqlite), user=Depends(get_current_user)):
    # Recupera pratica e allegati dal DB
    result = await db.execute(text("SELECT * FROM pratiche WHERE id = :id"), {"id": body.pratica_id})
    pratica = result.fetchone()
    if not pratica:
        raise HTTPException(status_code=404, detail="Pratica non trovata")

    p = dict(pratica._mapping)
    allegati = []
    if p.get("allegati_json"):
        try:
            allegati = json.loads(p["allegati_json"])
        except:
            allegati = []

    testo_allegati = "\n\n".join(
        f"--- {a['nome']} ---\n{a['testo'][:3000]}"
        for a in allegati if a.get("testo")
    )

    risposta = ai(f"""Sei un esperto doganale italiano. Devi pre-compilare la bolla doganale per PRADO.

DATI PRATICA:
- Cliente/Importatore: {p.get('consignee', p.get('cliente',''))} — P.IVA: {p.get('consignee_piva','')}
- Shipper/Esportatore: {p.get('shipper','')}
- N° container: {p.get('n_container','')} x {p.get('tipo_container','')} — {p.get('container_number','')} sigillo {p.get('seal_number','')}
- Nave: {p.get('nave','')} - Viaggio: {p.get('viaggio','')}
- Porto carico: {p.get('porto_carico','')} → Porto scarico: {p.get('porto_scarico','')}
- MBL: {p.get('bl_number','')} — HBL: {p.get('hbl_number','')}
- Invoice: {p.get('invoice_number','')} — Valore FOB: EUR {p.get('valore_merce_eur',0)}
- Peso totale lordo: {p.get('peso_totale_kg','')} kg — Peso netto: {p.get('peso_netto_kg','')} kg
- N° colli: {p.get('n_colli','')} — N° pezzi: {p.get('n_pezzi','')}
- Data imbarco: {p.get('etd_cina','')} — ETA Napoli: {p.get('eta_italia','')}

DOCUMENTI ALLEGATI:
{testo_allegati[:8000]}

Estrai dai documenti e restituisci SOLO un JSON con questa struttura:
{{
  "importatore": {{
    "ragione_sociale": "...",
    "piva": "...",
    "indirizzo": "...",
    "citta": "..."
  }},
  "esportatore": {{
    "ragione_sociale": "...",
    "paese": "CN"
  }},
  "trasporto": {{
    "mezzo": "nave",
    "nome_nave": "...",
    "viaggio": "...",
    "bl_number": "...",
    "porto_carico": "...",
    "porto_scarico": "...",
    "data_imbarco": "..."
  }},
  "merci": [
    {{
      "descrizione": "...",
      "codice_hs": "...",
      "quantita": "...",
      "unita": "CTN",
      "peso_lordo_kg": 0,
      "peso_netto_kg": 0,
      "valore_eur": 0,
      "dazio_pct": 0,
      "paese_origine": "CN"
    }}
  ],
  "totali": {{
    "colli_totali": 0,
    "peso_lordo_kg": 0,
    "peso_netto_kg": 0,
    "valore_totale_eur": 0,
    "imponibile_dazi": 0,
    "totale_dazi": 0,
    "iva_pct": 22,
    "totale_iva": 0
  }},
  "note_prado": "istruzioni specifiche per compilare PRADO"
}}""", max_tokens=3000)

    bolla = parse_json_safe(risposta)

    return {
        "step": 6,
        "stato": "bolla_precompilata",
        "pratica_id": body.pratica_id,
        "bolla": bolla,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 7: Richiesta delivery order ────────────────────────────────────────

class DeliveryOrderInput(BaseModel):
    pratica_id: int
    bl_number: str
    booking_number: Optional[str] = ""
    compagnia: str
    cliente: str
    n_container: int

@router.post("/step7/delivery-order")
async def step7_delivery_order(body: DeliveryOrderInput, user=Depends(get_current_user)):
    istruzioni = ai(f"""Operatore PF Ship Srl. Pratica #{body.pratica_id}.
Richiesta delivery order a {body.compagnia}:
B/L: {body.bl_number} | Booking: {body.booking_number}
Cliente: {body.cliente} | Container: {body.n_container}

Genera:
1. Testo email/richiesta formale a {body.compagnia} per il delivery order
2. Checklist pre-richiesta (fatture da pagare, documenti necessari)
3. Cosa verificare prima di inviare la richiesta
4. Tempi attesi di risposta da {body.compagnia}
Professionale e specifico.""", max_tokens=600)

    return {
        "step": 7, "stato": "delivery_order_richiesto",
        "pratica_id": body.pratica_id,
        "bl_number": body.bl_number,
        "istruzioni": istruzioni,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 8: Ricezione e pagamento fatture compagnia ─────────────────────────

class PagamentoInput(BaseModel):
    pratica_id: int
    compagnia: str
    importo_fattura: Optional[float] = 0
    valuta: Optional[str] = "USD"
    note: Optional[str] = ""

@router.post("/step8/pagamento-fatture")
async def step8_pagamento(body: PagamentoInput, user=Depends(get_current_user)):
    istruzioni = ai(f"""Operatore contabile PF Ship Srl. Pratica #{body.pratica_id}.
Ricezione fattura da {body.compagnia}: {body.valuta} {body.importo_fattura}
Note: {body.note}

Genera checklist per:
1. Verifica fattura (voci, importi, riferimenti B/L)
2. Procedura di pagamento internazionale
3. Registrazione in contabilità
4. Dopo il pagamento: cosa richiedere a {body.compagnia}
Conciso e operativo.""", max_tokens=400)

    return {
        "step": 8, "stato": "pagamento_gestito",
        "pratica_id": body.pratica_id,
        "istruzioni": istruzioni,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 9: Prenotazione trasportatore ──────────────────────────────────────

class TrasportatoreInput(BaseModel):
    pratica_id: int
    cliente: str
    email_cliente: str
    indirizzo_consegna: Optional[str] = ""
    n_container: int
    eta_nave: Optional[str] = ""

@router.post("/step9/prenota-trasportatore")
async def step9_trasportatore(body: TrasportatoreInput, user=Depends(get_current_user)):
    email_cliente = ai(f"""PF Ship Srl. Pratica #{body.pratica_id}.
Ricezione delivery order confermata. Contatta il cliente per confermare data consegna.

Cliente: {body.cliente} ({body.email_cliente})
Indirizzo: {body.indirizzo_consegna}
N° container: {body.n_container}
ETA nave: {body.eta_nave}

Genera:
1. Email al cliente per concordare data/ora consegna
2. Informazioni che il cliente deve confermare
3. Email al trasportatore per prenotare il ritiro dal porto
Tutto in italiano, professionale.""", max_tokens=600)

    return {
        "step": 9, "stato": "trasportatore_prenotato",
        "pratica_id": body.pratica_id,
        "bozze_email": email_cliente,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 10: Conferma consegna e chiusura operativa ─────────────────────────

class ConsegnaInput(BaseModel):
    pratica_id: int
    cliente: str
    data_consegna: Optional[str] = ""
    note_consegna: Optional[str] = ""

@router.post("/step10/conferma-consegna")
async def step10_consegna(body: ConsegnaInput, user=Depends(get_current_user)):
    riepilogo = ai(f"""PF Ship Srl. Pratica #{body.pratica_id} - consegna effettuata.
Cliente: {body.cliente}
Data consegna: {body.data_consegna}
Note: {body.note_consegna}

Genera:
1. Email di conferma consegna al cliente
2. Checklist chiusura operativa (documenti da archiviare)
3. Istruzioni per passare pratica alla contabilità per fatturazione
In italiano, professionale.""", max_tokens=500)

    return {
        "step": 10, "stato": "consegna_confermata",
        "pratica_id": body.pratica_id,
        "riepilogo": riepilogo,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 11: Fatturazione (Ge.FA) ───────────────────────────────────────────

class FatturazioneInput(BaseModel):
    pratica_id: int
    cliente: str
    n_container: int
    descrizione_merce: str
    data_consegna: Optional[str] = ""

@router.post("/step11/fatturazione")
async def step11_fatturazione(body: FatturazioneInput, db: Session = Depends(get_mysql), user=Depends(get_current_user)):
    # Cerca tariffe cliente in Ge.FA
    tariffe = []
    try:
        rows = db.execute(text("""
            SELECT desc_clien, tipo_fattu, impo_impon, importo, anno_fattu
            FROM gefadcts
            WHERE desc_clien LIKE :cliente
              AND (cancellato = 0 OR cancellato IS NULL)
            ORDER BY anno_fattu DESC, id DESC
            LIMIT 5
        """), {"cliente": f"%{body.cliente[:20]}%"}).fetchall()
        tariffe = [dict(r._mapping) for r in rows]
    except:
        pass

    istruzioni = ai(f"""Contabile PF Ship Srl. Pratica #{body.pratica_id}.
Cliente: {body.cliente}
Spedizione: {body.n_container} container - {body.descrizione_merce}
Data consegna: {body.data_consegna}

Fatture precedenti trovate in Ge.FA: {json.dumps(tariffe, default=str) if tariffe else 'Nessuna trovata'}

Genera:
1. Voci da fatturare tipiche per una spedizione import da Cina ({body.n_container} container 40HC)
   (nolo marittimo, spese portuali, dogana, handling, trasporto, diritti)
2. Istruzioni per emettere fattura su Ge.FA
3. Riferimenti da indicare in fattura (B/L, n° pratica, ecc.)
In italiano.""", max_tokens=600)

    return {
        "step": 11, "stato": "fatturazione_preparata",
        "pratica_id": body.pratica_id,
        "fatture_precedenti": tariffe,
        "istruzioni": istruzioni,
        "timestamp": datetime.now().isoformat()
    }


# ─── STEP 12: Registrazione contabilità (Ge.CO) ──────────────────────────────

class ContabilitaInput(BaseModel):
    pratica_id: int
    cliente: str
    importo_fattura: Optional[float] = 0
    numero_fattura: Optional[str] = ""

@router.post("/step12/registra-contabilita")
async def step12_contabilita(body: ContabilitaInput, db: Session = Depends(get_mysql), user=Depends(get_current_user)):
    # Cerca cliente in Ge.CO
    soggetto = None
    try:
        row = db.execute(text("""
            SELECT ragi_socia, codi_conto, indirizzo, localita
            FROM cogeanag
            WHERE ragi_socia LIKE :nome
              AND (cancellato = 0 OR cancellato IS NULL)
            LIMIT 1
        """), {"nome": f"%{body.cliente[:20]}%"}).fetchone()
        if row:
            soggetto = dict(row._mapping)
    except:
        pass

    istruzioni = ai(f"""Contabile PF Ship Srl. Chiusura pratica #{body.pratica_id}.
Cliente: {body.cliente}
Importo fattura: €{body.importo_fattura} | N° fattura: {body.numero_fattura}
Dati Ge.CO: {json.dumps(soggetto, default=str) if soggetto else 'Cliente da verificare in anagrafica'}

Genera istruzioni per:
1. Registrazione fattura attiva in Ge.CO
2. Piano dei conti da usare
3. Scadenze di pagamento da monitorare
4. Chiusura definitiva pratica e archiviazione
In italiano, operativo.""", max_tokens=500)

    return {
        "step": 12, "stato": "pratica_chiusa",
        "pratica_id": body.pratica_id,
        "soggetto_coge": soggetto,
        "istruzioni": istruzioni,
        "timestamp": datetime.now().isoformat()
    }


# ─── Aggiorna step corrente ──────────────────────────────────────────────────

class AggiornaSteInput(BaseModel):
    pratica_id: int
    step: int

@router.post("/aggiorna-step")
async def aggiorna_step(body: AggiornaSteInput, db: AsyncSession = Depends(get_sqlite), user=Depends(get_current_user)):
    await db.execute(text(
        "UPDATE pratiche SET step_corrente = :step WHERE id = :id"
    ), {"step": body.step, "id": body.pratica_id})
    await db.commit()
    return {"ok": True}


# ─── Lista pratiche ───────────────────────────────────────────────────────────

@router.get("/pratiche")
async def lista_pratiche(db: AsyncSession = Depends(get_sqlite), user=Depends(get_current_user)):
    try:
        result = await db.execute(text("SELECT * FROM pratiche ORDER BY creata_il DESC"))
        rows = result.fetchall()
        return [dict(r._mapping) for r in rows]
    except:
        return []
