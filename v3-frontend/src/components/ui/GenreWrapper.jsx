"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Terminal, Lightbulb, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function GenreWrapper({ category, children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cat = (category || "").toLowerCase();

  // Cybersecurity / Defense / Zero-Day
  if (cat.includes("cyber") || cat.includes("security") || cat.includes("zero-day")) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#33ff00] font-mono relative overflow-hidden">
        {mounted && (
          <div className="fixed inset-0 pointer-events-none opacity-5 flex justify-around">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="animate-rain text-xs whitespace-pre" style={{ animationDelay: `${Math.random() * 5}s`, animationDuration: `${5 + Math.random() * 5}s` }}>
                {Array.from({ length: 50 }).map(() => String.fromCharCode(33 + Math.random() * 93)).join('\n')}
              </div>
            ))}
          </div>
        )}
        <div className="fixed top-0 w-full h-1 bg-[#33ff00]/20 animate-pulse pointer-events-none z-50">
          <div className="h-full bg-[#33ff00] w-1/3 animate-scan"></div>
        </div>
        <div className="relative z-10 glass-panel border-[#33ff00]/20">
          {/* Threat Ticker */}
          <div className="bg-black border-b border-[#33ff00]/10 p-2 text-[10px] uppercase tracking-widest flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <Terminal className="w-3 h-3 text-red-500 animate-pulse flex-shrink-0" />
            <motion.div 
               animate={{ x: [1000, -1000] }}
               transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
               className="inline-block"
            >
               ALERT: CVE-2026-10443 DETECTED IN WILD • APT-41 ACTIVITY SPIKE IN APAC • ZERO-DAY EXPLOIT PAYLOAD MITIGATED
            </motion.div>
          </div>
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             className="cyber-content"
          >
             {children}
          </motion.div>
        </div>
        <style jsx global>{`
          .animate-rain { animation: rain linear infinite; }
          @keyframes rain { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }
          .animate-scan { animation: scan 3s ease-in-out infinite alternate; }
          @keyframes scan { 0% { transform: translateX(0); } 100% { transform: translateX(200vw); } }
          .cyber-content pre { background: #111 !important; border: 1px solid #33ff00 !important; color: #33ff00 !important; border-radius: 0; }
          .cyber-content h1, .cyber-content h2 { text-transform: uppercase; letter-spacing: 0.1em; }
        `}</style>
      </div>
    );
  }

  // Science / Biology / Quantum
  if (cat.includes("science") || cat.includes("biology") || cat.includes("quantum")) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] text-[#111] font-serif relative overflow-hidden transition-colors duration-1000">
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
             className="opacity-[0.03]"
           >
              <svg viewBox="0 0 100 100" className="w-[150vw] h-[150vh] origin-center">
                 <path d="M10,50 Q40,10 50,50 T90,50" fill="none" stroke="#000" strokeWidth="0.5" />
                 <path d="M10,50 Q40,90 50,50 T90,50" fill="none" stroke="#000" strokeWidth="0.5" />
              </svg>
           </motion.div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto bg-white shadow-2xl my-12 border-t-8 border-blue-900 science-content">
           <div className="p-12 border-b border-gray-200 text-center space-y-4">
              <div className="text-xs font-bold font-sans uppercase tracking-[0.3em] text-blue-900">Academic Discovery Journal</div>
              <div className="h-px w-24 bg-blue-900 mx-auto" />
           </div>
           <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-8 md:p-16"
           >
              {children}
           </motion.div>
        </div>
        <style jsx global>{`
          .science-content h1, .science-content h2, .science-content h3 { font-family: ui-sans-serif, system-ui; font-weight: 800; color: #1e3a8a; }
          .science-content pre { background: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; border-radius: 4px; color: #0f172a !important; font-family: ui-monospace, SFMono-Regular; }
          .science-content blockquote { border-left: 4px solid #1e3a8a; background: #f8fafc; padding: 1rem; margin: 2rem 0; font-style: italic; color: #475569; }
        `}</style>
      </div>
    );
  }

  // Tutorial / Gamified
  if (cat.includes("tutorial") || cat.includes("roadmap") || cat.includes("guide")) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-background">
        <div className="absolute top-20 right-10 flex flex-col gap-4 z-50 pointer-events-none">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="p-4 bg-yellow-500/20 text-yellow-500 rounded-full backdrop-blur border border-yellow-500/30">
            <Lightbulb className="w-8 h-8" />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1 }} className="p-4 bg-purple-500/20 text-purple-500 rounded-full backdrop-blur border border-purple-500/30">
            <Zap className="w-8 h-8" />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 5, delay: 2 }} className="p-4 bg-blue-500/20 text-blue-500 rounded-full backdrop-blur border border-blue-500/30">
            <Award className="w-8 h-8" />
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="standard-hub relative z-10 p-4 border-4 border-accent/20 rounded-3xl m-8 bg-surface shadow-2xl"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  // Fallback (Tech Journalism / Standard)
  return (
    <div className="standard-hub">
      {children}
    </div>
  );
}
