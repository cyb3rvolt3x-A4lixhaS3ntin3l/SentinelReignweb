"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Loader2, 
  CheckCircle,
  Layout,
  Type,
  FileText
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PageEditor() {
  const { slug } = useParams();
  const router = useRouter();
  const [page, setPage] = useState({ title: "", content: "", slug: "" });
  const [isLoading, setIsLoading] = useState(slug !== "new");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (slug && slug !== "new") {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/cms/pages/${slug}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPage(data);
      }
    } catch (e) {
      console.error("Fetch failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/cms/pages${slug === "new" ? "" : `/${slug}`}`, {
        method: slug === "new" ? "POST" : "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(page)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (slug === "new") {
          const data = await res.json();
          router.push(`/admin/pages/edit/${data.slug}`);
        }
      }
    } catch (e) {
      console.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-20">
       <Loader2 className="w-12 h-12 animate-spin text-accent" />
       <p className="text-xs font-black uppercase tracking-[0.3em]">Accessing Page Nodes...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-4">
           <Link 
             href="/admin/pages" 
             className="inline-flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-accent transition-colors"
           >
             <ArrowLeft className="w-3 h-3" /> Registry Index
           </Link>
           <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
             {slug === "new" ? "Initialize" : "Modify"}<span className="text-accent italic">Page</span>
           </h1>
        </div>
        <div className="flex items-center gap-4">
           {success && (
             <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                <CheckCircle className="w-4 h-4" /> Saved Successfully
             </div>
           )}
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="bg-accent text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all flex items-center gap-3 disabled:opacity-50"
           >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="pro-card p-8 space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-accent">
                    <Type className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Page title</span>
                 </div>
                 <input 
                   type="text" 
                   value={page.title}
                   onChange={(e) => setPage({...page, title: e.target.value})}
                   placeholder="Enter page title (e.g. Terms of Service)"
                   className="w-full bg-background border border-white/5 rounded-xl px-6 py-5 text-xl font-bold text-white focus:border-accent outline-none transition-all placeholder:opacity-20"
                 />
              </div>
              
              <div className="space-y-4 pt-6 border-t border-white/5">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-400">
                       <FileText className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Content Structure (Markdown)</span>
                    </div>
                 </div>
                 <textarea 
                   value={page.content}
                   onChange={(e) => setPage({...page, content: e.target.value})}
                   placeholder="Synthesis platform report content using markdown..."
                   className="w-full bg-background border border-white/5 rounded-xl px-6 py-6 text-base text-gray-300 focus:border-accent outline-none transition-all min-h-[500px] font-medium leading-relaxed resize-none custom-scroll"
                 />
              </div>
           </div>
        </div>

        <aside className="space-y-8">
           <div className="pro-card p-8 space-y-6 bg-surface/50">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <Layout className="w-4 h-4 text-accent" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-white">Registry metadata</h3>
              </div>
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">URL Identifier (Slug)</label>
                    <div className="flex items-center bg-background border border-white/5 rounded-lg px-4 py-3 gap-2">
                       <span className="text-[10px] font-mono text-gray-600">/page/</span>
                       <input 
                         type="text" 
                         value={page.slug}
                         onChange={(e) => setPage({...page, slug: e.target.value.toLowerCase().replace(/ /g, "-")})}
                         className="bg-transparent border-none focus:outline-none text-xs font-bold text-white w-full"
                         placeholder="about-us"
                       />
                    </div>
                 </div>
                 <div className="pt-4 space-y-4">
                    <button className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:text-accent transition-all">
                       <Eye className="w-4 h-4" /> Visual Preview
                    </button>
                    <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                       <p className="text-[9px] font-medium text-accent leading-relaxed italic">
                         Pages are rendered using the elite prose-cms Markdown engine, ensuring premium technical typography across all devices.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}
