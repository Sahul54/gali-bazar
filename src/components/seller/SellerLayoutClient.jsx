
"use client";

import { useState } from "react";
import SellerSidebar from "@/components/seller/SellerSidebar";
import SellerHeader from "@/components/seller/SellerHeader";

export default function SellerLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="min-h-screen lg:pl-[260px]">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
