"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Search, 
  Upload, 
  Grid, 
  List, 
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Info,
  CheckCircle,
  X,
  Loader2,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MediaLibrary() {
  const [view, setView] = useState("grid");
  const [selected, setSelected] = useState(null);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/media`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (e) {
      console.error("Media fetch failed");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple toast could be added here
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/admin/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAssets(prev => prev.filter(a => a.id !== id));
        setSelected(null);
      }
    } catch (e) {
      console.error("Deletion failed");
    }
  };

  const filteredAssets = assets.filter(a => 
    a.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Media<span className="text-accent italic">Library</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Professional Media & Asset Repository</p>
        </div>
        <button className="bg-accent text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-accent/20">
           <Upload className="w-5 h-5" /> Upload Assets
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
           <div className="pro-card p-4 flex items-center justify-between bg-surface">
              <div className="relative w-full max-w-xs">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search media library..."
                   className="w-full bg-background border border-white/5 pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-accent/40 transition-all"
                 />
              </div>
              <div className="flex items-center gap-2 border border-white/5 rounded-xl p-1 bg-muted/50">
                 <button 
                   onClick={() => setView("grid")}
                   className={cn("p-2 rounded-lg transition-all", view === "grid" ? "bg-accent text-white" : "text-gray-400")}
                 >
                    <Grid className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => setView("list")}
                   className={cn("p-2 rounded-lg transition-all", view === "list" ? "bg-accent text-white" : "text-gray-400")}
                 >
                    <List className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-32 opacity-20 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-accent" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Loading Media Assets...</p>
             </div>
           ) : filteredAssets.length > 0 ? (
             view === "grid" ? (
               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAssets.map((asset) => (
                    <button 
                      key={asset.id}
                      onClick={() => setSelected(asset)}
                      className={cn(
                        "pro-card aspect-square relative group overflow-hidden bg-muted/30 hover:border-accent/40 transition-all",
                        selected?.id === asset.id ? "border-accent ring-2 ring-accent/20" : "border-white/5"
                      )}
                    >
                       {asset.type.startsWith('image') ? (
                         <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                       ) : (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-gray-800" />
                         </div>
                       )}
                       <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors" />
                       <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-[10px] font-black text-white uppercase truncate bg-background/90 backdrop-blur px-2 py-1 rounded border border-white/5">{asset.filename}</p>
                       </div>
                    </button>
                  ))}
               </div>
             ) : (
               <div className="pro-card border-none bg-surface/50 overflow-hidden">
                  <table className="w-full text-left">
                     <thead className="bg-white/5 text-[9px] uppercase font-black text-gray-400">
                        <tr>
                           <th className="px-6 py-4 tracking-widest">Media File</th>
                           <th className="px-6 py-4 tracking-widest">Metadata</th>
                           <th className="px-6 py-4 tracking-widest">Upload Date</th>
                           <th className="px-6 py-4 text-right tracking-widest">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {filteredAssets.map((asset) => (
                           <tr key={asset.id} className={cn("hover:bg-accent/5 transition-colors cursor-pointer", selected?.id === asset.id ? "bg-accent/5" : "")} onClick={() => setSelected(asset)}>
                              <td className="px-6 py-4 flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center border border-white/5 overflow-hidden">
                                    {asset.type.startsWith('image') ? <img src={asset.url} className="w-full h-full object-cover" /> : <FileText className="w-5 h-5 opacity-40" />}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-white mb-0.5">{asset.filename}</p>
                                    <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{asset.type}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-400">{asset.size}</td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-500 font-mono italic">{new Date(asset.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right">
                                 <button onClick={(e) => { e.stopPropagation(); copyToClipboard(asset.url); }} className="p-2 text-gray-600 hover:text-accent transition-colors"><Copy className="w-4 h-4" /></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             )
           ) : (
             <div className="py-32 text-center pro-card border-dashed border-white/10 opacity-30">
                <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No media files found.</p>
             </div>
           )}
        </div>

        <aside className="space-y-6">
           <div className="pro-card p-8 bg-surface/80 backdrop-blur-3xl border-white/10 sticky top-32">
              {selected ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="aspect-square bg-muted/50 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
                      {selected.type.startsWith('image') ? (
                        <img src={selected.url} className="w-full h-full object-contain" />
                      ) : (
                        <FileText className="w-16 h-16 text-gray-700" />
                      )}
                      <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-2 bg-background/80 hover:bg-red-500 text-white rounded-full transition-all border border-white/10 opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
                   </div>
                   <div className="space-y-5">
                      <div>
                         <label className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1.5 block">File Name</label>
                         <p className="text-sm font-bold text-white break-all">{selected.filename}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">File Type</label>
                            <p className="text-xs font-bold text-gray-300">{selected.type}</p>
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">Asset Size</label>
                            <p className="text-xs font-bold text-gray-300">{selected.size}</p>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-3 pt-6 border-t border-white/5">
                      <button onClick={() => copyToClipboard(selected.url)} className="w-full flex items-center justify-center gap-3 py-4 bg-accent text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-accent/20">
                         <Copy className="w-4 h-4" /> Copy Access Link
                      </button>
                      <button onClick={() => handleDelete(selected.id)} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-500 hover:text-white transition-all">
                         <Trash2 className="w-4 h-4" /> Delete Permanently
                      </button>
                   </div>
                </div>
              ) : (
                <div className="text-center py-20 space-y-4 opacity-30">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Info className="w-8 h-8" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest">Matrix Idle</p>
                      <p className="text-[10px] font-medium leading-relaxed">Select a media file to view its metadata and management options.</p>
                   </div>
                </div>
              )}
           </div>
        </aside>
      </div>
    </div>
  );
}

