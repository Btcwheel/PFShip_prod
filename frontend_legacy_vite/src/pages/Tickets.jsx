import { useEffect, useState } from 'react'
import api from '../api'

const PRIORITA = ['normale', 'alta', 'urgente']

export default function Tickets() {
  const [tickets, setTickets] = useState([])
  const [form, setForm] = useState({ titolo: '', descrizione: '', priorita: 'normale' })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    setLoading(true)
    api.get('/tickets').then(r => setTickets(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.titolo.trim()) return
    setSubmitting(true)
    try {
      await api.post('/tickets', form)
      setForm({ titolo: '', descrizione: '', priorita: 'normale' })
      load()
    } finally {
      setSubmitting(false)
    }
  }

  async function chiudi(id) {
    await api.patch(`/tickets/${id}/chiudi`)
    load()
  }

  const prioritaColor = { normale: 'bg-blue-100 text-blue-700', alta: 'bg-yellow-100 text-yellow-700', urgente: 'bg-red-100 text-red-700' }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tickets</h2>

      {/* Form nuovo ticket */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Nuovo ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Titolo *"
            value={form.titolo}
            onChange={e => setForm(f => ({ ...f, titolo: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <textarea
            placeholder="Descrizione (opzionale)"
            value={form.descrizione}
            onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-3 items-center">
            <select
              value={form.priorita}
              onChange={e => setForm(f => ({ ...f, priorita: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PRIORITA.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Salvataggio...' : 'Crea ticket'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista tickets */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-8">Caricamento...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Nessun ticket ancora</p>
        ) : (
          tickets.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{t.titolo}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prioritaColor[t.priorita] || 'bg-gray-100 text-gray-500'}`}>
                    {t.priorita}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${t.stato === 'chiuso' ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700'}`}>
                    {t.stato}
                  </span>
                </div>
                {t.descrizione && <p className="text-sm text-gray-500">{t.descrizione}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {t.utente} · {new Date(t.creato_il).toLocaleString('it-IT')}
                </p>
              </div>
              {t.stato !== 'chiuso' && (
                <button
                  onClick={() => chiudi(t.id)}
                  className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 transition-colors"
                >
                  Chiudi
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
