import { useEffect, useState } from 'react'
import api from '../api'

function euro(val) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val || 0)
}

export default function Fatture() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [anno, setAnno] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(q = '', a = '') {
    setLoading(true)
    try {
      const { data } = await api.get('/fatture', { params: { search: q, anno: a || 0, limit: 50 } })
      setItems(data.items)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleSearch(e) {
    e.preventDefault()
    load(search, anno)
  }

  const annoCorrente = new Date().getFullYear()
  const anni = Array.from({ length: 6 }, (_, i) => annoCorrente - i)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Fatture — Ge.FA</h2>
        <span className="text-sm text-gray-500">{total.toLocaleString('it-IT')} totali</span>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder="Cerca per cliente o numero..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={anno}
          onChange={e => setAnno(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tutti gli anni</option>
          {anni.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
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
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Anno/N°</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium text-right">Imponibile</th>
                <th className="px-4 py-3 font-medium text-right">IVA</th>
                <th className="px-4 py-3 font-medium text-right">Totale</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{f.anno_fattu}/{f.nume_docum}</td>
                  <td className="px-4 py-2.5 text-gray-600">{f.data_docum ? new Date(f.data_docum).toLocaleDateString('it-IT') : '—'}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800 max-w-[200px] truncate">{f.desc_clien || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      f.tipo_fattu === 'NC' ? 'bg-red-100 text-red-700' :
                      f.tipo_fattu === 'ND' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>{f.tipo_fattu || 'FA'}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{euro(f.impo_impon)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{euro(f.impo_iva)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold">{euro(f.importo)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Nessun risultato</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
