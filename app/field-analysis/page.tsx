"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { 
  Map as MapIcon, Thermometer, Droplets, Wind, 
  CalendarDays, Navigation, Activity
} from "lucide-react";

// حل قطعی خطای appendChild با تنظیم ssr: false
const MapWithClickTable = dynamic(
  () => import("../../components/MapWithClickTable").then((mod) => mod.default),
  { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-slate-200 animate-pulse rounded-[40px] flex items-center justify-center text-slate-400 font-black">LOADING MAP...</div>
  }
);

export default function FieldAnalysisPage() {
  const [analysisData, setAnalysisData] = useState<any>({ field: null, weather: null });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // این خط باعث می‌شود نقشه فقط در مرورگر لود شود
    const loadDefault = async () => {
      try {
        const res = await fetch(`/api/weather/charlottetown`);
        const data = await res.json();
        if (data?.weather?.main) {
          setAnalysisData(prev => ({
            ...prev,
            weather: {
              name: data.name,
              dist: "8.96",
              temp: data.weather.main.temp,
              humidity: data.weather.main.humidity,
              windSpeed: data.weather.wind?.speed || 0,
              forecast: data.forecast
            }
          }));
        }
      } catch (e) { console.error(e); }
    };
    loadDefault();
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-4 pt-4">
      <main className="max-w-[1650px] w-full mx-auto px-6 lg:px-10">
        
        <div className="flex flex-col lg:flex-row gap-5 mb-5 relative">
          
          {/* ستون نقشه - حالا با پشتیبانی از GIS رنگی */}
          <div className="lg:w-3/4 h-[600px] bg-white rounded-[45px] shadow-2xl overflow-hidden border-4 border-white relative z-0">
             <MapWithClickTable onDataSelect={(data) => setAnalysisData(prev => ({ ...prev, ...data }))} />
          </div>

          {/* پنل اطلاعات فشرده - تمام فواصل عمودی کاهش یافته است */}
          <div className="lg:w-1/4 h-[600px] relative z-10">
            <div className="bg-slate-900 rounded-[40px] p-4 h-full flex flex-col border border-slate-700 shadow-2xl overflow-hidden">
              
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-emerald-400 font-black text-[9px] tracking-widest block uppercase">Station</span>
                  <h2 className="text-white text-xl font-black uppercase truncate leading-tight">
                    {analysisData.weather?.name || "Selecting..."}
                  </h2>
                </div>
                <Activity size={18} className="text-emerald-400 animate-pulse" />
              </div>

              {/* گرید داده‌های فعلی - بسیار فشرده */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { label: "TEMP", val: `${analysisData.weather?.temp || "-12.8"}°C`, icon: <Thermometer size={14}/>, bg: "bg-orange-500/10", text: "text-orange-400" },
                  { label: "WIND", val: `${analysisData.weather?.windSpeed || "4.6"}m/s`, icon: <Wind size={14}/>, bg: "bg-blue-500/10", text: "text-blue-400" },
                  { label: "HUMID", val: `${analysisData.weather?.humidity || "75"}%`, icon: <Droplets size={14}/>, bg: "bg-cyan-500/10", text: "text-cyan-400" },
                  { label: "DIST", val: `${analysisData.weather?.dist || "8.9"}km`, icon: <Navigation size={14}/>, bg: "bg-indigo-500/10", text: "text-indigo-400" }
                ].map((item, i) => (
                  <div key={i} className={`${item.bg} border border-white/5 rounded-2xl py-2 flex flex-col items-center justify-center`}>
                    <span className={`${item.text} mb-1`}>{item.icon}</span>
                    <span className="text-white text-lg font-black leading-none">{item.val}</span>
                    <span className="text-[8px] text-white/30 font-bold mt-1 uppercase">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* پیش‌بینی ۵ روزه - چیدمان عمودی نزدیک به هم */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-indigo-400 font-black text-[9px] tracking-widest uppercase flex items-center gap-1">
                    <CalendarDays size={12}/> 5-DAY OUTLOOK
                  </span>
                  <div className="h-[1px] bg-white/10 flex-1"></div>
                </div>
                
                <div className="flex flex-col gap-1.5 h-full justify-between pb-1">
                  {analysisData.weather?.forecast?.slice(0, 5).map((day: any, idx: number) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-2 px-3 border border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-black text-white uppercase w-8">
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div className="flex items-center gap-2 flex-1 justify-center">
                        <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} className="w-8 h-8" alt="w" />
                        <div className="flex gap-1.5 font-black text-white text-sm">
                          <span>{Math.round(day.main.temp_max)}°</span>
                          <span className="text-white/20">{Math.round(day.main.temp_min)}°</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-black text-xs w-8 text-right">
                        {Math.round((day.pop || 0) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* پنل GIS پایین */}
        <div className="bg-white rounded-[35px] p-5 shadow-xl border border-slate-200 lg:w-1/3 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600"><MapIcon size={22}/></div>
               <div>
                  <h4 className="text-slate-400 font-black uppercase text-[9px] mb-0.5 tracking-tight">GIS INFORMATION</h4>
                  <div className="text-slate-900 font-black text-lg italic uppercase">
                    {analysisData.field?.use || "SELECT FIELD"}
                  </div>
               </div>
            </div>
            <div className="text-right border-l pl-5 border-slate-100">
               <span className="text-slate-400 text-[9px] uppercase block font-black">AREA</span>
               <span className="text-slate-900 text-2xl font-black">{analysisData.field?.area || "0"} <small className="text-xs text-slate-400">ha</small></span>
            </div>
        </div>
      </main>
    </div>
  );
}