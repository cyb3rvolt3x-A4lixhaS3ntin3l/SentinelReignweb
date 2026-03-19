"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for JWT token in localStorage
    const token = localStorage.getItem("sentinel_token");

    if (!token) {
      // Not logged in, redirect to login page
      setAuthorized(false);
      router.push("/login?callback=" + pathname);
    } else {
      // Basic check if token exists (backend will verify the actual JWT validity)
      setAuthorized(true);
    }
    setLoading(false);
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return authorized ? children : null;
}
