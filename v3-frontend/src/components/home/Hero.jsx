"use client";

import { motion } from "framer-motion";
import { Terminal, Shield, Zap, Activity, ChevronRight, Cpu } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background FX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="h-px w-8 bg-accent"></div>
            <span className="text-accent font-mono text-xs uppercase tracking-[0.3em] font-bold">
              Autonomous Intelligence Feed v3.0
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9] mb-8"
          >
            Decrypting the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary text-glow">
              Future of Tech
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
          >
            SentinelReign is a deep-tech intelligence platform analyzing cybersecurity vectors, 
            emerging scientific breakthroughs, and advanced technical research.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              href="/articles" 
              className="px-8 py-4 bg-accent text-background font-bold uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-white transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              style={{ clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)" }}
            >
              Access Database <Terminal className="w-4 h-4" />
            </Link>
            <Link 
              href="/tutorials" 
              className="px-8 py-4 bg-muted border border-white/10 text-white font-bold uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-white/5 transition-all"
              style={{ clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0% 100%)" }}
            >
              Intelligence Labs <Cpu className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-8"
          >
            {[
              { label: "Active Nodes", val: "1,248", icon: Activity },
              { label: "Alert Level", val: "STABLE", icon: Shield },
              { label: "Inference Speed", val: "0.4ms", icon: Zap },
              { label: "Last Sync", val: "ACTIVE", icon: Activity }
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <stat.icon className="w-3 h-3 text-accent" />
                  {stat.label}
                </div>
                <div className="text-xl font-mono font-bold text-white">{stat.val}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Hero Visual Element */}
      <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-1/2 h-full hidden xl:block opacity-40">
        <div className="relative w-full h-full">
           <div className="absolute inset-0 bg-gradient-to-l from-accent/20 to-transparent"></div>
           {/* Animated lines or grid can go here */}
        </div>
      </div>
    </section>
  );
}
