export default function WeatherCard({ weather }) {
  if (!weather) {
    return (
      <div className="p-4 border rounded-xl shadow bg-white text-center">
        Loading weather data...
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div className="p-4 border rounded-xl shadow bg-white">
      <h2 className="text-xl font-semibold mb-3">Weather (Charlottetown)</h2>

      <div className="flex items-center gap-4">
        <img src={iconUrl} alt="weather icon" className="w-16 h-16" />

        <div>
          <p className="text-4xl font-bold">{weather.temperature}°C</p>
          <p className="text-gray-600 capitalize">{weather.description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="p-2 border rounded-lg text-center">
          <p className="font-semibold">Humidity</p>
          <p>{weather.humidity}%</p>
        </div>

        <div className="p-2 border rounded-lg text-center">
          <p className="font-semibold">Wind</p>
          <p>{weather.wind} m/s</p>
        </div>
      </div>
    </div>
  );
}
