"use client";

import { useState, useEffect } from "react";

interface Forecast {
  date: string;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
}

export default function WeatherForecast() {
  const [forecastData, setForecastData] = useState<Forecast[]>([]);

  useEffect(() => {
    fetch("/api/weather-forecast") // مسیر API پیش‌بینی شما
      .then((res) => res.json())
      .then((data) => {
        // فرض کنید داده‌ها یک آرایه ۵ روزه هستند
        setForecastData(data);
      })
      .catch((err) => console.error("Forecast fetch error:", err));
  }, []);

  if (!forecastData.length) return <p>Loading forecast...</p>;

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white">
      <h2 className="text-xl font-semibold mb-2">5-Day Forecast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {forecastData.map((day, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center p-2 border rounded bg-green-50"
          >
            <p className="font-semibold">{day.date}</p>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              className="w-12 h-12"
            />
            <p>{day.description}</p>
            <p>
              {day.temp_min}°C - {day.temp_max}°C
            </p>
            <p>Humidity: {day.humidity}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
