"use client";

import React from "react";
import { Mail, Zap, Shield, Terminal, Lock } from "lucide-react";

export default function NewsletterPage() {
  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="container-wide relative">
        <div className="max-w-4xl mx-auto space-y-16">
           
           <header className="text-center space-y-6">
              <div className="w-20 h-20 bg-accent text-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-accent/20">
                 <Mail className="w-10 h-10" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white">
                The Weekly <span className="text-accent italic">Sentinel.</span>
              </h1>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                Join 12,000+ technical professionals receiving exclusive cybersecurity research and software architecture analysis.
              </p>
           </header>

           <div className="pro-card p-1 md:p-2 bg-gradient-to-br from-accent/20 to-transparent">
              <div className="bg-surface rounded-[10px] p-8 md:p-16 flex flex-col items-center space-y-10 text-center">
                 <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Access the Elite Feed</h3>
                    <p className="text-sm text-gray-500 font-medium max-w-md">
                       No spam. Just hard-hitting technical intelligence delivered to your terminal every Monday morning.
                    </p>
                 </div>

                 <div className="w-full max-w-md space-y-4">
                    <div className="relative group">
                       <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                       <input 
                         type="email" 
                         placeholder="Enter email for secure delivery..."
                         className="w-full bg-background border border-white/10 pl-14 pr-6 py-5 rounded-xl text-white focus:outline-none focus:border-accent transition-all font-medium"
                       />
                    </div>
                    <button className="w-full py-5 bg-accent text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-lg shadow-accent/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 group">
                       Initialize Subscription <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />
                    </button>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest pt-2 flex items-center justify-center gap-2">
                       <Lock className="w-3 h-3" /> End-to-End Encrypted Protocols
                    </p>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10">
              {[
                { name: "Zero Trust Analysis", icon: Lock },
                { name: "Vulnerability Intel", icon: Shield },
                { name: "Neural Architectures", icon: Zap }
              ].map((feature, i) => (
                <div key={i} className="pro-card p-6 flex flex-col items-center text-center space-y-4 bg-surface/50">
                   <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-accent border border-white/5">
                      <feature.icon className="w-6 h-6" />
                   </div>
                   <h4 className="text-sm font-bold text-white uppercase tracking-wide">{feature.name}</h4>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
