"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PageManager() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cms/pages`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPages(data || []);
      }
    } catch (e) {
      console.error("Pages fetch failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm("Are you sure you want to delete this static page?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/cms/pages/${slug}`, { 
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPages(prev => prev.filter(p => p.slug !== slug));
      }
    } catch (e) {
      console.error("Deletion failed");
    }
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Static<span className="text-accent italic">Pages</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage core platform informational pages</p>
        </div>
        <Link 
          href="/admin/pages/edit/new" 
          className="bg-accent text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-accent/20"
        >
           <Plus className="w-5 h-5" /> Create New Page
        </Link>
      </header>

      <div className="pro-card p-6 bg-surface">
        <div className="relative w-full max-w-sm mb-8">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search static pages..."
             className="w-full bg-background border border-white/5 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent/40 transition-all"
           />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20 gap-4">
             <Loader2 className="w-10 h-10 animate-spin text-accent" />
             <p className="text-[10px] font-black uppercase tracking-widest">Accessing Intelligence Registry...</p>
          </div>
        ) : filteredPages.length > 0 ? (
          <div className="overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-white/5 text-[9px] uppercase font-black text-gray-400">
                   <tr>
                      <th className="px-8 py-4 tracking-widest">Page Structure</th>
                      <th className="px-8 py-4 tracking-widest">Visibility state</th>
                      <th className="px-8 py-4 tracking-widest text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {filteredPages.map((page) => (
                      <tr key={page.slug} className="hover:bg-accent/5 transition-colors group">
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-white/5 border border-white/5 rounded-xl group-hover:text-accent transition-colors">
                                  <FileText className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-sm font-bold text-white mb-0.5">{page.title}</p>
                                  <p className="text-[10px] text-gray-500 font-mono italic">/page/{page.slug}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                               <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                               Active Hub
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center justify-end gap-3">
                               <Link 
                                 href={`/page/${page.slug}`} 
                                 target="_blank"
                                 className="p-2.5 text-gray-500 hover:text-white bg-white/5 rounded-xl transition-all"
                               >
                                  <ExternalLink className="w-4 h-4" />
                               </Link>
                               <Link 
                                 href={`/admin/pages/edit/${page.slug}`}
                                 className="p-2.5 text-gray-500 hover:text-accent bg-white/5 rounded-xl transition-all"
                               >
                                  <Edit3 className="w-4 h-4" />
                               </Link>
                               <button 
                                 onClick={() => handleDelete(page.slug)}
                                 className="p-2.5 text-gray-500 hover:text-red-500 bg-white/5 rounded-xl transition-all"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        ) : (
          <div className="py-20 text-center opacity-30">
             <AlertCircle className="w-12 h-12 mx-auto mb-4" />
             <p className="font-black uppercase tracking-widest text-xs">No static pages discovered.</p>
          </div>
        )}
      </div>
    </div>
  );
}
