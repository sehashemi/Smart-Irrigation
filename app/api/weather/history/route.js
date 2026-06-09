import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const getFilePath = (station) => {
  return path.join(process.cwd(), 'data', 'history', `${station}.json`);
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const station = searchParams.get('station') || 'charlottetown';
  const filePath = getFilePath(station);

  try {
    if (!fs.existsSync(filePath)) return NextResponse.json({});
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data), {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    return NextResponse.json({ error: "Read Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { station, temp, humidity, windSpeed, rain } = body;

    const filePath = getFilePath(station);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    let history = {};
    if (fs.existsSync(filePath)) {
      history = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    const now = new Date();
    
    const today = new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(now);
    
    // اصلاح اصلی: ساخت زمان دو رقمی ثابت (مثلاً 08:05 به جای 8:5)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    if (!history[today]) {
      history[today] = { logs: [] };
    }

    history[today].logs.push({
      time: time,
      temp: Number(temp),
      humidity: Number(humidity),
      windSpeed: Number(windSpeed),
      rain: Number(rain || 0)
    });

    history[today].logs.sort((a, b) => a.time.localeCompare(b.time));

    fs.writeFileSync(filePath, JSON.stringify(history, null, 2));

    return NextResponse.json({ success: true, date: today, time: time });
  } catch (error) {
    return NextResponse.json({ error: "Write Error" }, { status: 500 });
  }
}