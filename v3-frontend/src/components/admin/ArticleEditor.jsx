"use client";

import React, { useState, useEffect } from "react";
import Markdown from "@/components/ui/Markdown";
import { 
  Save, 
  ArrowLeft, 
  Eye, 
  Code2, 
  Loader2, 
  Zap,
  Globe,
  Tag,
  Layout,
  LayoutGrid,
  FileText,
  Clock,
  ChevronRight,
  Maximize2,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/ui/Editor"), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-surface/50 animate-pulse rounded-xl border border-white/5 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
});

import { useParams, useRouter } from "next/navigation";

export default function ArticleEditor() {
  const params = useParams();
  const id = params?.id || "new";
  const router = useRouter();
  
  const [article, setArticle] = useState({ 
    title: "", 
    content: "", 
    summary: "",
    category_id: 1,
    score: 95,
    image_url: ""
  });
  const [isLoading, setIsLoading] = useState(id && id !== "new");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [view, setView] = useState("split"); // edit, preview, split

  useEffect(() => {
    if (id && id !== "new") {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/cms/articles/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setArticle(data);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/cms/articles${id === "new" ? "" : `/${id}`}`, {
        method: id === "new" ? "POST" : "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(article)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (id === "new") {
          const data = await res.json();
          router.push(`/admin/articles/${data.id}`);
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
       <p className="text-xs font-black uppercase tracking-[0.3em]">Loading Article Metadata...</p>
    </div>
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-10">
      {/* Editor Header */}
      <header className="h-20 bg-surface border-b border-white/5 flex items-center justify-between px-10 flex-shrink-0">
        <div className="flex items-center gap-6">
           <Link 
             href="/admin/articles" 
             className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
           >
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div className="h-8 w-px bg-white/5" />
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent leading-none mb-1">Editor Active</span>
              <h2 className="text-sm font-bold text-white leading-none">
                 {id === "new" ? "Create New Article" : `Edit: ${article.title || "Loading..."}`}
              </h2>
           </div>
        </div>

        <div className="flex items-center gap-6">
           {success && (
             <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                <CheckCircle className="w-4 h-4" /> Sync Success
             </div>
           )}
           
           <div className="flex items-center gap-2 border border-white/5 rounded-xl p-1 bg-muted/50">
              <button 
                onClick={() => setView("edit")}
                className={cn("p-2 rounded-lg transition-all", view === "edit" ? "bg-accent text-white" : "text-gray-500")}
              >
                 <Code2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView("split")}
                className={cn("p-2 rounded-lg transition-all", view === "split" ? "bg-accent text-white" : "text-gray-500")}
              >
                 <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView("preview")}
                className={cn("p-2 rounded-lg transition-all", view === "preview" ? "bg-accent text-white" : "text-gray-500")}
              >
                 <Eye className="w-4 h-4" />
              </button>
           </div>
           
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:bg-blue-600 transition-all disabled:opacity-50"
           >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Push to Live
           </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(view === "edit" || view === "split") && (
          <div className={cn(
            "h-full flex flex-col bg-background border-r border-white/5",
            view === "split" ? "w-1/2" : "w-full"
          )}>
            <div className="p-10 space-y-10 overflow-y-auto custom-scroll">
               <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Article Headline..."
                    value={article.title || ""}
                    onChange={(e) => setArticle({...article, title: e.target.value})}
                    className="w-full bg-transparent text-4xl md:text-5xl font-black tracking-tighter text-white focus:outline-none placeholder:opacity-20"
                  />
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                     <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 8 Min Read</span>
                     <span className="flex items-center gap-2 px-2 py-0.5 bg-muted border border-white/5 rounded text-[10px] uppercase tracking-widest">Draft_Sync_Active</span>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Explanatory Summary (SEO)</label>
                     <textarea 
                       placeholder="Briefly explain the intent of this report..."
                       value={article.summary || ""}
                       onChange={(e) => setArticle({...article, summary: e.target.value})}
                       className="w-full bg-surface border border-white/5 p-4 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-accent transition-colors min-h-[100px] resize-none font-medium"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">EditorJS Block Content</label>
                     <Editor 
                       content={article.content}
                       onChange={(data) => setArticle({...article, content: data})}
                     />
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Preview Pane */}
        {(view === "preview" || view === "split") && (
          <div className={cn(
            "h-full bg-[#0a0c10] overflow-y-auto custom-scroll p-10 md:p-20",
            view === "split" ? "w-1/2" : "w-full"
          )}>
             <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
                <div className="space-y-4">
                   <div className="h-1 w-12 bg-accent rounded-full" />
                   <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                      {article.title || "Article Headline Placeholder"}
                   </h1>
                   <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>{new Date().toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By Sentinel Engine</span>
                   </div>
                </div>
                
                <Markdown content={article.content || "_Your article content will appear here in real-time professional layout._"} />
             </div>
          </div>
        )}
      </div>

      {/* Settings Bar */}
      <footer className="h-16 bg-surface border-t border-white/5 flex items-center justify-between px-10 flex-shrink-0">
          <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category ID:</label>
                <select 
                  value={article.category_id || 1}
                  onChange={(e) => setArticle({...article, category_id: parseInt(e.target.value)})}
                  className="bg-transparent text-[11px] font-bold text-accent uppercase tracking-widest focus:outline-none border-b border-accent/20 pb-1"
                >
                   <option value={1}>Technology</option>
                   <option value={2}>Cybersecurity</option>
                   <option value={3}>Artificial Intelligence</option>
                   <option value={4}>Research</option>
                </select>
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Confidence:</label>
                <span className="text-[11px] font-black text-white bg-accent/10 px-2 py-0.5 rounded border border-accent/20">{article.score}%</span>
             </div>
             <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hero Image URL:</label>
                <input 
                  type="text" 
                  value={article.image_url || ""}
                  onChange={(e) => setArticle({...article, image_url: e.target.value})}
                  placeholder="https://..."
                  className="bg-transparent text-[10px] font-mono text-gray-400 focus:outline-none border-b border-white/10 pb-1 w-48"
                />
             </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">LIVE_CONTENT_SYNC</span>
             <button className="p-2 bg-muted rounded-lg text-gray-500 hover:text-white border border-white/5">
                <Maximize2 className="w-4 h-4" />
              </button>
          </div>
      </footer>
    </div>
  );
}
