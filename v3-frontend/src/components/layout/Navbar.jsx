"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  X, 
  ChevronRight,
  Layout,
  BookOpen,
  Mail,
  Zap,
  Search,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const defaultNavLinks = [
  { name: "Articles", href: "/articles", icon: Layout },
  { name: "Tutorials", href: "/tutorials", icon: BookOpen },
  { name: "About", href: "/page/about-us", icon: Zap },
  { name: "Newsletter", href: "/newsletter", icon: Mail },
];

export default function Navbar({ logoText = "SENTINELREIGN", links = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/search?q=${searchQuery}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.results || []);
          }
        } catch (e) {
          console.error("Search failed");
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "py-4 bg-background/80 backdrop-blur-xl border-b border-white/5" : "py-8 bg-transparent"
      )}>
        <div className="container-wide flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
               SR
             </div>
             <div className="hidden md:block">
                <span className="text-xl font-black tracking-tighter block leading-none">{logoText}<span className="text-accent italic"></span></span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5 block">Tech Intel Matrix</span>
             </div>
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {(links || defaultNavLinks).map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-accent transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsOpen(true)}
              className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-accent/10 hover:border-accent/40 transition-all text-gray-400 hover:text-accent group"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            
            <Link 
              href="/newsletter"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-accent/20"
            >
              Access Feed
            </Link>

            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl p-6 md:p-20"
          >
            <div className="max-w-4xl mx-auto space-y-12">
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Neural Intelligence Retrieval</span>
                  <button 
                    onClick={() => { setIsOpen(false); setSearchQuery(""); }}
                    className="p-3 bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
               </div>
               
               <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                  <div className="relative flex items-center bg-surface border border-white/10 rounded-2xl px-8 shadow-2xl">
                     <Search className="w-8 h-8 text-accent" />
                     <input 
                       autoFocus
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Synthesize search query..."
                       className="w-full bg-transparent py-8 px-8 text-2xl md:text-4xl font-black text-white focus:outline-none placeholder:opacity-20"
                     />
                     {isSearching && <Loader2 className="w-8 h-8 animate-spin text-accent" />}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto custom-scroll pr-4">
                  {searchResults.map((result, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={i}
                    >
                      <Link 
                        href={result.url}
                        onClick={() => setIsOpen(false)}
                        className="block p-6 bg-surface border border-white/5 rounded-xl hover:border-accent/40 group transition-all"
                      >
                         <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{result.type}</p>
                         <h4 className="text-lg font-bold text-white group-hover:text-accent transition-colors truncate">{result.title}</h4>
                         <p className="text-xs text-gray-500 mt-2 line-clamp-2">{result.summary}</p>
                      </Link>
                    </motion.div>
                  ))}
                  {searchQuery.length > 1 && searchResults.length === 0 && !isSearching && (
                    <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                       <Zap className="w-12 h-12 mx-auto" />
                       <p className="text-sm font-black uppercase tracking-widest">No matching intelligence nodes found.</p>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-6 right-6 z-50 bg-surface border border-white/5 p-8 rounded-2xl shadow-2xl lg:hidden"
          >
            <div className="space-y-8">
              {(links || defaultNavLinks).map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="flex items-center justify-between text-xl font-black uppercase tracking-tighter hover:text-accent"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 text-accent rounded-xl">
                       {link.icon ? <link.icon className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    {link.name}
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-20" />
                </Link>
              ))}
              <div className="pt-6 border-t border-white/5">
                <Link 
                  href="/admin" 
                  className="block w-full py-5 bg-accent text-white text-center font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-accent/20"
                >
                  Initialize Intelligence Access
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
