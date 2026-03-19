export const dynamic = "force-dynamic";

import ArticleGrid from "@/components/ui/ArticleGrid";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";

async function getArticles() {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/articles`;
  console.log(`[Frontend] Fetching articles archive from: ${apiUrl}`);
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    console.log(`[Frontend] Articles response status: ${res.status}`);
    if (!res.ok) return [];
    const json = await res.json();
    console.log(`[Frontend] Successfully loaded ${json.data?.length || 0} articles`);
    return json.data || [];
  } catch (error) {
    console.error(`[Frontend] Error fetching articles: ${error.message}`);
    return [];
  }
}

export const metadata = {
  title: "Research Archives | SentinelReign",
  description: "Explore the complete archives of technical research papers and threat analysis reported by SentinelReign.",
};

export default async function ArticlesHub() {
  const articles = await getArticles();

  return (
    <div className="pb-32 pt-16">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-12">
           <div className="space-y-4">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Home
              </Link>
              <div className="flex items-center gap-3">
                 <FileText className="w-8 h-8 text-accent" />
                 <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                   Research Archives
                 </h1>
              </div>
              <p className="text-gray-400 max-w-2xl font-medium">
                Comprehensive repository of all research reports synced to the platform. Categorized by sector and impact level.
              </p>
           </div>
        </div>

        <ArticleGrid articles={articles} limit={50} />

      </div>
    </div>
  );
}
