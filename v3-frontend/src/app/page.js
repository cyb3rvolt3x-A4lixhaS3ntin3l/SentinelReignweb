import ArticleGrid from "@/components/ui/ArticleGrid";
import { ArrowRight, Zap, Shield, Laptop, ChevronRight, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

export default async function HomePage() {
  const articles = await getArticles();
  const latestArticles = articles.slice(0, 3);
  const featuredArticle = articles[0];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-background">
        <div className="container-wide relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Software & Security Research
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                Advanced Systems <br />
                <span className="text-accent italic">Redefined.</span>
              </h1>
              <p className="text-gray-400 text-xl leading-relaxed max-w-xl">
                Deep-dive research into cybersecurity vectors, software architecture, and the future of autonomous technology systems.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  href="/articles" 
                  className="px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-accent/20 flex items-center gap-2 group"
                >
                  Explore Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/tutorials" 
                  className="px-8 py-4 bg-muted text-white font-bold rounded-xl hover:bg-surface transition-all border border-white/5"
                >
                  View Tutorials
                </Link>
              </div>
            </div>

            {featuredArticle && (
              <div className="relative group">
                <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full group-hover:bg-accent/30 transition-all animate-pulse-slow" />
                <div className="relative pro-card p-4 bg-surface/50 backdrop-blur-sm">
                  <div className="aspect-[16/9] relative rounded-lg overflow-hidden mb-6">
                    <Image 
                      src={featuredArticle.image_url || "/placeholder.jpg"} 
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <span className="text-accent text-[10px] font-bold uppercase tracking-widest">Featured Report</span>
                    <h2 className="text-2xl font-bold line-clamp-2">{featuredArticle.title}</h2>
                    <Link href={`/article/${featuredArticle.slug}`} className="text-sm font-bold flex items-center gap-2 text-white hover:text-accent transition-colors">
                      Read Spotlight <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-white/5 bg-surface/30">
        <div className="container-wide flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all">
          <span className="text-sm font-bold uppercase tracking-[0.3em]">Cybersecurity</span>
          <span className="text-sm font-bold uppercase tracking-[0.3em]">AI Engineering</span>
          <span className="text-sm font-bold uppercase tracking-[0.3em]">Cloud Infrastructure</span>
          <span className="text-sm font-bold uppercase tracking-[0.3em]">Threat Analysis</span>
        </div>
      </section>

      {/* Main Grid */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Latest Analysis</h2>
              <p className="text-gray-500 font-medium">Recently published software and security reports.</p>
            </div>
            <Link href="/articles" className="hidden md:flex items-center gap-2 text-sm font-bold text-accent hover:underline uppercase tracking-widest">
              Full Archive <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <ArticleGrid articles={articles} limit={6} />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="pro-card p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center space-y-8">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="w-20 h-20 bg-accent text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-accent/20">
              <Mail className="w-10 h-10" />
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight">
              Ready to Secure Your Knowledge Base?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl font-medium">
              Join 12,000+ technical professionals receiving our weekly newsletter on cybersecurity breakthroughs and software architectures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-4">
              <input 
                type="email" 
                placeholder="Work Email Address"
                className="flex-1 bg-background border border-white/10 px-6 py-4 rounded-xl text-white focus:outline-none focus:border-accent transition-colors font-medium"
              />
              <button className="px-10 py-4 bg-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-accent/20 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
