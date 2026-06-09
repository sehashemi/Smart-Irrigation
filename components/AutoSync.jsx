"use client";
import { useEffect } from "react";

export default function AutoSync() {
  useEffect(() => {
    const sync = () => {
      fetch('/api/weather/cron')
        .then(res => res.json())
        .catch(err => console.error("Sync Error:", err));
    };
    
    sync(); // اجرای اول
    const interval = setInterval(sync, 60000); // تکرار هر یک دقیقه
    return () => clearInterval(interval);
  }, []);

  return null;
}