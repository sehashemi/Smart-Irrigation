"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, Leaf } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Analysis", href: "/field-analysis", icon: <LayoutDashboard size={18} /> },
    { name: "History Logs", href: "/history", icon: <History size={18} /> },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-xl">
            <Leaf className="text-white" size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">
            Smart<span className="text-green-600">Agri</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                pathname === item.href
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}