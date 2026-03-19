"use client";

import React, { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";

export default function Editor({ content, onChange }) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current && holderRef.current) {
      let initialData;
      try {
        initialData = typeof content === "string" ? JSON.parse(content) : content;
      } catch (e) {
        // If content is plain markdown or empty string, initialize empty
        initialData = { blocks: [] };
      }

      const editor = new EditorJS({
        holder: holderRef.current,
        tools: {
          header: { class: Header, inlineToolbar: true },
          list: { class: List, inlineToolbar: true },
          quote: { class: Quote, inlineToolbar: true },
          code: CodeTool,
        },
        data: initialData,
        autofocus: true,
        placeholder: "Start your intelligence briefing...",
        onChange: async () => {
          if (editorRef.current) {
             const data = await editorRef.current.save();
             onChange(JSON.stringify(data));
          }
        },
      });
      
      editorRef.current = editor;
    }

    return () => {
      // EditorJS destroy method should only run if the editor is ready
      if (editorRef.current && editorRef.current.destroy && editorRef.current.isReady) {
        editorRef.current.isReady.then(() => {
           try { editorRef.current.destroy(); editorRef.current = null; } catch (e) {}
        });
      }
    };
  }, []); // Run once on mount

  return (
    <div 
      ref={holderRef} 
      className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none bg-surface border border-white/5 p-8 rounded-xl min-h-[600px]"
    />
  );
}
