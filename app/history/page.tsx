"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, AreaChart, Area, LineChart, Line 
} from "recharts";
import { LayoutGrid, Download, Calendar } from "lucide-react";
import { STATIONS } from "../../lib/stations";

export default function HistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const stationIds = Object.keys(STATIONS);
  const [selectedStation, setSelectedStation] = useState(stationIds[0]);
  
  const getLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const todayStr = getLocalDate();

  const createEmptyTimeline = () => {
    const timeline = [];
    for (let i = 0; i < 1440; i++) {
      const h = Math.floor(i / 60).toString().padStart(2, '0');
      const m = (i % 60).toString().padStart(2, '0');
      timeline.push({
        fullTime: `${h}:${m}`,
        current_temp: null, 
        windSpeed: null,
        display_humidity: null,
        rain: null,
        dummy: 0 
      });
    }
    return timeline;
  };

  const fetchLatestData = useCallback(async () => {
    try {
      const res = await fetch(`/api/weather/history?station=${selectedStation}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const history = await res.json();
      let finalChartData = createEmptyTimeline();

      if (history[selectedDate] && history[selectedDate].logs) {
        const dbLogs = history[selectedDate].logs;
        
        dbLogs.forEach((log: any) => {
          const parts = log.time.split(':');
          const formattedLogTime = parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
          const index = finalChartData.findIndex(slot => slot.fullTime === formattedLogTime);
          if (index !== -1) {
            finalChartData[index] = {
              ...finalChartData[index],
              current_temp: Number(log.temp),
              windSpeed: Number(log.windSpeed),
              display_humidity: Number(log.humidity),
              rain: Number(log.rain)
            };
          }
        });

        // اصلاح شده: استفاده صحیح از lastValidIndex برای اتصال ۳۰ دقیقه‌ای
        let lastValidIndex = -1;
        for (let i = 0; i < finalChartData.length; i++) {
          if (finalChartData[i].current_temp !== null) {
            if (lastValidIndex !== -1 && (i - lastValidIndex) <= 30) {
              for (let j = lastValidIndex + 1; j < i; j++) {
                finalChartData[j].current_temp = finalChartData[lastValidIndex].current_temp;
                finalChartData[j].windSpeed = finalChartData[lastValidIndex].windSpeed;
                finalChartData[j].display_humidity = finalChartData[lastValidIndex].display_humidity;
                finalChartData[j].rain = finalChartData[lastValidIndex].rain;
              }
            }
            lastValidIndex = i;
          }
        }
      }
      setData(finalChartData);
    } catch (e) {
      console.error("Fetch error:", e);
      setData(createEmptyTimeline());
    }
  }, [selectedStation, selectedDate]);

  useEffect(() => {
    const currentDay = getLocalDate();
    if (selectedDate !== currentDay && selectedDate === todayStr) {
        setSelectedDate(currentDay);
    }
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 60000); 
    return () => clearInterval(interval);
  }, [selectedStation, selectedDate, fetchLatestData, todayStr]);

  const calculateAvg = (key: string) => {
    // اصلاح فیلتر برای جلوگیری از خطای NaN در آیدی یوزر
    const valid = data.filter(d => d[key] !== null && !isNaN(Number(d[key])));
    if (valid.length === 0) return "0.0";
    const sum = valid.reduce((a, b) => a + Number(b[key]), 0);
    return (sum / valid.length).toFixed(1);
  };

  const downloadCSV = () => {
    const realData = data.filter(d => d.current_temp !== null);
    if (realData.length === 0) return alert("دیتایی برای دانلود وجود ندارد!");
    const headers = "Date,Time,Temp(C),Wind(m/s),Hum(%),Rain(mm)\n";
    const content = realData.map(d => 
      `${selectedDate},${d.fullTime},${d.current_temp},${d.windSpeed},${d.display_humidity},${d.rain}`
    ).join("\n");

    const blob = new Blob([headers + content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weather_${selectedStation}_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const commonXAxis = (
    <XAxis 
      dataKey="fullTime" 
      ticks={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]}
      tick={{fill:'#000', fontSize:11, fontWeight:'900'}} 
      dy={10} axisLine={{stroke:'#000', strokeWidth:2}} interval={0}
    />
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-2 lg:p-4 font-sans text-right" dir="ltr">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-gradient-to-r from-blue-700 to-blue-800 p-6 rounded-3xl shadow-xl border-b-4 border-blue-900 gap-4">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white border border-white/20">
              <LayoutGrid size={32} />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {selectedDate === todayStr ? "CURRENT WEATHER DATA" : "HISTORICAL WEATHER DATA"}
                </h2>
                {selectedDate === todayStr && (
                  <span className="bg-green-500 text-[10px] font-black px-2 py-0.5 rounded-full text-white animate-pulse">● LIVE</span>
                )}
              </div>
              <span className="text-blue-100 text-lg">Station: <b>{(STATIONS as any)[selectedStation]?.name}</b></span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3">
             <div className="flex items-center bg-blue-900/50 rounded-2xl px-4 py-2 border border-white/10">
                <Calendar size={18} className="text-blue-300 mr-2" />
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer" max={todayStr} />
             </div>
             <button onClick={downloadCSV} className="bg-white text-blue-700 px-6 py-2.5 rounded-2xl text-sm font-black uppercase shadow-lg flex items-center gap-2">
               <Download size={18} /> Export CSV
             </button>
             <select className="bg-blue-900 text-white px-5 py-2.5 rounded-2xl font-black text-sm outline-none border border-blue-500 shadow-lg" value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)}>
              {Object.entries(STATIONS).map(([id, station]: any) => (<option key={id} value={id}>{station.name}</option>))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartBox title="Temperature" color="#f97316" avg={calculateAvg('current_temp')} unit="°C">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E2E8F0" />
                  {commonXAxis}
                  <YAxis domain={[-35, 45]} ticks={[-30, -15, 0, 15, 30, 45]} tick={{ fill: '#000', fontSize: 14, fontWeight: '900' }} axisLine={{ stroke: '#000', strokeWidth: 2 }} />
                  <Tooltip />
                  <ReferenceLine y={0} stroke="#000" strokeWidth={3} />
                  <Line dataKey="dummy" stroke="transparent" dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="current_temp" stroke="#f97316" strokeWidth={4} dot={{ r: 1, fill: '#f97316', strokeWidth: 0 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Rainfall" color="#0ea5e9" avg={calculateAvg('rain')} unit=" mm">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E2E8F0" />
                  {commonXAxis}
                  <YAxis domain={[0, 50]} ticks={[0, 10, 20, 30, 40, 50]} tick={{ fill: '#0ea5e9', fontSize: 14, fontWeight: '900' }} axisLine={{ stroke: '#0ea5e9', strokeWidth: 2 }} />
                  <Tooltip />
                  <Area dataKey="dummy" stroke="transparent" fill="transparent" />
                  <Area type="monotone" dataKey="rain" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={4} dot={{ r: 1, fill: '#0ea5e9', strokeWidth: 0 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Wind Speed" color="#3b82f6" avg={calculateAvg('windSpeed')} unit=" m/s">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E2E8F0" />
                  {commonXAxis}
                  <YAxis domain={[0, 35]} ticks={[0, 7, 14, 21, 28, 35]} tick={{ fill: '#3b82f6', fontSize: 14, fontWeight: '900' }} axisLine={{ stroke: '#3b82f6', strokeWidth: 2 }} />
                  <Tooltip />
                  <Area dataKey="dummy" stroke="transparent" fill="transparent" />
                  <Area type="monotone" dataKey="windSpeed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={4} dot={{ r: 1, fill: '#3b82f6', strokeWidth: 0 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Humidity" color="#10b981" avg={calculateAvg('display_humidity')} unit=" %">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E2E8F0" />
                  {commonXAxis}
                  <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fill: '#10b981', fontSize: 14, fontWeight: '900' }} axisLine={{ stroke: '#10b981', strokeWidth: 2 }} />
                  <Tooltip />
                  <Area dataKey="dummy" stroke="transparent" fill="transparent" />
                  <Area type="monotone" dataKey="display_humidity" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={4} dot={{ r: 1, fill: '#10b981', strokeWidth: 0 }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>
        </div>
      </div>
    </div>
  );
}

function ChartBox({ title, color, avg, unit, children }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-800 uppercase text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{title}</h3>
        <div className="bg-white px-4 py-1.5 rounded-full text-sm font-black border border-slate-100 shadow-sm" style={{color}}>Avg: {avg}{unit}</div>
      </div>
      <div className="w-full bg-slate-50/30 rounded-2xl p-2 border border-slate-50">{children}</div>
    </div>
  );
}