"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArticleCard({ article, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="pro-card group"
    >
      <Link href={`/article/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-gray-700">
               <span className="text-[10px] font-bold uppercase tracking-widest">No Image Asset</span>
            </div>
          )}
          <div className="absolute top-4 left-4">
             <span className="px-3 py-1 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                {article.category || "General"}
             </span>
          </div>
        </div>

        <div className="p-8 space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
             <span className="flex items-center gap-1.5">
               <Calendar className="w-3 h-3 text-accent" /> 
               {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Draft"}
             </span>
             <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-accent" /> {article.author?.name || article.author_name || "Sentinel"}</span>
          </div>
          
          <h3 className="text-xl md:text-2xl font-extrabold leading-tight transition-colors group-hover:text-accent">
            {article.title}
          </h3>
          
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed font-medium">
            {article.summary}
          </p>

          <div className="pt-4 flex items-center gap-2 text-accent text-[10px] font-bold uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
             Read Full Article <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
