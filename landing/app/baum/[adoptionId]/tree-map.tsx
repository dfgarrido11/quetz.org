"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface TreeMapProps {
  latitude: number | null;
  longitude: number | null;
  treeName: string;
  plotArea?: string | null;
  noGpsLabel?: string;
}

// Zacapa region center as fallback
const ZACAPA_LAT = 14.97;
const ZACAPA_LNG = -89.87;

export function TreeMap({ latitude, longitude, treeName, plotArea, noGpsLabel }: TreeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const hasGps = latitude != null && longitude != null;
  const lat = hasGps ? latitude! : ZACAPA_LAT;
  const lng = hasGps ? longitude! : ZACAPA_LNG;

  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [lng, lat],
      zoom: hasGps ? 14 : 10,
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      // Custom marker element
      const el = document.createElement("div");
      el.style.cssText = `
        width: 48px;
        height: 48px;
        border-radius: 50% 50% 50% 0;
        background: #2D6A4F;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const inner = document.createElement("div");
      inner.style.cssText = `
        transform: rotate(45deg);
        font-size: 20px;
        margin-top: 2px;
      `;
      inner.textContent = "🌳";
      el.appendChild(inner);

      const popup = new mapboxgl.Popup({ offset: 32, closeButton: false })
        .setHTML(`
          <div style="font-family: sans-serif; padding: 4px 0;">
            <strong style="color:#081C15; font-size:13px;">${treeName}</strong>
            ${plotArea ? `<br><span style="color:#6B7280; font-size:11px;">${plotArea}</span>` : ""}
            ${hasGps ? `<br><span style="color:#2D6A4F; font-size:10px; font-family:monospace;">${lat.toFixed(4)}°N ${Math.abs(lng).toFixed(4)}°W</span>` : ""}
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markerRef.current = marker;

      // Auto-open popup
      marker.togglePopup();
    });

    return () => {
      markerRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, treeName, plotArea, hasGps]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "400px", borderRadius: "16px", overflow: "hidden" }} />

      {/* No-GPS overlay */}
      {!hasGps && (
        <div style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          right: "16px",
          background: "rgba(8,28,21,0.85)",
          color: "#B7E4C7",
          fontSize: "13px",
          padding: "12px 16px",
          borderRadius: "8px",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(82,183,136,0.3)",
        }}>
          🔍 {noGpsLabel ?? "GPS-Daten in Vorbereitung — nächstes Update folgt"}
        </div>
      )}
    </div>
  );
}
