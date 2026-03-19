"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Layout, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Zap, 
  Activity,
  LogOut,
  ChevronRight,
  User,
  ExternalLink,
  ChevronLeft,
  BookOpen // Added BookOpen icon
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuGroups = [ // Renamed from menuItems to menuGroups
  {
    title: "Content Management",
    items: [
      { name: "Dashboard", href: "/admin", icon: Layout },
      { name: "Articles", href: "/admin/articles", icon: FileText },
      { name: "Media", href: "/admin/media", icon: ImageIcon },
      { name: "Static Pages", href: "/admin/pages", icon: BookOpen },
    ]
  },
  {
    title: "System Settings",
    items: [
      { name: "AI Tools", href: "/admin/ai-tools", icon: Zap },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ]
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen sticky top-0 left-0 bg-surface border-r border-white/5 transition-all duration-500 z-[100] group flex-shrink-0",
      collapsed ? "w-24" : "w-72"
    )}>
      {/* Brand Header */}
      <div className="h-24 flex items-center px-6 border-b border-white/5 bg-background/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-accent/20 flex-shrink-0">
            SR
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none">CMS v3.5</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Management Hub</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Matrix */}
      <nav className="p-6 space-y-10 h-[calc(100vh-160px)] overflow-y-auto custom-scroll">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            {!collapsed && (
              <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] px-3">
                {group.title}
              </h4>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all relative group/item",
                      isActive 
                        ? "bg-accent/10 text-accent shadow-sm" 
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 transition-transform group-hover/item:scale-110", isActive ? "text-accent" : "text-gray-400")} />
                    {!collapsed && <span className="text-sm">{item.name}</span>}
                    {isActive && !collapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5 bg-background/30 backdrop-blur-sm">
        <div className="flex items-center justify-between">
           <button 
             onClick={() => setCollapsed(!collapsed)}
             className="p-2 bg-muted rounded-lg text-gray-500 hover:text-white transition-colors border border-white/5"
           >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
           </button>
           {!collapsed && (
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center">
                   <User className="w-4 h-4 text-accent" />
                </div>
                <button className="text-gray-500 hover:text-red-500 transition-colors">
                   <LogOut className="w-4 h-4" />
                </button>
             </div>
           )}
        </div>
      </div>
    </aside>
  );
}
