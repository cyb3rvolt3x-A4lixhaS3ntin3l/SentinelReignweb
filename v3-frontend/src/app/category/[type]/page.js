"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ArticleGrid from "@/components/ui/ArticleGrid";
import { ArrowLeft, Layout, Loader2 } from "lucide-react";
import Link from "next/link";
import GenreWrapper from "@/components/ui/GenreWrapper";

export default function CategoryPage() {
  const { type } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type) fetchArticles();
  }, [type]);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/articles?category=${type}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.data || []);
      }
    } catch (e) {
      console.error("Fetch failed");
    }
    setLoading(false);
  };

  const title = type ? type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ") : "Category";

  return (
    <GenreWrapper category={type}>
      <div className="pt-32 pb-24 min-h-screen">
      <div className="container-wide">
        
        <header className="mb-20 space-y-6">
           <Link 
             href="/articles" 
             className="inline-flex items-center gap-2 text-accent text-sm font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
           >
             <ArrowLeft className="w-4 h-4" /> Back to Archive
           </Link>
           
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                       <Layout className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                      {title}
                    </h1>
                 </div>
                 <p className="text-gray-400 text-lg max-w-2xl font-medium">
                   Exploring the latest breakthroughs and strategic analysis in the field of {title.toLowerCase()}.
                 </p>
              </div>
              <div className="text-right">
                 <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sector Index</p>
                 <p className="text-2xl font-black text-white">{articles.length} Reports</p>
              </div>
           </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
             <Loader2 className="w-12 h-12 animate-spin text-accent" />
          </div>
        ) : articles.length > 0 ? (
          <ArticleGrid articles={articles} />
        ) : (
          <div className="py-32 text-center pro-card">
             <h2 className="text-2xl font-bold uppercase mb-2">No Articles Found</h2>
             <p className="text-gray-500">The archive for this category is currently empty.</p>
          </div>
        )}

      </div>
    </div>
    </GenreWrapper>
  );
}
