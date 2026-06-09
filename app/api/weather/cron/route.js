import { NextResponse } from 'next/server';
import { STATIONS } from '@/lib/stations';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`; 

    const dirPath = path.join(process.cwd(), 'data', 'history');
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const results = {};

    for (const [id, loc] of Object.entries(STATIONS)) {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&units=metric&appid=${apiKey}`
      );
      const data = await res.json();

      const filePath = path.join(dirPath, `${id}.json`);
      let history = {};
      if (fs.existsSync(filePath)) {
        history = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }

      if (!history[today]) {
        history[today] = { logs: [] };
      }

      // ذخیره تمامی پارامترهای درخواستی
      history[today].logs.push({
        time: timeLabel,
        temp: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        description: data.weather[0].description
      });

      // محاسبه میانگین‌های روزانه برای نمایش سریع در جدول
      const logs = history[today].logs;
      const count = logs.length;
      
      history[today].avgTemp = (logs.reduce((s, l) => s + l.temp, 0) / count).toFixed(1);
      history[today].avgWind = (logs.reduce((s, l) => s + (l.windSpeed || 0), 0) / count).toFixed(1);
      history[today].avgHumidity = (logs.reduce((s, l) => s + l.humidity, 0) / count).toFixed(0);
      history[today].avgPressure = (logs.reduce((s, l) => s + l.pressure, 0) / count).toFixed(0);

      fs.writeFileSync(filePath, JSON.stringify(history, null, 2));
      results[id] = { time: timeLabel, status: "Logged" };
    }

    return NextResponse.json({ message: "Full dataset updated", results });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}