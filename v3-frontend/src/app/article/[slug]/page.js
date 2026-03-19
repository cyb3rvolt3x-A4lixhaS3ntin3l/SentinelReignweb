import React from "react";
import Image from "next/image";
import Markdown from "@/components/ui/Markdown";
import { 
  User, 
  Calendar, 
  Clock, 
  Share2, 
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import FallbackThumbnail from "@/components/ui/FallbackThumbnail";
import GenreWrapper from "@/components/ui/GenreWrapper";

async function getArticle(slug) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/articles/${slug}`;
  console.log(`[Frontend] Fetching article detail: ${slug} from ${apiUrl}`);
  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    console.log(`[Frontend] Article Detail status: ${res.status}`);
    if (!res.ok) return null;
    const data = await res.json();
    console.log(`[Frontend] Successfully loaded data for: ${data.title}`);
    return data;
  } catch (e) {
    console.error(`[Frontend] Error fetching article detail [${slug}]: ${e.message}`);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };
  
  return {
    title: `${article.title} | SentinelReign`,
    description: article.summary,
    openGraph: {
      images: [article.image_url],
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-6">
        <h1 className="text-4xl font-black uppercase text-white">Research Piece Not Found</h1>
        <p className="text-gray-500">The requested intelligence report may have been retracted or moved.</p>
        <Link href="/articles" className="text-accent font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
           <ChevronLeft className="w-4 h-4" /> Back to Archives
        </Link>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["NewsArticle", "TechArticle", "Article"],
        "headline": article.title,
        "description": article.summary,
        "image": [article.image_url || "https://sentinelreign.com/default.jpg"],
        "datePublished": article.published_at,
        "dateModified": article.updated_at || article.published_at,
        "author": {
          "@type": "Person",
          "name": article.author?.name || article.author_name || "Syed Abrar",
          "url": article.author?.url || "https://sentinelreign.com/author-syed-abrar.html",
        },
        "publisher": {
          "@type": "Organization",
          "name": "SentinelReign",
          "logo": {
            "@type": "ImageObject",
            "url": "https://sentinelreign.com/logo.png"
          }
        }
      }
    ]
  };

  return (
    <GenreWrapper category={article.category}>
      <article className="pb-32 pt-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Article Header */}
        <div className="relative h-[60vh] min-h-[500px] w-full mb-16 overflow-hidden rounded-b-[40px] shadow-2xl">
          {article.image_url ? (
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <FallbackThumbnail title={article.title} category={article.category} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent pointer-events-none" />
          
          <div className="absolute bottom-0 left-0 right-0 pb-16 pointer-events-none">
            <div className="container-wide">
              <div className="max-w-4xl space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                   {article.category || "General"}
                 </div>
                 <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-lg">
                   {article.title}
                 </h1>
                 <div className="flex flex-wrap items-center gap-8 text-[11px] font-bold text-gray-300 uppercase tracking-widest drop-shadow">
                   <span className="flex items-center gap-2"><User className="w-4 h-4 text-accent" /> {article.author_name || "Sentinel"}</span>
                   <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> {new Date(article.published_at).toLocaleDateString()}</span>
                   <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> 8 min read</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              <div className="pro-card p-8 md:p-12 relative z-10">
                 <Markdown content={article.content} />
              </div>

              <div className="pt-12 border-t border-white/5 flex flex-wrap gap-3">
                 {["Cybersecurity", "Research", "Analysis", "Deep Tech"].map(tag => (
                   <span key={tag} className="px-4 py-2 bg-muted/50 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/5 hover:border-accent hover:text-accent transition-colors cursor-default">
                     {tag}
                   </span>
                 ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-10">
               <div className="pro-card p-8 space-y-6 sticky top-32 z-10">
                  <h3 className="text-lg font-bold uppercase tracking-tight border-b border-inherit pb-4 flex items-center gap-2">
                     <Share2 className="w-5 h-5 text-accent" /> Share Article
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <button className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg border border-inherit hover:bg-accent hover:text-white transition-all font-bold text-xs shadow-none">
                        TWITTER
                     </button>
                     <button className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg border border-inherit hover:bg-accent hover:text-white transition-all font-bold text-xs shadow-none">
                        LINKEDIN
                     </button>
                  </div>
                  
                  <div className="pt-6 space-y-4">
                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">About the Author</h4>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-black">S</div>
                        <div>
                           <p className="text-sm font-bold">Sentinel Engine</p>
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none pt-1">Lead Strategist</p>
                        </div>
                     </div>
                     <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Reporting on emerging technology vectors and advanced software architectures.
                     </p>
                  </div>
               </div>
            </aside>
          </div>
        </div>
      </article>
    </GenreWrapper>
  );
}
