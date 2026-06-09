"use client";

import '../styles/globals.css';
import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Search, Activity, LayoutGrid, ChevronRight, XCircle } from "lucide-react";
import AutoSync from "../components/AutoSync"; 
import { STATIONS } from "../lib/stations";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allNavItems = useMemo(() => [
    { id: 'home', name: 'Home Dashboard', type: 'Page', link: '/', icon: <LayoutGrid size={14} className="text-gray-500" /> },
    { id: 'history-main', name: 'Weather Dashboard', type: 'Report', link: '/history', icon: <Activity size={14} className="text-blue-500" /> },
    { id: 'analysis', name: 'Field Analysis', type: 'Analytics', link: '/field-analysis', icon: <LayoutGrid size={14} className="text-emerald-600" /> },
    { id: 'weather', name: 'Weather Forecast', type: 'Page', link: '/weather', icon: <Activity size={14} className="text-orange-500" /> },
    ...Object.entries(STATIONS).map(([id, s]: [string, any]) => ({
      id, name: s.name, type: 'Station', link: `/history?station=${id}`, icon: <Activity size={14} className="text-blue-600" />
    }))
  ], []);

  const filteredResults = allNavItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `transition-all duration-300 border-b-2 py-1 pb-2 ${
      isActive ? "text-blue-600 border-blue-600" : "text-gray-600 border-transparent hover:text-green-700 hover:border-green-200"
    }`;
  };

  return (
    <html lang="en">
      <body 
        className="bg-white font-sans min-h-screen flex flex-col" 
        suppressHydrationWarning={true}
      >
        <AutoSync />
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 py-4 shadow-md">
          <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between gap-10">
            <Link href="/" className="flex items-center gap-5 group flex-shrink-0">
              <Image src="/logo3.png" alt="Logo" width={150} height={150} className="object-contain" />
              <div className="flex flex-col">
                <h1 className="text-3xl font-black text-green-700 leading-none uppercase tracking-tighter">PEI Smart IRRIGATION</h1>
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] uppercase mt-1">Precision Agritech Solutions</p>
              </div>
            </Link>

            <nav className="hidden xl:flex flex-1 items-center justify-center gap-8 text-[12px] font-black uppercase tracking-widest px-4">
              <Link href="/" className={getLinkStyle("/")}>Home</Link>
              <Link href="/field-analysis" className={getLinkStyle("/field-analysis")}>Field Analysis</Link>
              <Link href="/history" className={getLinkStyle("/history")}>Weather Dashboard</Link>
              <Link href="/variety-trials" className={getLinkStyle("/variety-trials")}>Variety Trials</Link>
              <Link href="/weather" className={getLinkStyle("/weather")}>Weather</Link>
              <Link href="/about" className={getLinkStyle("/about")}>About Us</Link>
            </nav>

            <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[280px] relative" ref={searchRef}>
              <button className="flex items-center justify-center gap-3 w-full px-6 py-2.5 bg-green-700 text-white rounded-full text-sm font-black hover:bg-green-800 shadow-md transition-all active:scale-95 uppercase">
                <User className="w-5 h-5" /> LOGIN
              </button>
              <div className="relative w-full group">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setIsSearchOpen(true); }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Type to search stations..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-[11px] font-bold outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all text-gray-700"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                {searchQuery && <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 hover:text-red-500 cursor-pointer" onClick={() => setSearchQuery("")} />}

                {isSearchOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-full bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-[100]">
                    <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{searchQuery ? `Results for "${searchQuery}"` : "Quick Navigation"}</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {filteredResults.length > 0 ? filteredResults.map((item) => (
                        <Link key={item.id} href={item.link} onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }} className="flex items-center justify-between p-3 hover:bg-blue-50 transition-all border-b border-gray-50 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg border border-gray-100">{item.icon}</div>
                            <div>
                              <p className="text-[11px] font-bold text-gray-800">{item.name}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase">{item.type}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-gray-300" />
                        </Link>
                      )) : <div className="p-8 text-center text-[11px] font-bold text-gray-400">No data found</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-50 border-t border-gray-100 py-8 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">© 2026 PEI Smart Irrigation Systems</p>
        </footer>
      </body>
    </html>
  );
}