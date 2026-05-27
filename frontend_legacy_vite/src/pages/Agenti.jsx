import { useState, useEffect } from 'react'
import api from '../api'

function StepBadge({ n, attivo, completato }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
      completato ? 'bg-green-500 text-white' :
      attivo ? 'bg-blue-700 text-white' :
      'bg-gray-200 text-gray-400'
    }`}>
      {completato ? '✓' : n}
    </div>
  )
}

function AnalisiBox({ testo }) {
  if (!testo) return null
  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
      {testo}
    </div>
  )
}

function CopyBtn({ testo }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(testo); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="text-xs text-blue-600 hover:text-blue-800 ml-2">
      {copied ? '✓ Copiato' : '📋 Copia'}
    </button>
  )
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
const btnCls = "bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50"
const btn2Cls = "bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"

const STEPS = [
  { n: 1, label: 'Email' },
  { n: 2, label: 'Pratica' },
  { n: 3, label: 'Nave' },
  { n: 4, label: 'Richiesta doc.' },
  { n: 5, label: 'Controllo doc.' },
  { n: 6, label: 'Bolla' },
  { n: 7, label: 'Delivery' },
  { n: 8, label: 'Pagamento' },
  { n: 9, label: 'Trasporto' },
  { n: 10, label: 'Consegna' },
  { n: 11, label: 'Fattura' },
  { n: 12, label: 'Contabilità' },
]

const DOCS_OBB = ['Fattura commerciale', 'Packing list', 'Polizza di carico (B/L)']
const DOCS_RACC = ['Packing declaration', 'Certificato di origine']

export default function Agenti() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pratica, setPratica] = useState(null)
  const [praticaId, setPraticaId] = useState(null)
  const [pratiche, setPratiche] = useState([])

  // Inbox email
  const [inboxEmails, setInboxEmails] = useState([])
  const [inboxStatus, setInboxStatus] = useState(null)
  const [selectedEmail, setSelectedEmail] = useState(null)

  // Step 1
  const [emailTesto, setEmailTesto] = useState('')
  const [emailMeta, setEmailMeta] = useState(null)
  const [dati, setDati] = useState(null)
  const [richiestBooking, setRichiestaBooking] = useState('')

  // Step 2
  const [bookingConf, setBookingConf] = useState('')
  const [bookingConfermato, setBookingConfermato] = useState('')
  const [compagniaConfermata, setCompagniaConfermata] = useState('')
  const [naveConfermata, setNaveConfermata] = useState('')
  const [etaConfermata, setEtaConfermata] = useState('')

  // Step 3
  const [mmsi, setMmsi] = useState('')
  const [analisiNave, setAnalisiNave] = useState('')

  // Step 4
  const [emailCliente, setEmailCliente] = useState('')
  const [bozzaRichiesta, setBozzaRichiesta] = useState('')
  const [lingua4, setLingua4] = useState('italiano')
  const [noteExtra4, setNoteExtra4] = useState('')

  // Step 5
  const [docRicevuti, setDocRicevuti] = useState([])
  const [noteAnomalie, setNoteAnomalie] = useState('')
  const [risultatoDoc, setRisultatoDoc] = useState(null)
  const [lingua5, setLingua5] = useState('italiano')

  // Step 6
  const [bolla, setBolla] = useState(null)

  // Step 7
  const [istruzioniDO, setIstruzioniDO] = useState('')

  // Step 8
  const [importoFattura, setImportoFattura] = useState('')
  const [istruzioniPag, setIstruzioniPag] = useState('')

  // Step 9
  const [indirizzoConsegna, setIndirizzoConsegna] = useState('')
  const [bozzeEmail9, setBozzeEmail9] = useState('')

  // Step 10
  const [dataConsegna, setDataConsegna] = useState('')
  const [noteConsegna, setNoteConsegna] = useState('')
  const [riepilogoConsegna, setRiepilogoConsegna] = useState('')

  // Step 11
  const [istruzioniFattura, setIstruzioniFattura] = useState('')
  const [fattPrecedenti, setFattPrecedenti] = useState([])

  // Step 12
  const [numFattura, setNumFattura] = useState('')
  const [istruzioniCoge, setIstruzioniCoge] = useState('')

  // Carica inbox emails
  useEffect(() => {
    api.get('/agenti/inbox/emails').then(r => setInboxEmails(r.data.emails || [])).catch(() => {})
    api.get('/agenti/inbox/status').then(r => setInboxStatus(r.data)).catch(() => {})
    api.get('/agenti/pratiche').then(r => setPratiche(r.data)).catch(() => {})
  }, [praticaId])

  // Refresh inbox ogni 30s
  useEffect(() => {
    const interval = setInterval(() => {
      api.get('/agenti/inbox/emails').then(r => setInboxEmails(r.data.emails || [])).catch(() => {})
      api.get('/agenti/inbox/status').then(r => setInboxStatus(r.data)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  async function call(endpoint, body, onSuccess) {
    setLoading(true)
    try {
      const { data } = await api.post(endpoint, body)
      onSuccess(data)
    } catch (e) { alert('Errore: ' + (e.response?.data?.detail || e.message)) }
    setLoading(false)
  }

  async function avanza(nuovoStep) {
    setStep(nuovoStep)
    if (praticaId) {
      api.post('/agenti/aggiorna-step', { pratica_id: praticaId, step: nuovoStep }).catch(() => {})
    }
  }

  async function processEmailFromInbox(emailData) {
    setSelectedEmail(emailData)
    setEmailMeta({
      mittente: emailData.mittente,
      destinatari: emailData.destinatari,
      oggetto: emailData.oggetto,
      data: emailData.data,
      allegati: emailData.allegati || [],
    })
    setEmailTesto(emailData.corpo)
  }

  async function analizzaEmailDaInbox() {
    if (!selectedEmail) return
    setLoading(true)
    try {
      const { data } = await api.post('/agenti/inbox/process', { uid: selectedEmail.uid })
      setDati(data.dati_estratti)
      setRichiestaBooking(data.dati_estratti?.richiesta_booking_carrier || '')
      if (data.dati_estratti?.compagnia_preferita) setCompagniaConfermata(data.dati_estratti.compagnia_preferita)
      if (data.dati_estratti?.spedizione?.nave_richiesta) setNaveConfermata(data.dati_estratti.spedizione.nave_richiesta)
      if (data.dati_estratti?.spedizione?.eta_italia_richiesta) setEtaConfermata(data.dati_estratti.spedizione.eta_italia_richiesta)
    } catch { alert('Errore nell\'analisi email') }
    setLoading(false)
  }

  function nuovaPratica() {
    setStep(1); setEmailTesto(''); setEmailMeta(null); setDati(null)
    setPraticaId(null); setPratica(null); setBookingConf(''); setMmsi('')
    setAnalisiNave(''); setEmailCliente(''); setBozzaRichiesta('')
    setDocRicevuti([]); setNoteAnomalie(''); setRisultatoDoc(null)
    setBolla(null); setIstruzioniDO(''); setRichiestaBooking('')
    setBookingConfermato(''); setCompagniaConfermata(''); setNaveConfermata(''); setEtaConfermata('')
    setImportoFattura(''); setIstruzioniPag(''); setIndirizzoConsegna('')
    setBozzeEmail9(''); setDataConsegna(''); setNoteConsegna('')
    setRiepilogoConsegna(''); setIstruzioniFattura(''); setFattPrecedenti([])
    setNumFattura(''); setIstruzioniCoge('')
    setSelectedEmail(null)
  }

  function riprendi(p) {
    setPraticaId(p.id)
    setPratica(p)
    setDati({
      tipo_richiesta: 'ordine_spedizione',
      cliente: { nome: p.cliente, paese: p.paese_origine, piva: p.consignee_piva },
      shipper: { nome: p.shipper, paese: 'CN' },
      spedizione: {
        n_container: p.n_container, tipo_container: p.tipo_container,
        descrizione_merce: p.descrizione_merce, porto_carico: p.porto_carico,
        porto_scarico: p.porto_scarico, eta_italia: p.eta_italia,
        nave: p.nave, booking_number: p.booking_number,
        hbl_number: p.hbl_number, container_number: p.container_number,
        seal_number: p.seal_number,
        peso_totale_kg: p.peso_totale_kg, peso_netto_kg: p.peso_netto_kg,
        n_colli: p.n_colli, n_pezzi: p.n_pezzi,
      },
      compagnia_navigazione: p.compagnia_navigazione,
      bl_number: p.bl_number, urgenza: p.urgenza,
      invoice_number: p.invoice_number, valore_merce_eur: p.valore_merce_eur,
    })
    setBookingConfermato(p.booking_number || '')
    setCompagniaConfermata(p.compagnia_navigazione || '')
    setNaveConfermata(p.nave || '')
    setEtaConfermata(p.eta_italia || '')
    setStep(p.step_corrente || 3)
  }

  const sp = dati?.spedizione || {}
  const cl = dati?.cliente || {}

  const emailNonProcessate = inboxEmails.filter(e => e.status === 'received')

  // ── Render step content ──────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Flusso Import</h2>
          <p className="text-xs text-gray-400">Agenti AI — 12 step dal booking alla contabilità</p>
        </div>
        <button onClick={nuovaPratica} className={btn2Cls}>+ Nuova</button>
      </div>

      {/* Progress mini */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {STEPS.map(s => (
          <div key={s.n} className="flex items-center gap-1">
            <StepBadge n={s.n} attivo={step === s.n} completato={step > s.n} />
            {s.n < STEPS.length && <div className={`w-3 h-0.5 ${step > s.n ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {praticaId && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-4 text-xs text-green-800">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-sm">Pratica #{praticaId} — {cl.nome}</span>
            <span className="text-green-600 font-medium">Step {step}/12</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-green-700">
            {sp.container_number && <span>📦 {sp.container_number} ({sp.tipo_container})</span>}
            {dati?.hbl_number && <span>HBL: <span className="font-mono">{dati.hbl_number}</span></span>}
            {dati?.bl_number && <span>MBL: <span className="font-mono">{dati.bl_number}</span></span>}
            {dati?.invoice_number && <span>Invoice: {dati.invoice_number}</span>}
            {dati?.valore_merce_eur > 0 && <span>€ {Number(dati.valore_merce_eur).toLocaleString('it-IT', {minimumFractionDigits:2})}</span>}
            {sp.n_colli > 0 && <span>{sp.n_colli} colli · {sp.peso_totale_kg} KGS · {sp.n_pezzi?.toLocaleString('it-IT')} pcs</span>}
            {sp.nave && <span>🛳 {sp.nave}</span>}
            {sp.eta_italia && <span>ETA: {sp.eta_italia}</span>}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">📧 Step 1 — Ordine dal cliente / agente Cina</h3>
            <p className="text-xs text-gray-400 mb-4">Seleziona un'email dall'inbox. L'AI estrae i dati e genera la richiesta di booking da inviare alla compagnia di navigazione.</p>

            {/* Inbox status */}
            {inboxStatus && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${inboxStatus.running ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-gray-600">
                    {inboxStatus.total_emails} email ricevute
                    {emailNonProcessate.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {emailNonProcessate.length} nuove
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-gray-400">
                  Ultimo polling: {inboxStatus.last_poll ? new Date(inboxStatus.last_poll).toLocaleTimeString('it-IT') : 'Mai'}
                </span>
              </div>
            )}

            {/* Lista email inbox */}
            {inboxEmails.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Email ricevute:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {inboxEmails.map((email, idx) => (
                    <div
                      key={email.uid || idx}
                      onClick={() => processEmailFromInbox(email)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEmail?.uid === email.uid
                          ? 'border-blue-500 bg-blue-50'
                          : email.status === 'received'
                          ? 'border-gray-200 bg-white hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {email.status === 'received' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{email.mittente}</span>
                        </div>
                        <span className="text-xs text-gray-400">{email.data ? new Date(email.data).toLocaleDateString('it-IT') : ''}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{email.oggetto}</p>
                      {email.status === 'processed' && (
                        <span className="text-xs text-green-600 mt-1">✓ Processata</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {emailMeta && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 mb-3">
                <p><span className="text-gray-400">Da:</span> <strong>{emailMeta.mittente}</strong></p>
                <p><span className="text-gray-400">Oggetto:</span> {emailMeta.oggetto}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {emailMeta.allegati?.filter(a => !a.testo.startsWith('(') && !a.testo.startsWith('[Err')).map((a, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">✓ {a.nome}</span>
                  ))}
                </div>
              </div>
            )}

            <textarea value={emailTesto} onChange={e => setEmailTesto(e.target.value)}
              rows={emailMeta ? 3 : 7} placeholder="Seleziona un'email dall'inbox o incolla il testo qui..."
              className={`${inputCls} resize-none font-mono text-xs mb-3`} />

            {richiestBooking && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-green-700">✅ Richiesta booking generata — da inviare alla compagnia</p>
                  <CopyBtn testo={richiestBooking} />
                </div>
                <pre className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs whitespace-pre-wrap">{richiestBooking}</pre>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              {dati && !richiestBooking && (
                <button onClick={() => avanza(2)} className={btnCls}>Avanti →</button>
              )}
              <button onClick={analizzaEmailDaInbox}
                disabled={loading || !selectedEmail} className={btnCls}>
                {loading ? 'Analisi...' : richiestBooking ? '↺ Rigenera' : 'Analizza ordine →'}
              </button>
              <button onClick={() => call('/agenti/step1/leggi-email',
                { testo_email: emailTesto, allegati: emailMeta?.allegati || [] },
                d => {
                  setDati(d.dati_estratti)
                  setRichiestaBooking(d.dati_estratti?.richiesta_booking_carrier || '')
                  if (d.dati_estratti?.compagnia_preferita) setCompagniaConfermata(d.dati_estratti.compagnia_preferita)
                  if (d.dati_estratti?.spedizione?.nave_richiesta) setNaveConfermata(d.dati_estratti.spedizione.nave_richiesta)
                  if (d.dati_estratti?.spedizione?.eta_italia_richiesta) setEtaConfermata(d.dati_estratti.spedizione.eta_italia_richiesta)
                }
              )} disabled={loading || !emailTesto.trim()} className={btn2Cls}>
                {loading ? 'Analisi...' : 'Analizza (testo)'}
              </button>
              {richiestBooking && (
                <button onClick={() => avanza(2)} className={btnCls}>Avanti — inserisci booking →</button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && dati && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">📂 Step 2 — Booking confermato dalla compagnia</h3>
            <p className="text-xs text-gray-400 mb-4">Inserisci i dati della booking confirmation ricevuta dalla compagnia di navigazione (COSCO, Maersk, MSC…)</p>

            {/* Dati dall'ordine — riepilogo */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              {[
                ['Cliente', `${cl.nome} (${cl.paese || 'IT'})`],
                ['Merce', sp.descrizione_merce],
                ['Container richiesti', `${sp.n_container} × ${sp.tipo_container}`],
                ['Porto carico', sp.porto_carico],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-400">{k}</p>
                  <p className="font-medium text-sm">{v || '—'}</p>
                </div>
              ))}
            </div>

            {/* Campi confermati dal carrier */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-xs font-semibold text-blue-700 mb-3">📬 Dati ricevuti dalla compagnia di navigazione</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Booking Number *</label>
                  <input value={bookingConfermato} onChange={e => setBookingConfermato(e.target.value)}
                    placeholder="es. COSU6289374560" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Compagnia</label>
                  <select value={compagniaConfermata} onChange={e => setCompagniaConfermata(e.target.value)} className={inputCls}>
                    <option value="">— seleziona —</option>
                    {['COSCO','Maersk','MSC','Hapag-Lloyd','CMA CGM','Evergreen','Yang Ming','ONE'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nave confermata</label>
                  <input value={naveConfermata} onChange={e => setNaveConfermata(e.target.value)}
                    placeholder="es. BANGKOK EXPRESS" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">ETA Napoli confermata</label>
                  <input type="date" value={etaConfermata} onChange={e => setEtaConfermata(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>

            {bookingConf && (
              <details className="mb-4">
                <summary className="text-sm font-medium text-gray-600 cursor-pointer">📨 Conferma d'ordine interna generata <CopyBtn testo={bookingConf} /></summary>
                <pre className="mt-2 bg-gray-50 rounded p-3 text-xs whitespace-pre-wrap">{bookingConf}</pre>
              </details>
            )}

            <div className="flex gap-3 justify-end">
              <button onClick={() => setStep(1)} className={btn2Cls}>← Torna</button>
              <button onClick={() => call('/agenti/step2/apri-pratica',
                {
                  dati_spedizione: dati,
                  booking_number_confermato: bookingConfermato,
                  compagnia_navigazione: compagniaConfermata,
                  nave_confermata: naveConfermata,
                  eta_confermata: etaConfermata,
                  note_operatore: '',
                  allegati: emailMeta?.allegati || []
                },
                d => { setPraticaId(d.pratica_id); setBookingConf(d.booking_confirmation); avanza(3) }
              )} disabled={loading || !bookingConfermato.trim()} className={btnCls}>
                {loading ? 'Apertura...' : 'Apri pratica →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🛳️ Step 3 — Monitora nave</h3>
            <p className="text-xs text-gray-500 mb-3">MMSI opzionale — senza MMSI usa ETA dichiarata</p>
            <input value={mmsi} onChange={e => setMmsi(e.target.value)}
              placeholder="MMSI nave (opzionale)" className={`${inputCls} mb-3`} />
            {analisiNave && <AnalisiBox testo={analisiNave} />}
            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => call('/agenti/step3/monitora-nave',
                { pratica_id: praticaId, mmsi: mmsi || null },
                d => setAnalisiNave(d.analisi)
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '🔄 Aggiorna tracking'}
              </button>
              <button onClick={() => avanza(4)} className={btnCls}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">📬 Step 4 — Richiedi documenti al cliente</h3>
            <p className="text-xs text-gray-400 mb-3">Email cliente e dati di spedizione letti automaticamente dalla pratica e dall'anagrafica (Ge.DO).</p>
            {emailCliente && (
              <div className="mb-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                📧 Email trovata in anagrafica: <strong>{emailCliente}</strong>
              </div>
            )}
            <div className="flex gap-2 mb-3">
              <select value={lingua4} onChange={e => setLingua4(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="italiano">🇮🇹 Italiano</option>
                <option value="inglese">🇬🇧 English</option>
                <option value="cinese">🇨🇳 中文</option>
              </select>
              <input value={noteExtra4} onChange={e => setNoteExtra4(e.target.value)}
                placeholder="Note aggiuntive (opzionale)" className={inputCls} />
            </div>
            {bozzaRichiesta && (
              <div className="mb-3">
                <div className="flex items-center mb-1">
                  <span className="text-xs text-gray-500">Bozza email richiesta documenti</span>
                  <CopyBtn testo={bozzaRichiesta} />
                </div>
                <pre className="bg-gray-50 rounded-lg p-3 text-xs whitespace-pre-wrap">{bozzaRichiesta}</pre>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => call('/agenti/step4/richiedi-documenti',
                { pratica_id: praticaId, lingua: lingua4, note_extra: noteExtra4 },
                d => { setBozzaRichiesta(d.bozza_email); if (d.email_cliente) setEmailCliente(d.email_cliente) }
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '📝 Genera email'}
              </button>
              <button onClick={() => avanza(5)} className={btnCls}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 5 ── */}
        {step === 5 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">✅ Step 5 — Controlla documenti ricevuti</h3>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Obbligatori *</p>
              {DOCS_OBB.map(d => (
                <label key={d} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-gray-50">
                  <input type="checkbox" checked={docRicevuti.includes(d)}
                    onChange={() => setDocRicevuti(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])} />
                  {d}
                </label>
              ))}
              <p className="text-xs font-medium text-gray-600 mb-2 mt-2">Raccomandati</p>
              {DOCS_RACC.map(d => (
                <label key={d} className="flex items-center gap-2 text-sm cursor-pointer p-1.5 rounded hover:bg-gray-50">
                  <input type="checkbox" checked={docRicevuti.includes(d)}
                    onChange={() => setDocRicevuti(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])} />
                  {d}
                </label>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <textarea value={noteAnomalie} onChange={e => setNoteAnomalie(e.target.value)}
                placeholder="Anomalie rilevate..." rows={2} className={`${inputCls} resize-none`} />
              <select value={lingua5} onChange={e => setLingua5(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0 h-fit">
                <option value="italiano">🇮🇹 IT</option>
                <option value="inglese">🇬🇧 EN</option>
                <option value="cinese">🇨🇳 ZH</option>
              </select>
            </div>
            {risultatoDoc && (
              <div className={`p-2 rounded mb-2 text-sm font-medium ${risultatoDoc.stato === 'OK' ? 'bg-green-100 text-green-700' : risultatoDoc.stato === 'BLOCCATO' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {risultatoDoc.stato} {risultatoDoc.mancanti_obbligatori?.length > 0 && `— Mancano: ${risultatoDoc.mancanti_obbligatori.join(', ')}`}
              </div>
            )}
            {risultatoDoc?.azione && <><AnalisiBox testo={risultatoDoc.azione} /><CopyBtn testo={risultatoDoc.azione} /></>}
            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => call('/agenti/step5/controlla-documenti',
                { pratica_id: praticaId, documenti_ricevuti: docRicevuti, note_anomalie: noteAnomalie, lingua: lingua5 },
                d => setRisultatoDoc(d)
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : 'Verifica'}
              </button>
              {(risultatoDoc?.stato === 'OK' || risultatoDoc?.stato === 'INCOMPLETO') && (
                <button onClick={() => avanza(6)} className={btnCls}>Avanti →</button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 6 ── */}
        {step === 6 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">📄 Step 6 — Bolla doganale (PRADO)</h3>
            <p className="text-xs text-gray-400 mb-4">Dati estratti automaticamente dagli allegati. Verifica e correggi se necessario.</p>

            {!bolla ? (
              <div className="text-center py-6">
                <button onClick={() => call('/agenti/step6/bolla-doganale',
                  { pratica_id: praticaId },
                  d => setBolla(d.bolla)
                )} disabled={loading} className={btnCls}>
                  {loading ? '⏳ Estrazione dati dagli allegati...' : '🤖 Pre-compila bolla da documenti'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">

                {/* Importatore */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Importatore</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Ragione Sociale', 'ragione_sociale'],
                      ['P.IVA', 'piva'],
                      ['Indirizzo', 'indirizzo'],
                      ['Città', 'citta'],
                    ].map(([label, key]) => (
                      <div key={key}>
                        <label className="text-xs text-gray-400">{label}</label>
                        <input value={bolla.importatore?.[key] || ''}
                          onChange={e => setBolla(b => ({ ...b, importatore: { ...b.importatore, [key]: e.target.value } }))}
                          className={inputCls} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trasporto */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Trasporto</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Nave', 'nome_nave'],
                      ['Viaggio', 'viaggio'],
                      ['B/L', 'bl_number'],
                      ['Porto carico', 'porto_carico'],
                      ['Porto scarico', 'porto_scarico'],
                      ['Data imbarco', 'data_imbarco'],
                    ].map(([label, key]) => (
                      <div key={key}>
                        <label className="text-xs text-gray-400">{label}</label>
                        <input value={bolla.trasporto?.[key] || ''}
                          onChange={e => setBolla(b => ({ ...b, trasporto: { ...b.trasporto, [key]: e.target.value } }))}
                          className={inputCls} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Merci */}
                {bolla.merci?.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Merci ({bolla.merci.length} voci)</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            {['Descrizione', 'Cod. HS', 'Qtà', 'Peso Lordo kg', 'Valore €', 'Dazio %'].map(h => (
                              <th key={h} className="text-left px-2 py-1 text-gray-500 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bolla.merci.map((m, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-2 py-1">
                                <input value={m.descrizione || ''} onChange={e => {
                                  const merci = [...bolla.merci]; merci[i] = { ...merci[i], descrizione: e.target.value }
                                  setBolla(b => ({ ...b, merci }))
                                }} className="w-full border-0 bg-transparent text-xs p-0 focus:outline-none focus:bg-blue-50 rounded px-1" />
                              </td>
                              <td className="px-2 py-1">
                                <input value={m.codice_hs || ''} onChange={e => {
                                  const merci = [...bolla.merci]; merci[i] = { ...merci[i], codice_hs: e.target.value }
                                  setBolla(b => ({ ...b, merci }))
                                }} className="w-24 border-0 bg-transparent text-xs p-0 focus:outline-none focus:bg-blue-50 rounded px-1 font-mono" />
                              </td>
                              <td className="px-2 py-1 text-gray-600">{m.quantita} {m.unita}</td>
                              <td className="px-2 py-1 text-gray-600">{m.peso_lordo_kg}</td>
                              <td className="px-2 py-1 text-gray-600">{m.valore_eur}</td>
                              <td className="px-2 py-1 text-gray-600">{m.dazio_pct}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totali */}
                {bolla.totali && (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Totali</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      {[
                        ['Colli totali', bolla.totali.colli_totali],
                        ['Peso lordo kg', bolla.totali.peso_lordo_kg],
                        ['Peso netto kg', bolla.totali.peso_netto_kg],
                        ['Valore totale €', bolla.totali.valore_totale_eur],
                        ['Totale dazi €', bolla.totali.totale_dazi],
                        ['IVA 22% €', bolla.totali.totale_iva],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="text-xs text-gray-500">{k}</p>
                          <p className="font-semibold">{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bolla.note_prado && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                    <p className="font-semibold mb-1">📌 Note per PRADO:</p>
                    {bolla.note_prado}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end mt-4">
              {bolla && <button onClick={() => setBolla(null)} className={btn2Cls}>🔄 Rigenera</button>}
              <button onClick={() => avanza(7)} className={btnCls}>
                {bolla ? 'Confermo dati →' : 'Salta →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 7 ── */}
        {step === 7 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">🚢 Step 7 — Richiesta Delivery Order</h3>
            <p className="text-xs text-gray-400 mb-3">B/L, booking, compagnia e cliente letti automaticamente dalla pratica.</p>
            {istruzioniDO && <AnalisiBox testo={istruzioniDO} />}
            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => call('/agenti/step7/delivery-order',
                { pratica_id: praticaId },
                d => setIstruzioniDO(d.istruzioni)
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '📝 Genera richiesta'}
              </button>
              <button onClick={() => avanza(8)} className={btnCls}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 8 ── */}
        {step === 8 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">💳 Step 8 — Pagamento fatture compagnia</h3>
            <div className="flex gap-2 mb-3">
              <input value={importoFattura} onChange={e => setImportoFattura(e.target.value)}
                placeholder="Importo fattura" className={inputCls} />
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>USD</option><option>EUR</option>
              </select>
            </div>
            {istruzioniPag && <AnalisiBox testo={istruzioniPag} />}
            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => call('/agenti/step8/pagamento-fatture',
                { pratica_id: praticaId, importo_fattura: parseFloat(importoFattura) || 0, valuta: 'USD' },
                d => setIstruzioniPag(d.istruzioni)
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '📋 Istruzioni pagamento'}
              </button>
              <button onClick={() => avanza(9)} className={btnCls}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 9 ── */}
        {step === 9 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">🚛 Step 9 — Prenotazione trasportatore</h3>
            <p className="text-xs text-gray-400 mb-3">Indirizzo consegna letto da Ge.DO (anagrafica MySQL). Email e dati pratica ripresi automaticamente.</p>
            {indirizzoConsegna && (
              <div className="mb-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                📍 Indirizzo da anagrafica: <strong>{indirizzoConsegna}</strong>
              </div>
            )}
            {bozzeEmail9 && <><AnalisiBox testo={bozzeEmail9} /><CopyBtn testo={bozzeEmail9} /></>}
            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => call('/agenti/step9/prenota-trasportatore',
                { pratica_id: praticaId },
                d => { setBozzeEmail9(d.bozze_email); if (d.indirizzo_consegna) setIndirizzoConsegna(d.indirizzo_consegna) }
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '📝 Genera email'}
              </button>
              <button onClick={() => avanza(10)} className={btnCls}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 10 ── */}
        {step === 10 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">📦 Step 10 — Conferma consegna</h3>
            <div className="flex gap-2 mb-3">
              <input value={dataConsegna} onChange={e => setDataConsegna(e.target.value)}
                placeholder="Data consegna (gg/mm/aaaa)" className={inputCls} />
            </div>
            <textarea value={noteConsegna} onChange={e => setNoteConsegna(e.target.value)}
              placeholder="Note consegna..." rows={2} className={`${inputCls} resize-none mb-3`} />
            {riepilogoConsegna && <><AnalisiBox testo={riepilogoConsegna} /><CopyBtn testo={riepilogoConsegna} /></>}
            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => call('/agenti/step10/conferma-consegna',
                { pratica_id: praticaId, data_consegna: dataConsegna, note_consegna: noteConsegna },
                d => setRiepilogoConsegna(d.riepilogo)
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '📋 Genera riepilogo'}
              </button>
              <button onClick={() => avanza(11)} className={btnCls}>Avanti: Fattura →</button>
            </div>
          </div>
        )}

        {/* ── STEP 11 ── */}
        {step === 11 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">🧾 Step 11 — Fatturazione (Ge.FA)</h3>
            {fattPrecedenti.length > 0 && (
              <div className="mb-3 p-3 bg-yellow-50 rounded-lg text-xs">
                <p className="font-medium text-yellow-800 mb-1">Fatture precedenti per {cl.nome}:</p>
                {fattPrecedenti.slice(0, 3).map((f, i) => (
                  <p key={i} className="text-yellow-700">{f.anno_fattu} — {f.tipo_fattu} — €{parseFloat(f.importo || 0).toFixed(2)}</p>
                ))}
              </div>
            )}
            {istruzioniFattura && <AnalisiBox testo={istruzioniFattura} />}
            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => call('/agenti/step11/fatturazione',
                { pratica_id: praticaId, data_consegna: dataConsegna },
                d => { setIstruzioniFattura(d.istruzioni); setFattPrecedenti(d.fatture_precedenti || []) }
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '📊 Genera istruzioni fattura'}
              </button>
              <button onClick={() => avanza(12)} className={btnCls}>Avanti →</button>
            </div>
          </div>
        )}

        {/* ── STEP 12 ── */}
        {step === 12 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">📒 Step 12 — Registrazione contabilità (Ge.CO)</h3>
            <input value={numFattura} onChange={e => setNumFattura(e.target.value)}
              placeholder="Numero fattura emessa" className={`${inputCls} mb-3`} />
            {istruzioniCoge && <AnalisiBox testo={istruzioniCoge} />}
            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => call('/agenti/step12/registra-contabilita',
                { pratica_id: praticaId, importo_fattura: parseFloat(importoFattura) || 0, numero_fattura: numFattura },
                d => setIstruzioniCoge(d.istruzioni)
              )} disabled={loading} className={btn2Cls}>
                {loading ? '...' : '📋 Istruzioni Ge.CO'}
              </button>
            </div>
            {istruzioniCoge && (
              <div className="mt-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-bold text-gray-800">Pratica #{praticaId} completata!</p>
                <p className="text-sm text-gray-500 mb-4">Dal booking alla registrazione contabile</p>
                <button onClick={nuovaPratica} className={btnCls}>+ Nuova pratica</button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Pratiche recenti */}
      {pratiche.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Pratiche recenti — clicca per riprendere</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left text-gray-400 font-medium">
                  <th className="pb-1 pr-2">#</th>
                  <th className="pb-1 pr-2">Cliente</th>
                  <th className="pb-1 pr-2">Container</th>
                  <th className="pb-1 pr-2">HBL</th>
                  <th className="pb-1 pr-2">Merce</th>
                  <th className="pb-1 pr-2 text-right">Valore €</th>
                  <th className="pb-1 pr-2 text-right">Colli</th>
                  <th className="pb-1 pr-2">ETA</th>
                  <th className="pb-1 pr-2">Step</th>
                </tr>
              </thead>
              <tbody>
                {pratiche.slice(0, 12).map(p => (
                  <tr key={p.id} onClick={() => riprendi(p)}
                    className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors">
                    <td className="py-2 pr-2 font-medium text-blue-700">{p.id}</td>
                    <td className="py-2 pr-2 font-medium text-gray-800 max-w-[120px] truncate">{p.cliente}</td>
                    <td className="py-2 pr-2 font-mono text-gray-600">{p.container_number || '—'}</td>
                    <td className="py-2 pr-2 font-mono text-gray-500 text-xs">{p.hbl_number || '—'}</td>
                    <td className="py-2 pr-2 text-gray-500 max-w-[140px] truncate">{p.descrizione_merce?.split(' - ')[0] || p.descrizione_merce || '—'}</td>
                    <td className="py-2 pr-2 text-right text-gray-700 font-medium">
                      {p.valore_merce_eur ? `€ ${Number(p.valore_merce_eur).toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2})}` : '—'}
                    </td>
                    <td className="py-2 pr-2 text-right text-gray-600">{p.n_colli || '—'}</td>
                    <td className="py-2 pr-2 text-gray-500">{p.eta_italia || '—'}</td>
                    <td className="py-2 pr-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        (p.step_corrente || 2) >= 10 ? 'bg-green-100 text-green-700' :
                        (p.step_corrente || 2) >= 6 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {p.step_corrente || 2}/12
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
