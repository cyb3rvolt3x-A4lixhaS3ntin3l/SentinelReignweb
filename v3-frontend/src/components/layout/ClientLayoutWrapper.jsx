"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [layoutData, setLayoutData] = useState(null);

  useEffect(() => {
    if (isAdmin) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/cms/layout`)
      .then(res => res.json())
      .then(data => {
         if (data && data.content) setLayoutData(data);
      })
      .catch(console.error);
  }, [isAdmin]);

  const navbarProps = layoutData?.content?.find(c => c.type === 'Navbar')?.props || {};
  const footerProps = layoutData?.content?.find(c => c.type === 'Footer')?.props || {};

  return (
    <>
      {!isAdmin && <Navbar {...navbarProps} />}
      <main className={!isAdmin ? "flex-1 relative z-10 pt-20" : "flex-1 relative z-10"}>
        {children}
      </main>
      {!isAdmin && <Footer {...footerProps} />}
    </>
  );
}
