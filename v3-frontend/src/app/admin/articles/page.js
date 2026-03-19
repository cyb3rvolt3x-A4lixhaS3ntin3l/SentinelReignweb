"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Layout,
  FileText,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ArticleManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cms/articles`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const json = await res.json();
        setArticles(json || []);
      }
    } catch (e) {
      console.error("Fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setDeleting(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/cms/articles/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setArticles(articles.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Content<span className="text-accent italic">Manager</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage articles, reports, and generated content</p>
        </div>
        <Link 
          href="/admin/articles/new" 
          className="bg-accent text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-accent/20"
        >
          <Plus className="w-5 h-5" /> Create New Article
        </Link>
      </header>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="pro-card p-8 flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20">
               <CheckCircle className="w-7 h-7" />
            </div>
            <div>
               <p className="text-3xl font-black text-white">{articles.length}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Articles Published</p>
            </div>
         </div>
         <div className="pro-card p-8 flex items-center gap-6">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center border border-accent/20">
               <FileText className="w-7 h-7" />
            </div>
            <div>
               <p className="text-3xl font-black text-white">{articles.filter(a => a.category === "Technology").length}</p>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Tech Reports</p>
            </div>
         </div>
         <div className="pro-card p-8 flex items-center gap-6">
            <div className="w-14 h-14 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center border border-purple-500/20">
               <Clock className="w-7 h-7" />
            </div>
            <div>
               <p className="text-3xl font-black text-white">{new Date().toLocaleDateString()}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Last Data Sync</p>
            </div>
         </div>
      </div>

      <div className="pro-card overflow-hidden bg-surface">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"                 placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-white/5 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent/40 transition-all font-medium"
              />
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:text-accent transition-all">
                  <Filter className="w-4 h-4" /> Advanced Filter
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-20">
                <Loader2 className="w-10 h-10 animate-spin text-accent" />
                <p className="text-[10px] font-black uppercase tracking-widest">Querying Global Hub...</p>
             </div>
          ) : filtered.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] uppercase tracking-[0.2em] font-black text-gray-400">
                <tr>
                   <th className="px-8 py-5">Article Headline</th>
                   <th className="px-8 py-5 text-center">AI Score</th>
                   <th className="px-8 py-5 text-center">Category</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/5 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-white group-hover:text-accent transition-all duration-300">{item.title}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-1 opacity-60">/article/{item.slug}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="text-xs font-black text-accent bg-accent/5 px-2.5 py-1 rounded-lg border border-accent/10">
                          {item.ai_verification_score || 95}%
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                          {item.category || "General"}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                         <Link href={`/admin/articles/${item.id}`} className="p-2.5 text-gray-400 hover:text-accent bg-white/5 rounded-xl transition-all border border-white/10"><Edit className="w-4 h-4" /></Link>
                         <Link href={`/article/${item.slug}`} target="_blank" className="p-2.5 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all border border-white/10"><Eye className="w-4 h-4" /></Link>
                         <button 
                           onClick={() => handleDelete(item.id)}
                           disabled={deleting === item.id}
                           className="p-2.5 text-gray-400 hover:text-red-500 bg-white/5 rounded-xl transition-all border border-white/10 disabled:opacity-30"
                         >
                            {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-32 text-center opacity-30">
               <FileText className="w-12 h-12 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No articles detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
