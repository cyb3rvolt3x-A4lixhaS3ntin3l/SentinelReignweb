"use client";

import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, ArrowUpRight, ShieldCheck } from "lucide-react";



export default function Footer({ copyright = `© ${new Date().getFullYear()} SentinelReign Media Group. All Rights Reserved.`, links = null }) {
  const displayLinks = links || [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/page/about-us" },
        { name: "Contact", href: "/newsletter" },
        { name: "Newsroom", href: "/articles" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Articles", href: "/articles" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "Privacy Policy", href: "/page/privacy-policy" },
        { name: "Terms of Service", href: "/page/terms-and-services" },
      ],
    },
    {
      title: "Tech",
      links: [
        { name: "Cybersecurity", href: "/category/cybersecurity" },
        { name: "Software Dev", href: "/category/software-development" },
        { name: "Artificial Intelligence", href: "/category/artificial-intelligence" },
      ],
    },
  ];
  return (
    <footer className="bg-surface border-t border-white/5 pt-20 pb-10 mt-32">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">
          
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black text-xl">
                 SR
               </div>
               <span className="text-2xl font-black tracking-tight text-white uppercase">
                 Sentinel<span className="text-accent">Reign</span>
               </span>
            </div>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed font-medium">
              Professional software intelligence and cybersecurity research. Building the future of autonomous content delivery.
            </p>
            <div className="flex items-center gap-5">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <Link key={i} href="#" className="p-3 bg-muted rounded-full border border-white/5 hover:border-accent hover:text-accent transition-all text-gray-400">
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
             {displayLinks.map((section) => (
               <div key={section.title} className="space-y-6">
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">{section.title}</h4>
                 <ul className="space-y-4">
                   {section.links.map((link) => (
                     <li key={link.name}>
                       <Link href={link.href} className="text-sm text-gray-500 hover:text-accent transition-colors flex items-center gap-1 group font-medium">
                         {link.name}
                         <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                       </Link>
                     </li>
                   ))}
                 </ul>
               </div>
             ))}
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
           <p>{copyright}</p>
           <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 Status: Online
              </span>
              <span className="flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" />
                 Verified Secure
              </span>
           </div>
        </div>
      </div>
    </footer>
  );
}
