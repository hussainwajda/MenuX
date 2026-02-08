// src/app/(dashboard)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoggedIn = useRestaurantSessionStore((s) => s.isLoggedIn);
  const isAuthRoute = pathname === "/dashboard";

  if (isAuthRoute && !isLoggedIn) {
    return <div className="min-h-screen bg-[#0e0b0a]">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full bg-[#1a1614] overflow-hidden">
      {/* Fixed Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area - This is where your dashboard page appears */}
      <main className="flex-1 my-2 mr-2 rounded-[2.5rem] bg-[#f8f9fa] overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
