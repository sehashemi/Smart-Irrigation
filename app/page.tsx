"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full">
      {/* ----- HERO SECTION ----- */}
      <section className="relative h-[750px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image - Ensure 'hero-bg.jpg' is in your public folder */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/hero-bg.jpg')", 
            filter: "brightness(0.5)" 
          }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h2 className="text-7xl md:text-9xl font-black text-white uppercase tracking-tighter mb-6">
            PEI SMART IRRIGATION  <br/> 
          </h2>
          <div className="flex items-center justify-center gap-6 mb-10">
            <span className="h-[2px] w-16 bg-green-500"></span>
            <p className="text-xl md:text-2xl font-medium text-gray-200 tracking-[0.4em] uppercase">
              Smart Monitoring Dashboard
            </p>
            <span className="h-[2px] w-16 bg-green-500"></span>
          </div>
          
          <Link href="/field-analysis">
            <button className="px-12 py-5 bg-green-600 text-white font-black rounded-full hover:bg-green-700 transition-all shadow-2xl hover:scale-105 active:scale-95 uppercase tracking-widest text-sm">
              Explore Field Data
            </button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}