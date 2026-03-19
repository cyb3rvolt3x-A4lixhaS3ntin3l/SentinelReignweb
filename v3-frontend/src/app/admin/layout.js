import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex h-full min-h-screen bg-[#050505] text-foreground overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto custom-scroll p-8 md:p-12">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
