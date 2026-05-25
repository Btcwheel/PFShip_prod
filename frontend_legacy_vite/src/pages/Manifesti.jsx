import { useEffect, useState } from 'react'
import api from '../api'

export default function Manifesti() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/manifesti', { params: { limit: 100 } })
      .then(r => { setItems(r.data.items); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manifesti</h2>
        <span className="text-sm text-gray-500">{total} totali</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Caricamento...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Utente</th>
                <th className="px-4 py-3 font-medium">File Richiesta</th>
                <th className="px-4 py-3 font-medium">Esito</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{m.id}</td>
                  <td className="px-4 py-3">{m.data ? new Date(m.data).toLocaleDateString('it-IT') : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{m.DATANULL ? new Date(m.DATANULL).toLocaleString('it-IT') : '—'}</td>
                  <td className="px-4 py-3">{m.utente || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-[200px]">{m.file_richiesta || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.FILE_ESITO ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {m.FILE_ESITO || 'N/D'}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nessun manifesto trovato</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
