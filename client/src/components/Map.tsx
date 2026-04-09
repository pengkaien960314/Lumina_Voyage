/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { GOOGLE_MAPS_API_KEY } from "@/config";

declare global {
  interface Window {
    google?: typeof google;
    __gmapsLoading?: Promise<void>;
  }
}

function loadMapScript(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (window.__gmapsLoading) return window.__gmapsLoading;

  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY.includes("YOUR_")) {
    return Promise.reject(new Error("請先在 config.ts 設定 Google Maps API Key"));
  }

  window.__gmapsLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry,routes`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      window.__gmapsLoading = undefined;
      reject(new Error("Google Maps 載入失敗。請確認：\n1. API Key 正確\n2. 已啟用 Maps JavaScript API\n3. 已設定帳單資料"));
    };
    document.head.appendChild(script);
  });
  return window.__gmapsLoading;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 25.033, lng: 121.5654 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const init = usePersistFn(async () => {
    try {
      await loadMapScript();
      if (!mapContainer.current || map.current) return;
      map.current = new window.google!.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: true,
      });
      setLoading(false);
      onMapReady?.(map.current);
    } catch (err: any) {
      setError(err.message || "地圖載入失敗");
      setLoading(false);
    }
  });

  useEffect(() => { init(); }, [init]);

  if (error) {
    return (
      <div className={cn("w-full h-[500px] rounded-xl bg-destructive/5 border border-destructive/20 flex items-center justify-center p-6", className)}>
        <div className="text-center max-w-md">
          <p className="text-sm font-medium text-destructive mb-2">⚠️ 地圖載入失敗</p>
          <p className="text-xs text-muted-foreground whitespace-pre-line">{error}</p>
          <p className="text-xs text-muted-foreground mt-3">
            到 <a href="https://console.cloud.google.com/apis/library" target="_blank" rel="noopener" className="text-primary underline">Google Cloud Console</a> 啟用以下 API：
          </p>
          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <li>• Maps JavaScript API</li>
            <li>• Directions API</li>
            <li>• Geocoding API</li>
            <li>• Places API</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px] rounded-xl bg-secondary/30 flex items-center justify-center", className)}>
      {loading && <p className="text-sm text-muted-foreground animate-pulse">載入地圖中...</p>}
    </div>
  );
}
