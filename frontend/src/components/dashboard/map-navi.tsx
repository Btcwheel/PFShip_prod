"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { NAVI_AIS } from "@/lib/mock-data";
import { useTheme } from "next-themes";

// Custom ship icon
const shipIcon = L.divIcon({
  className: "",
  html: `<div style="background:oklch(0.58 0.18 235);width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px oklch(0.58 0.18 235),0 4px 12px oklch(0.58 0.18 235 / .4);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const naplesIcon = L.divIcon({
  className: "",
  html: `<div style="background:oklch(0.72 0.15 75);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 2px oklch(0.72 0.15 75),0 4px 12px oklch(0.72 0.15 75 / .4);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const NAPLES: [number, number] = [40.83, 14.25];

export default function MapNavi() {
  const { theme } = useTheme();
  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className="h-[360px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={[30, 35]}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} />
        <Marker position={NAPLES} icon={naplesIcon}>
          <Popup>
            <strong>Napoli — Porto destinazione</strong>
          </Popup>
        </Marker>
        {NAVI_AIS.map((n) => (
          <div key={n.mmsi}>
            <Marker position={[n.lat, n.lng]} icon={shipIcon}>
              <Popup>
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-sm">{n.nome}</div>
                  <div className="text-muted-foreground">{n.compagnia} · MMSI {n.mmsi}</div>
                  <div className="pt-1 border-t border-border/40 mt-1">
                    <div>Pratica: <strong>{n.praticaNumero}</strong></div>
                    <div>Cliente: {n.cliente}</div>
                    <div>Velocità: {n.speedKn} kn</div>
                    <div className="text-primary font-medium">ETA: {n.eta}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
            <Polyline
              positions={[[n.lat, n.lng], NAPLES]}
              pathOptions={{
                color: "oklch(0.58 0.18 235)",
                weight: 2,
                opacity: 0.5,
                dashArray: "6 6",
              }}
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
