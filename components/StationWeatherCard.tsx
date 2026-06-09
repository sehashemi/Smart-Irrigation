"use client";
import { useEffect, useState } from "react";

interface StationWeatherCardProps {
  api: string;
  name: string;
}

export default function StationWeatherCard({ api, name }: StationWeatherCardProps) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(api)
      .then((res) => {
        if (!res.ok) throw new Error("Station not found");
        return res.json();
      })
      .then((json) => {
        // IMPORTANT: Accessing json.weather because of our new dynamic API structure
        const d = json.weather; 
        
        if (d && d.main && d.wind && d.weather?.[0]) {
          setData({
            temperature: d.main.temp,
            humidity: d.main.humidity,
            wind: d.wind.speed,
            description: d.weather[0].description,
            icon: d.weather[0].icon
          });
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(true);
      });
  }, [api]);

  if (error) return (
    <div className="border p-4 rounded-2xl bg-red-50 text-red-500 text-xs">
      {name}: Offline or Not Found
    </div>
  );

  if (!data) return (
    <div className="border p-4 rounded-2xl bg-gray-50 animate-pulse text-gray-400 text-sm italic">
      Loading {name}...
    </div>
  );

  return (
    <div className="border border-gray-100 p-5 rounded-2xl shadow-sm bg-gradient-to-br from-white to-green-50/30 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-800">{name}</h3>
        {data.icon && (
          <img 
            src={`https://openweathermap.org/img/wn/${data.icon}.png`} 
            alt="weather icon" 
            className="w-10 h-10 bg-blue-100/50 rounded-full"
          />
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Temp</span>
          <span className="text-lg font-bold text-green-700">{Math.round(data.temperature)}°C</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Humidity</span>
          <span className="text-gray-700 font-medium">{data.humidity}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Wind</span>
          <span className="text-gray-700 font-medium">{data.wind} m/s</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Condition</span>
          <span className="text-gray-600 font-medium capitalize truncate">{data.description}</span>
        </div>
      </div>
    </div>
  );
}