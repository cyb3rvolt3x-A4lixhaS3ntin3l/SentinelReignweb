import ArticleGrid from "@/components/ui/ArticleGrid";
import { ArrowLeft, Cpu } from "lucide-react";
import Link from "next/link";

async function getArticles() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/articles`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    return [];
  }
}

export const metadata = {
  title: "Intelligence Labs | Technical Tutorials",
  description: "Advanced technical tutorials on cybersecurity, exploit development, and emerging technologies provided by the SentinelReign Intelligence Lab.",
};

export default async function TutorialsHub() {
  const articles = await getArticles();
  const tutorials = articles.filter(a => (a.category || "").toLowerCase().includes("tutorial"));

  return (
    <div className="pb-32 pt-16">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-12">
           <div className="space-y-4">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-accent text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Matrix
              </Link>
              <div className="flex items-center gap-3">
                 <Cpu className="w-8 h-8 text-accent" />
                 <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                   Intelligence Labs
                 </h1>
              </div>
              <p className="text-gray-400 max-w-2xl font-medium">
                Step-by-step technical guides and deep-dive tutorials on advanced computational systems and security vectors.
              </p>
           </div>
        </div>

        {tutorials.length > 0 ? (
          <ArticleGrid articles={tutorials} limit={50} />
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-lg">
             <h2 className="text-2xl font-bold uppercase mb-2">No Tutorials Active</h2>
             <p className="text-gray-500">The intelligence lab is currently processing new instructional nodes.</p>
          </div>
        )}

      </div>
    </div>
  );
}
