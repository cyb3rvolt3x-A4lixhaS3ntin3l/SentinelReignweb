"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Plus, 
  Trash2, 
  Search, 
  Upload, 
  Grid, 
  List, 
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Info,
  CheckCircle,
  X,
  Zap,
  Globe,
  Activity,
  User,
  Layout,
  ChevronRight,
  FileText,
  Shield,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_articles: 0,
    intelligence_nodes: 0,
    confidence_score: 0,
    subscribers: 0
  });
  const [recentArticles, setRecentArticles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };
        const [statsRes, articlesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/engine/stats`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cms/articles`, { headers })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            total_articles: statsData.total_articles || 0,
            intelligence_nodes: statsData.intelligence_nodes || 0,
            confidence_score: statsData.avg_confidence || 0,
            subscribers: statsData.subscribers || 0
          });
        }

        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          setRecentArticles(articlesData.data?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error("Dashboard sync failed", error);
      } finally {
        setIsLoading(false);
      }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/engine/logs?limit=5`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setLogs(await res.json());
    } catch (error) {
       console.error("Log fetch failed", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    { label: "Total Articles", value: stats.total_articles, icon: FileText, color: "text-blue-500", trend: "Live" },
    { label: "Intel Nodes", value: stats.intelligence_nodes, icon: Zap, color: "text-accent", trend: "Active" },
    { label: "Confidence Score", value: `${stats.confidence_score}%`, icon: Shield, color: "text-emerald-500", trend: "Verified" },
    { label: "Subscribers", value: stats.subscribers, icon: Users, color: "text-purple-500", trend: "Emails" }
  ];

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">System Overview</h1>
          <p className="text-gray-500 font-medium">Platform performance and automated intelligence metrics.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/admin/articles/new" className="bg-accent text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-accent/20">
              <Plus className="w-5 h-5" /> Draft New
           </Link>
        </div>
      </header>

      {/* Stats Cluster */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface border border-white/5 p-6 rounded-2xl group hover:border-accent/40 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Content Table */}
        <div className="xl:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">Recently Published</h3>
              <Link href="/admin/articles" className="text-xs font-bold text-accent hover:underline uppercase tracking-widest flex items-center gap-2">
                 View All Content <ChevronRight className="w-4 h-4" />
              </Link>
           </div>
           
           <div className="pro-card overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <tr>
                       <th className="px-8 py-4">Title</th>
                       <th className="px-8 py-4">Status</th>
                       <th className="px-8 py-4 text-right">Modified</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                     <td colSpan="3" className="p-10 text-center opacity-20">Synchronizing content assets...</td>
                  </tr>
                ) : recentArticles.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-10 text-center opacity-50">No recent articles found.</td>
                  </tr>
                ) : recentArticles.map((article, i) => (
                  <tr key={article.id || i} className="hover:bg-white/5 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-white">{article.title}</span>
                      <p className="text-[10px] text-gray-500 uppercase font-medium">
                        {article.category} • {new Date(article.created_at || article.published_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        Published
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-mono text-[10px] text-gray-400">
                      {new Date(article.created_at || article.published_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* AI Monitoring Hub */}
        <aside className="space-y-8">
           <div className="pro-card p-8 bg-accent shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)]">
              <div className="space-y-6 text-white">
                 <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Zap className="w-8 h-8 fill-current" />
                 </div>
                 <h3 className="text-3xl font-black leading-tight">Content Engine <br /> Autonomous.</h3>
                 <p className="text-sm font-bold opacity-80 leading-relaxed">
                    The autonomous research hive is currently crawling technical repositories. 
                 </p>
                 <button className="w-full py-4 bg-white text-accent font-black uppercase tracking-widest text-xs rounded-xl shadow-2xl hover:bg-gray-100 transition-all">
                     Generate New Article
                 </button>
              </div>
           </div>

           <div className="pro-card p-6 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-4">Live System Notifications</h4>
              <div className="space-y-6">
                 {logs.length === 0 ? (
                   <div className="text-xs text-gray-500 text-center py-4">Awaiting telemetry...</div>
                 ) : (
                   logs.map(log => (
                     <div key={log.id} className="flex gap-4 group">
                        <div className={cn("w-1 h-8 rounded-full transition-colors", 
                           log.status === "ERROR" || log.status === "CRITICAL" ? "bg-red-500" :
                           log.status === "WARNING" ? "bg-yellow-500" :
                           log.status === "SUCCESS" ? "bg-emerald-500" : "bg-accent"
                        )} />
                        <div>
                           <p className="text-xs font-bold text-white truncate max-w-[200px]">{log.action}</p>
                            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">
                               {log.details || `Agent: ${log.agent_name}`}
                            </p>
                            <p className="text-[8px] text-gray-600 mt-1 uppercase font-bold tracking-widest">
                               {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

