"use client"
// src/app/admin/layout.tsx
import Sidebar from './components/sidebar';
import Header from './components/header';
import AdminLogin from '@/components/auth/AdminLogin';
import { hasAdminAuth } from '@/lib/api-client';
import { useSessionStore } from '@/store/useSessionStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = useSessionStore((s) => s.isLoggedIn) || hasAdminAuth();

  if (!isLoggedIn) {
    return <AdminLogin />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
