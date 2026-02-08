// src/app/admin/components/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Database, 
  Server, 
  Menu, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Restaurants',
    href: '/admin/restaurants',
    icon: Building2,
  },
  {
    name: 'Database',
    href: '/admin/database-explorer',
    icon: Database,
  },
  {
    name: 'Server Logs',
    href: '/admin/server-logs',
    icon: Server,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <ShieldCheck className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">MenuX Admin</h1>
          <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${
                isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-6 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
            <Menu className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xs">
            <p className="font-bold">Admin User</p>
            <p className="text-slate-400">admin@menux.com</p>
          </div>
          <button className="ml-auto p-1 hover:bg-slate-100 rounded">
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}