// src/app/admin/components/header.tsx
'use client';

import { useState } from 'react';
import { 
  Bell, 
  User, 
  Settings, 
  Menu,
  Search,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clearAdminAuth } from '@/lib/api-client';

export default function Header({ onRefresh }: { onRefresh?: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.clear();
    localStorage.clear();
    clearAdminAuth();
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search across admin panel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>

          {/* Notifications */}
          <Button variant="outline" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-sm">
              <div className="font-medium text-slate-900">Admin User</div>
              <div className="text-slate-500">admin@menux.com</div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
