"use client";

import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { STATIONS } from "@/lib/stations";

// تنظیم آیکون ایستگاه هواشناسی
const stationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// تابع محاسبه فاصله بین دو نقطه
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function MapWithClickTable({ onDataSelect }) {
  const [mounted, setMounted] = useState(false);
  const [geojsonData, setGeojsonData] = useState(null);

  // پالت رنگی ملایم و حرفه‌ای برای تفکیک اراضی
  const colorPalette = [
    { fill: "#A7F3D0", stroke: "#059669" }, // سبز نعنایی
    { fill: "#BAE6FD", stroke: "#0284C7" }, // آبی روشن
    { fill: "#FEF3C7", stroke: "#D97706" }, // کرم/نارنجی ملایم
    { fill: "#DDD6FE", stroke: "#7C3AED" }, // بنفش پاستلی
    { fill: "#FBCFE8", stroke: "#DB2777" }, // صورتی ملایم
    { fill: "#FDE68A", stroke: "#B45309" }, // خردلی
    { fill: "#C7D2FE", stroke: "#4F46E5" }, // نیلی
    { fill: "#E2E8F0", stroke: "#475569" }  // خاکستری/سنگ
  ];

  // ذخیره نگاشت محصولات به رنگ‌ها برای حفظ ثبات بصری
  const colorMap = useMemo(() => new Map(), []);

  useEffect(() => {
    setMounted(true);
    fetch("/data/PEI_B.geojson")
      .then(res => res.json())
      .then(data => setGeojsonData(data))
      .catch(err => console.error("Error loading GIS data:", err));
  }, []);

  // تابع تعیین استایل رنگی برای هر فیلد GIS
  const getGISStyle = (feature) => {
    const landUse = feature.properties?.LANDUSE || "Unknown";
    
    if (!colorMap.has(landUse)) {
      const colorIndex = colorMap.size % colorPalette.length;
      colorMap.set(landUse, colorPalette[colorIndex]);
    }

    const style = colorMap.get(landUse);

    return {
      fillColor: style.fill,
      color: style.stroke,
      weight: 1.2,
      fillOpacity: 0.5,
    };
  };

  const getNearestWeather = async (lat, lng) => {
    let closestId = "charlottetown";
    let minDistance = Infinity;

    Object.entries(STATIONS).forEach(([id, s]) => {
      const d = getDistance(lat, lng, s.lat, s.lon);
      if (d < minDistance) { minDistance = d; closestId = id; }
    });

    try {
      const res = await fetch(`/api/weather/${closestId}`);
      const data = await res.json();
      return {
        name: data.name,
        dist: minDistance.toFixed(2),
        temp: data.weather?.main?.temp || 0,
        humidity: data.weather?.main?.humidity || 0,
        windSpeed: data.weather?.wind?.speed || 0,
        forecast: data.forecast
      };
    } catch (e) { return null; }
  };

  function MapEvents() {
    useMapEvents({
      click: async (e) => {
        const weather = await getNearestWeather(e.latlng.lat, e.latlng.lng);
        onDataSelect({ weather, field: null });
      }
    });
    return null;
  }

  // جلوگیری از خطای appendChild با رندر نکردن در سمت سرور
  if (!mounted) return (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
      PREPARING MAP...
    </div>
  );

  return (
    <MapContainer 
      center={[46.42, -63.68]} 
      zoom={10} 
      className="h-full w-full"
    >
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        attribution='&copy; OpenStreetMap'
      />
      
      <MapEvents />

      {/* نمایش ایستگاه‌ها روی نقشه */}
      {Object.entries(STATIONS).map(([id, pos]) => (
        <Marker 
          key={id} 
          position={[pos.lat, pos.lon]} 
          icon={stationIcon}
          eventHandlers={{ 
            click: async () => {
              const weather = await getNearestWeather(pos.lat, pos.lon);
              onDataSelect({ weather, field: null });
            }
          }}
        />
      ))}

      {/* نمایش لایه‌های GIS رنگی */}
      {geojsonData && (
        <GeoJSON 
          data={geojsonData} 
          style={getGISStyle}
          onEachFeature={(feature, layer) => {
            layer.on("click", async (e) => {
              L.DomEvent.stopPropagation(e);
              const weather = await getNearestWeather(e.latlng.lat, e.latlng.lng);
              onDataSelect({
                field: { 
                  id: feature.properties.FIELDID, 
                  use: feature.properties.LANDUSE || "N/A", 
                  area: Number(feature.properties.HECTARES || 0).toFixed(2) 
                },
                weather
              });
            });
            // افکت هایلایت هنگام نگه داشتن موس
            layer.on({
              mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.7, weight: 2 }); },
              mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.5, weight: 1.2 }); }
            });
          }}
        />
      )}
    </MapContainer>
  );
}