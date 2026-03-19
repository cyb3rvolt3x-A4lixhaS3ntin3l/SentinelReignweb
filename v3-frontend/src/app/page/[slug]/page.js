import Markdown from "@/components/ui/Markdown";
import { ArrowLeft, FileText, Lock } from "lucide-react";
import Link from "next/link";

async function getPage(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`}/api/public/pages/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.title,
  };
}

export default async function StaticPage({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-black uppercase mb-4">Node Offline</h1>
        <p className="text-gray-400 mb-8">This intelligence protocol has not been published to the matrix.</p>
        <Link href="/" className="text-accent underline uppercase font-bold text-sm tracking-widest">Return to Root</Link>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-24 min-h-[80vh]">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="space-y-12">
          
          <div className="space-y-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-3 h-3" /> System Root
            </Link>
            
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-accent">
                  <FileText className="w-6 h-6" />
               </div>
               <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
                 {page.title}
               </h1>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full w-fit">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Protocol Verified</span>
            </div>
          </div>

          <div className="glass-panel p-8 md:p-12 rounded-xl">
            <Markdown content={page.content} />
          </div>

          <div className="pt-12 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                <Lock className="w-3 h-3" /> SentinelReign Clearance Restricted
             </div>
             <div className="text-[10px] font-mono text-gray-700">
                REF: {page.slug?.toUpperCase()}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
