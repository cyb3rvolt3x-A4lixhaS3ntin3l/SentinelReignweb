"use client";

import "@puckeditor/core/dist/index.css";
import { Puck } from "@puckeditor/core";
import { config } from "../../../../puck.config";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

const initialData = {
  content: [
    { type: "Navbar", props: { logoText: "SENTINELREIGN" } },
    { type: "Hero", props: { title: "Global Intelligence Matrix", subtitle: "Tracking Advanced Vectors" } },
    { type: "Footer", props: { copyright: "© 2026 SentinelReign Systems" } }
  ],
  root: {},
};

export default function BuilderPage() {
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);

  // In a real scenario, fetch layout from the database
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cms/layout`)
      .then(res => res.json())
      .then(resData => {
         if (resData && resData.content) setData(resData);
      })
      .catch(() => console.log("Using default FSE layout"));
  }, []);

  const saveLayout = async (newData) => {
    setData(newData);
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cms/layout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newData)
      });
    } catch (e) {
      console.error("Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col pt-20">
      <header className="h-16 bg-[#0a0c10] border-b border-white/10 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
           <Link href="/admin" className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
              <ArrowLeft className="w-4 h-4" />
           </Link>
           <h1 className="text-sm font-black uppercase tracking-widest text-white">Full Site Editor</h1>
        </div>
        <div className="flex items-center gap-4">
           {saving && <span className="text-xs text-accent flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Saving</span>}
        </div>
      </header>
      <div className="flex-1 origin-top-left overflow-hidden">
        <Puck 
          config={config} 
          data={data} 
          onPublish={saveLayout} 
          overrides={{
            headerActions: () => (
              <button disabled={saving} className="bg-accent text-white px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2">
                 <Save className="w-4 h-4" /> Publish Layout
              </button>
            )
          }}
        />
      </div>
    </div>
  );
}
