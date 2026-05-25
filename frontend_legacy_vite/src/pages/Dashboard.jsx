import { useEffect, useState } from 'react'
import api from '../api'

function StatCard({ label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-5`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function euro(val) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(val || 0)
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setError('Errore caricamento statistiche'))
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Card statistiche */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatCard label="Fatture totali" value={stats?.totale_fatture?.toLocaleString('it-IT')} color="border-blue-500" sub="Ge.FA" />
        <StatCard label={`Fatture ${new Date().getFullYear()}`} value={stats?.fatture_anno?.toLocaleString('it-IT')} color="border-green-500" sub="anno corrente" />
        <StatCard label={`Fatturato ${new Date().getFullYear()}`} value={euro(stats?.fatturato_anno)} color="border-emerald-500" sub="anno corrente" />
        <StatCard label="Anagrafiche" value={stats?.totale_anagrafiche?.toLocaleString('it-IT')} color="border-yellow-500" sub="Ge.DO" />
        <StatCard label="Soggetti CoGe" value={stats?.totale_coge?.toLocaleString('it-IT')} color="border-purple-500" sub="Ge.CO" />
      </div>

      {/* Ricavi per tipo */}
      {stats?.ricavi_per_tipo?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ricavi totali per tipo documento</h3>
          <div className="flex flex-wrap gap-4">
            {stats.ricavi_per_tipo.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">{r.tipo_fattu || '—'}</span>
                <span className="text-sm font-semibold">{euro(r.totale)}</span>
                <span className="text-xs text-gray-400">({Number(r.num).toLocaleString('it-IT')} doc.)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Ultime fatture */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Ultime fatture — Ge.FA</h3>
          {stats?.ultime_fatture?.length ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b text-xs uppercase tracking-wide">
                  <th className="pb-2 font-medium">Anno/N°</th>
                  <th className="pb-2 font-medium">Data</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium text-right">Importo</th>
                </tr>
              </thead>
              <tbody>
                {stats.ultime_fatture.map((f, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs text-gray-500">{f.anno_fattu}/{f.nume_docum}</td>
                    <td className="py-2 text-gray-600">{f.data_docum ? new Date(f.data_docum).toLocaleDateString('it-IT') : '—'}</td>
                    <td className="py-2 font-medium text-gray-800 truncate max-w-[180px]">{f.desc_clien || '—'}</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">{f.tipo_fattu || 'FA'}</span>
                    </td>
                    <td className="py-2 text-right font-medium">{euro(f.importo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-sm">{stats ? 'Nessuna fattura trovata' : 'Caricamento...'}</p>
          )}
        </div>

        {/* Fatturato per anno */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Fatturato per anno</h3>
          {stats?.fatturato_per_anno?.length ? (
            <div className="space-y-3">
              {stats.fatturato_per_anno.map((r, i) => {
                const max = Math.max(...stats.fatturato_per_anno.map(x => Number(x.totale)))
                const pct = max > 0 ? (Number(r.totale) / max) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{r.anno_fattu}</span>
                      <span className="text-gray-500 text-xs">{Number(r.num_fatture).toLocaleString('it-IT')} fatture</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{euro(r.totale)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">{stats ? 'Nessun dato' : 'Caricamento...'}</p>
          )}
        </div>
      </div>
    </div>
  )
}
