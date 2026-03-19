import React from "react";

export const config = {
  components: {
    Hero: {
      fields: {
        title: { type: "text" },
        subtitle: { type: "text" },
      },
      defaultProps: {
        title: "SentinelReign Global Intelligence Matrix",
        subtitle: "Advanced threat vectors and strategic tech analysis.",
      },
      render: ({ title, subtitle }) => (
        <div className="py-32 px-10 bg-black text-center text-white border-b border-white/10">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">{title}</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>
      ),
    },
    Navbar: {
      fields: {
        logoText: { type: "text" },
        links: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            href: { type: "text" }
          }
        }
      },
      defaultProps: {
        logoText: "SENTINELREIGN",
        links: [
          { name: "Articles", href: "/articles" },
          { name: "Tutorials", href: "/tutorials" },
          { name: "About", href: "/page/about-us" }
        ]
      },
      render: ({ logoText }) => (
        <nav className="h-20 border-b border-white/10 flex items-center px-10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
           <div className="text-2xl font-black tracking-widest text-white">{logoText}</div>
        </nav>
      ),
    },
    Footer: {
      fields: {
        copyright: { type: "text" },
        links: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            links: {
              type: "array",
              arrayFields: {
                name: { type: "text" },
                href: { type: "text" }
              }
            }
          }
        }
      },
      defaultProps: {
        copyright: "© 2026 SentinelReign Network.",
        links: [
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
        ]
      },
      render: ({ copyright, links }) => (
        <footer className="py-12 bg-[#050505] text-center border-t border-white/5 text-xs text-gray-500 flex flex-col items-center">
           <div className="font-bold text-gray-600 uppercase tracking-widest mb-4">{copyright}</div>
           <div className="flex gap-10">
              {links?.map(col => (
                 <div key={col.title} className="text-left space-y-2">
                    <h5 className="font-bold text-white uppercase">{col.title}</h5>
                    {col.links?.map(link => (
                       <div key={link.name} className="hover:text-accent transition-colors cursor-pointer">{link.name}</div>
                    ))}
                 </div>
              ))}
           </div>
        </footer>
      ),
    }
  },
};
