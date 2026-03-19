import React from "react";

export default function FallbackThumbnail({ title, category }) {
  // Generate a deterministic pseudo-random gradient based on the title length
  const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return hash;
  };

  const colors = [
    "from-blue-900 via-indigo-900 to-slate-900",
    "from-emerald-900 via-teal-900 to-slate-900",
    "from-purple-900 via-fuchsia-900 to-slate-900",
    "from-rose-900 via-red-900 to-slate-900",
    "from-amber-900 via-orange-900 to-slate-900",
  ];

  const colorIndex = Math.abs(hashString(title || "Fallback")) % colors.length;
  const gradient = colors[colorIndex];

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} p-8 flex flex-col justify-end relative overflow-hidden group`}>
       {/* Code Pattern Background */}
       <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjI1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] mix-blend-overlay" />
       
       <div className="relative z-10 space-y-4">
          <span className="inline-block px-3 py-1 bg-black/40 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white rounded border border-white/10">
            {category || "Intelligence"}
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight shadow-sm drop-shadow-2xl">
            {title}
          </h2>
       </div>
       
       <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
          <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
             <circle cx="50" cy="50" r="40" strokeDasharray="4 4"/>
             <circle cx="50" cy="50" r="30" strokeDasharray="2 6"/>
             <circle cx="50" cy="50" r="20" strokeDasharray="8 8"/>
          </svg>
       </div>
    </div>
  );
}
