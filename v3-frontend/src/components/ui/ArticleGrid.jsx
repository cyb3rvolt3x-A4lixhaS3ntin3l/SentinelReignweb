"use client";

import React from "react";
import ArticleCard from "./ArticleCard";

export default function ArticleGrid({ articles, limit = 6, title, subtitle }) {
  const displayArticles = articles?.slice(0, limit) || [];

  if (displayArticles.length === 0) return null;

  return (
    <div className="space-y-12">
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            {subtitle && (
              <span className="text-accent font-mono text-[10px] uppercase tracking-[0.3em] font-black">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
                {title}
              </h2>
            )}
          </div>
          <div className="h-px flex-1 bg-white/5 mx-8 hidden lg:block" />
          <button className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-accent transition-colors flex items-center gap-2">
            View Analysis Hub <div className="w-1.5 h-1.5 bg-accent rounded-full" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayArticles.map((article, i) => (
          <ArticleCard key={article.id || article.slug || i} article={article} index={i} />
        ))}
      </div>
    </div>
  );
}
