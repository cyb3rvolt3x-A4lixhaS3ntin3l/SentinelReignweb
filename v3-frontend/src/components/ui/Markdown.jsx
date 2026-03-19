"use client";

import React from "react";
import { marked } from "marked";
import { cn } from "@/lib/utils";

export default function Markdown({ content, className }) {
  if (!content) return null;

  // Configure marked for professional typography
  const html = typeof content === 'string' ? marked.parse(content) : '';

  return (
    <div 
      className={cn(
        "prose-cms",
        // Typography tokens for professional layout
        "max-w-none",
        "text-gray-300 font-medium leading-[1.8]",
        // Headings
        "[&_h1]:text-4xl md:[&_h1]:text-6xl [&_h1]:font-black [&_h1]:mb-12 [&_h1]:mt-20 [&_h1]:text-white [&_h1]:tracking-tighter",
        "[&_h2]:text-3xl md:[&_h2]:text-4xl [&_h2]:font-extrabold [&_h2]:mb-8 [&_h2]:mt-16 [&_h2]:text-white [&_h2]:tracking-tight",
        "[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mb-6 [&_h3]:mt-12 [&_h3]:text-white",
        // Paragraphs & Spacing
        "[&_p]:mb-10",
        // Lists
        "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-10 [&_ul_li]:mb-3",
        "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-10 [&_ol_li]:mb-3",
        // Links
        "[&_a]:text-accent [&_a]:font-bold [&_a]:underline [&_a:hover]:text-white",
        // Code Blocks
        "[&_pre]:bg-[#0d111b] [&_pre]:rounded-xl [&_pre]:p-8 [&_pre]:my-12 [&_pre]:border [&_pre]:border-white/5 [&_pre]:overflow-x-auto",
        "[&_code]:font-mono [&_code]:text-sm [&_code]:text-accent",
        "[&_pre_code]:text-gray-300 [&_pre_code]:text-[13px] [&_pre_code]:leading-relaxed",
        // Blockquotes
        "[&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-8 [&_blockquote]:italic [&_blockquote]:text-gray-400 [&_blockquote]:my-12",
        // Bold/Strong
        "[&_strong]:text-white [&_strong]:font-black",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
