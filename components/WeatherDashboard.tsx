"use client";

import StationWeatherCard from "./StationWeatherCard";

export default function WeatherDashboard() {
  // Station Array - names must match the IDs in your api/weather/[stationId]
  const stations = [
    { id: 1, name: "Charlottetown", api: "/api/weather/charlottetown" },
    { id: 2, name: "Summerside", api: "/api/weather/summerside" },
	{ id: 3, name: "Stratford", api: "/api/weather/stratford" },
    { id: 4, name: "Montague", api: "/api/weather/montague" }, // Make sure 'montague' exists in your STATIONS object
  ];

  return (
    <div className="border p-6 rounded-3xl shadow-xl bg-white border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-green-800 tracking-tight">
        Local Weather Stations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stations.map((station) => (
          <StationWeatherCard
            key={station.id}
            name={station.name}
            api={station.api}
          />
        ))}
      </div>
    </div>
  );
}