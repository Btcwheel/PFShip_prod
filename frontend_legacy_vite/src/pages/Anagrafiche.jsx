import { useEffect, useState } from 'react'
import api from '../api'

export default function Anagrafiche() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(q = '') {
    setLoading(true)
    try {
      const { data } = await api.get('/anagrafiche', { params: { search: q, limit: 50 } })
      setItems(data.items)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleSearch(e) {
    e.preventDefault()
    load(search)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Anagrafiche</h2>
        <span className="text-sm text-gray-500">{total} totali</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Cerca per ragione sociale, P.IVA, CF..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          Cerca
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Caricamento...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Ragione Sociale</th>
                <th className="px-4 py-3 font-medium">Indirizzo</th>
                <th className="px-4 py-3 font-medium">Città</th>
                <th className="px-4 py-3 font-medium">P.IVA</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Telefono</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-blue-800">{a.ragi_socia || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{a.indirizzo || '—'}</td>
                  <td className="px-4 py-3">{[a.localita, a.provincia].filter(Boolean).join(' (') + (a.provincia ? ')' : '')}</td>
                  <td className="px-4 py-3 font-mono text-xs">{a.part_iva || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{a.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{a.nume_telef || '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nessun risultato</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
