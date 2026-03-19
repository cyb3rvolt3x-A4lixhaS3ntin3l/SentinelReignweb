"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Globe, 
  ShieldCheck, 
  Navigation, 
  Save, 
  Loader2,
  ChevronRight,
  Database
} from "lucide-react";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cms/settings`);
      if (res.ok) {
        const data = await res.json();
        const obj = {};
        data.forEach(s => obj[s.key_name] = s.value);
        setSettings(obj);
      }
    } catch (e) { console.error("Could not fetch settings"); }
    setLoading(false);
  };

  const handleSave = async (key, val) => {
    setSaving(true);
    try {
       await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/cms/settings`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ key_name: key, value: val }),
       });
       setSettings({...settings, [key]: val});
    } catch (e) { console.error("Save failed"); }
    setSaving(false);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Matrix Configuration</h1>
        <p className="text-gray-500 text-sm font-medium">Fine-tune the SentinelReign global protocol and brand identity nodes.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Site Identity */}
        <section className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
              <Globe className="w-4 h-4" /> Branding & Identity
           </h3>
           <div className="glass-panel p-8 rounded-xl space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Platform Title</label>
                 <input 
                   type="text" 
                   value={settings.site_name || "SentinelReign"}
                   onChange={(e) => handleSave("site_name", e.target.value)}
                   className="w-full bg-background border border-white/5 p-4 rounded text-sm text-white focus:outline-none focus:border-accent/30 transition-colors font-mono"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Footer Encryption Tag</label>
                 <input 
                   type="text" 
                   value={settings.footer_text || ""}
                   onChange={(e) => handleSave("footer_text", e.target.value)}
                   className="w-full bg-background border border-white/5 p-4 rounded text-sm text-gray-400 focus:outline-none focus:border-accent/30 transition-colors font-mono"
                 />
              </div>
           </div>
        </section>

        {/* Global Intelligence Promo */}
        <section className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Database className="w-4 h-4" /> Operational Constants
           </h3>
           <div className="glass-panel p-8 rounded-xl space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Header Intelligence Ticker</label>
                 <textarea 
                   value={settings.header_promo || ""}
                   onChange={(e) => handleSave("header_promo", e.target.value)}
                   className="w-full bg-background border border-white/5 p-4 rounded text-sm text-gray-400 focus:outline-none focus:border-accent/30 transition-colors font-mono min-h-[100px] resize-none"
                 />
              </div>
           </div>
        </section>

        {/* Social Matrix */}
        <section className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Social Ingress Points
           </h3>
           <div className="glass-panel p-8 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-8">
              {["social_twitter", "social_github", "social_linkedin", "social_mail"].map(key => (
                 <div key={key} className="space-y-2">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{key.replace('social_', '').toUpperCase()}</label>
                    <input 
                      type="text" 
                      value={settings[key] || ""}
                      onChange={(e) => handleSave(key, e.target.value)}
                      className="w-full bg-background border border-white/5 p-3 rounded text-xs text-gray-400 focus:outline-none focus:border-accent/30 transition-colors font-mono"
                    />
                 </div>
              ))}
           </div>
        </section>

        {/* System Protocols */}
        <section className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Security Protocols
           </h3>
           <div className="glass-panel p-8 rounded-xl space-y-6">
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Maintenance Mode</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Restricts matrix access</p>
                 </div>
                 <div className="w-10 h-5 bg-gray-700 rounded-full cursor-not-allowed opacity-50" />
              </div>
              <div className="flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">API Debugger</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Exposes telemetry endpoints</p>
                 </div>
                 <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-3 h-3 bg-white rounded-full" />
                 </div>
              </div>
           </div>
        </section>
      </div>

      <footer className="pt-12 flex items-center justify-center text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em]">
         {saving ? "COMMITTING CHANGES TO CORE..." : "SENTINELREIGN PROTOCOL v3.0 // STANDBY"}
      </footer>
    </div>
  );
}
