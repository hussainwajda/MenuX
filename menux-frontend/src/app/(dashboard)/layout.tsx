// src/app/(dashboard)/layout.tsx
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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