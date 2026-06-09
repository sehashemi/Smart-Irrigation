import { NextResponse } from 'next/server';
import { STATIONS } from '@/lib/stations';

export async function GET(request, { params }) {
  try {
    const { stationId } = await params;
    const id = stationId.toLowerCase();
    const location = STATIONS[id];

    if (!location) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl)
    ]);

    const weather = await currentRes.json();
    const forecastData = await forecastRes.json();

    const forecast = forecastData.list 
      ? forecastData.list.filter(item => item.dt_txt.includes("12:00:00")) 
      : [];

    return NextResponse.json({
      name: location.name,
      weather: weather, // اطمینان از وجود آبجکت weather
      forecast: forecast
    });
  } catch (error) {
    return NextResponse.json({ error: "API Error" }, { status: 500 });
  }
}