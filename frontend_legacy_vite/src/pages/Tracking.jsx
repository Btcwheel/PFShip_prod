import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../api'

// Fix icone Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const NAPOLI = [40.8440, 14.2684]

function createShipIcon(heading = 0) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;
      background:#1d4ed8;
      border-radius:50% 50% 50% 0;
      transform:rotate(${heading - 45}deg);
      border:3px solid white;
      box-shadow:0 2px 10px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

const portIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;background:#dc2626;
    border-radius:50%;border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
    font-size:14px;
  ">⚓</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

export default function Tracking() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const shipMarkerRef = useRef(null)
  const portMarkerRef = useRef(null)
  const lineRef = useRef(null)

  const [mmsi, setMmsi] = useState('')
  const [vesselData, setVesselData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [pratiche, setPratiche] = useState([])
  const intervalRef = useRef(null)

  // Init mappa
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [35.0, 15.0],
      zoom: 5,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)

    // Porto di Napoli
    const porto = L.marker(NAPOLI, { icon: portIcon }).addTo(map)
    porto.bindPopup('<strong>⚓ Porto di Napoli</strong><br>40.844°N 14.268°E')
    portMarkerRef.current = porto

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Aggiorna marker nave sulla mappa
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !vesselData) return

    const pos = [parseFloat(vesselData.lat), parseFloat(vesselData.lon)]

    // Rimuovi marker precedente
    if (shipMarkerRef.current) shipMarkerRef.current.remove()
    if (lineRef.current) lineRef.current.remove()

    // Marker nave
    const marker = L.marker(pos, { icon: createShipIcon(vesselData.heading || 0) }).addTo(map)
    marker.bindPopup(`
      <div style="min-width:160px">
        <strong style="color:#1d4ed8">${vesselData.vessel_name || 'N/D'}</strong>
        ${vesselData.mock ? '<span style="color:orange;font-size:11px"> (demo)</span>' : ''}
        <hr style="margin:6px 0">
        <p>🏁 <strong>${vesselData.destination || 'NAPLES'}</strong></p>
        <p>⚡ ${vesselData.speed} kn</p>
        <p>🧭 ${vesselData.heading || vesselData.course || 0}°</p>
        ${vesselData.eta ? `<p>🕐 ETA: ${vesselData.eta}</p>` : ''}
      </div>
    `)
    marker.openPopup()
    shipMarkerRef.current = marker

    // Linea tratteggiata nave → Napoli
    const line = L.polyline([pos, NAPOLI], {
      color: '#1d4ed8',
      weight: 2,
      dashArray: '8 6',
      opacity: 0.6,
    }).addTo(map)
    lineRef.current = line

    // Fly to
    map.flyTo(pos, 6, { duration: 1.5 })
  }, [vesselData])

  useEffect(() => {
    api.get('/agenti/pratiche').then(r => setPratiche(r.data)).catch(() => {})
  }, [])

  async function cerca(mmsiVal) {
    const target = (mmsiVal || mmsi).trim()
    if (!target) return
    setLoading(true)
    try {
      // Se è un numero → cerca per MMSI, altrimenti cerca per nome nave
      const endpoint = /^\d+$/.test(target)
        ? `http://localhost:5001/ais/mt/${target}/location/latest`
        : `http://localhost:5001/legacy/getLastPosition/${target}`
      const resp = await fetch(endpoint)
      const data = await resp.json()
      if (data.error || !data.lat) throw new Error('no data')
      setVesselData({ ...data, mmsi: data.mmsi || target })
    } catch {
      setVesselData({
        mock: true, mmsi: target,
        vessel_name: /^\d+$/.test(target) ? 'NAVE ' + target : target.toUpperCase(),
        lat: 36.5, lon: 14.8,
        speed: 18.4, heading: 315,
        course: 320, destination: 'NAPLES',
        eta: '2026-01-28 06:00',
        status: 'Under way using engine',
        flag: 'DE', ship_type: 'Container Ship',
        length: 294, draught: 12.5,
        distance_to_naples_nm: 180,
      })
    }
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (autoRefresh && mmsi) {
      intervalRef.current = setInterval(() => cerca(mmsi), 30000)
    }
    return () => clearInterval(intervalRef.current)
  }, [autoRefresh, mmsi])

  const sp = vesselData
  const giorni = sp?.eta ? Math.max(0, Math.ceil((new Date(sp.eta) - new Date()) / 86400000)) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🛳️ Tracking Navi</h2>
          <p className="text-xs text-gray-400">Powered by AIS open-source — dati in tempo reale</p>
        </div>
        {lastUpdate && <span className="text-xs text-gray-400">Aggiornato: {lastUpdate.toLocaleTimeString('it-IT')}</span>}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex gap-2">
          <input value={mmsi} onChange={e => setMmsi(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && cerca()}
            placeholder="Nome nave (es. BANGKOK EXPRESS) o MMSI"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={() => cerca()} disabled={loading || !mmsi.trim()}
            className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors">
            {loading ? '...' : 'Cerca'}
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
            Auto 30s
          </label>
        </div>
        {pratiche.filter(p => p.nave).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center">Pratiche:</span>
            {pratiche.filter(p => p.nave).slice(0, 4).map(p => (
              <button key={p.id} onClick={() => cerca('247320500')}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100">
                #{p.id} {p.nave || p.cliente}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-1" style={{ minHeight: 0 }}>
        {/* Mappa */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-gray-200"
          style={{ minHeight: '480px' }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        </div>

        {/* Panel */}
        <div className="w-64 flex flex-col gap-3 flex-shrink-0 overflow-y-auto">
          {sp ? (
            <>
              {sp.mock && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-700">
                  ⚠️ Dati demo — attiva AIS con MMSI reale
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-blue-700">{sp.vessel_name}</h3>
                <p className="text-xs text-gray-400">MMSI: {sp.mmsi}</p>
                <div className="mt-3 space-y-2 text-sm">
                  {[
                    ['Tipo', sp.ship_type || 'Container'],
                    ['Bandiera', sp.flag || '—'],
                    ['Velocità', `${sp.speed} kn`],
                    ['Rotta', `${sp.heading || sp.course || 0}°`],
                    ['Pescaggio', `${sp.draught || '—'} m`],
                    ['Posizione', `${parseFloat(sp.lat).toFixed(2)}°N ${parseFloat(sp.lon).toFixed(2)}°E`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-medium text-xs text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-700 rounded-xl p-4 text-white">
                <p className="text-xs text-blue-200 mb-1">Destinazione</p>
                <p className="font-bold text-lg">{sp.destination || 'NAPLES'}</p>
                {sp.eta && <>
                  <p className="text-xs text-blue-200 mt-2 mb-1">ETA</p>
                  <p className="font-semibold text-sm">{sp.eta}</p>
                </>}
                {giorni !== null && (
                  <div className="mt-3 bg-blue-600 rounded-lg p-2 text-center">
                    <p className="text-2xl font-bold">{giorni}</p>
                    <p className="text-xs text-blue-200">giorni all'arrivo</p>
                  </div>
                )}
                {sp.distance_to_naples_nm && (
                  <p className="text-xs text-blue-300 mt-2">{sp.distance_to_naples_nm} nm da Napoli</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-xs text-gray-400 mb-1">Stato AIS</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${sp.status?.includes('way') ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                  <p className="text-xs font-medium text-gray-700">{sp.status || 'N/D'}</p>
                </div>
              </div>

              {giorni !== null && (
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">📅 Scadenze operative</p>
                  <div className="space-y-2 text-xs">
                    {[
                      ['Richiedi documenti', Math.max(0, giorni - 14), 'text-orange-600'],
                      ['Delivery order', Math.max(0, giorni - 7), 'text-red-600'],
                      ['Prenota trasportatore', Math.max(0, giorni - 3), 'text-purple-600'],
                    ].map(([label, gg, cls]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-500">{label}</span>
                        <span className={`font-medium ${cls}`}>{gg === 0 ? 'OGGI' : `tra ${gg}gg`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400">
              <div className="text-4xl mb-3">🛳️</div>
              <p className="text-sm">Inserisci un MMSI per tracciare la nave</p>
              <p className="text-xs mt-2">Il MMSI si trova sulla polizza di carico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
