"use client";

import React, { useState, useEffect } from "react";
import { 
  Zap, 
  Search, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  Database,
  RefreshCw,
  Globe,
  Settings,
  Plus,
  Play,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AITools() {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/engine/logs?limit=20`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.map(log => ({
            time: new Date(log.timestamp).toLocaleTimeString(),
            type: log.status.toLowerCase(),
            msg: `[${log.agent_name}] ${log.action}${log.details ? ` - ${log.details}` : ''}`
          })));
        }
      } catch (e) {
        console.error("Failed to fetch logs");
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000); // Real-time polling
    return () => clearInterval(interval);
  }, []);

  const addLocalActionLog = (msg, type = "info") => {
    setLogs(prev => [{
      time: new Date().toLocaleTimeString(),
      msg,
      type
    }, ...prev.slice(0, 19)]);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    addLocalActionLog(`Dispatching generation request to engine for: ${topic}`, "info");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/engine/generate_manual`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        addLocalActionLog(`Generation signal accepted by backend background processor.`, "done");
        setTopic("");
      } else {
        addLocalActionLog(`Error: Generator rejected request.`, "error");
      }
    } catch (e) {
      addLocalActionLog(`Error: Connection to AI Generator lost.`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCrawl = async () => {
    const newState = !isCrawling;
    setIsCrawling(newState);
    addLocalActionLog(newState ? "Dispatching Automated research engine START signal." : "Automated research engine STOP signal sent.");
    if (!newState) return; // Note we only have a trigger endpoint right now, so we just trigger it when starting
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/engine/trigger`, { 
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (e) {
      addLocalActionLog("Error: Failed to sync research state with backend.", "error");
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Content<span className="text-accent italic">Generator</span></h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-1">Automated Content Creation Control Center</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Manual Generation */}
        <div className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Manual Article Generation
           </h3>
           <div className="pro-card p-8 space-y-8 bg-surface border border-white/5 rounded-2xl">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Target Topic or Keyword</label>
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Enter a deep technical topic..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-background border border-white/5 pl-12 pr-4 py-4 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-accent transition-all"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Content Type</label>
                    <select className="w-full bg-background border border-white/5 p-3 rounded-lg text-[11px] font-bold text-gray-400 focus:outline-none">
                       <option>Technical Analysis</option>
                       <option>Detailed Tutorial</option>
                       <option>Brief Alert</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Detail Level</label>
                    <select className="w-full bg-background border border-white/5 p-3 rounded-lg text-[11px] font-bold text-gray-400 focus:outline-none">
                       <option>Extreme Research</option>
                       <option>Standard Summary</option>
                       <option>Introductory</option>
                    </select>
                 </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="w-full py-5 bg-accent text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-lg shadow-accent/20 hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                {isGenerating ? "GENERATING ARTICLE..." : "START AI GENERATION"}
              </button>
           </div>
        </div>

        {/* Automated Research Control */}
        <div className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" /> Automated Research Engine
           </h3>
           <div className="pro-card p-8 space-y-8 bg-surface border border-white/5 rounded-2xl">
              <div className="flex items-center justify-between p-6 bg-muted rounded-xl border border-white/5">
                 <div className="space-y-1">
                    <p className="font-bold text-white uppercase tracking-tight">Main Search Crawler</p>
                    <p className={cn("text-[10px] font-bold uppercase", isCrawling ? "text-emerald-500" : "text-amber-500")}>
                      STATUS: {isCrawling ? "ACTIVE & RESEARCHING" : "SUSPENDED"}
                    </p>
                 </div>
                 <button 
                   onClick={toggleCrawl}
                   className={cn(
                     "px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border",
                     isCrawling 
                      ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white" 
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                   )}
                 >
                    {isCrawling ? "STOP ENGINE" : "START ENGINE"}
                 </button>
              </div>

              <div className="space-y-6">
                 <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Search Sources</h4>
                 <div className="space-y-3">
                    {["The Hacker News", "TechCrunch Security", "Bleeping Computer", "OpenAI Research"].map(source => (
                      <div key={source} className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-white/5 group hover:bg-muted transition-colors">
                         <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{source}</span>
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    ))}
                 </div>
                 <button className="w-full py-3 bg-muted border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Custom Research Source
                 </button>
              </div>
           </div>
        </div>

        {/* Generator Logs */}
        <div className="xl:col-span-2 space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accent" /> Real-time Generator Logs
           </h3>
           <div className="pro-card p-6 bg-black/50 font-mono text-[11px] text-gray-400 space-y-3 h-[400px] overflow-y-auto custom-scroll border border-white/5 rounded-2xl">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                   <span className="text-accent/60 min-w-[80px]">[{log.time}]</span>
                   <span className={cn(
                     "min-w-[60px] font-black",
                     log.type === "info" ? "text-blue-500" : 
                     log.type === "error" ? "text-red-500" : 
                     log.type === "done" ? "text-emerald-500" : "text-amber-500"
                   )}>
                     [{log.type.toUpperCase()}]
                   </span>
                   <span className={cn(log.type === "done" ? "text-white" : "")}>{log.msg}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="flex items-center justify-center h-full opacity-20">
                   <p className="text-[10px] font-black uppercase tracking-widest italic">Listening for generator signals...</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
