// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import { 
  ShieldCheck, Database, Users, Activity, Search, 
  AlertTriangle, Server, Lock, Unlock, Eye, Trash2, RefreshCw, CheckCircle 
} from "lucide-react";
// Import the actual Menu Data used in the app
import { MOCK_MENU_ITEMS } from "@/data/mockData";
import AdminLogin from "@/components/auth/AdminLogin";
import { useSessionStore } from "@/store/useSessionStore";

// --- INITIAL TENANT DATA (Since we don't have a backend for tenants yet, this acts as the "source") ---
const INITIAL_TENANTS = [
  { id: "rest_01", name: "Webblers Bistro", owner: "Rohan Sharma", plan: "PRO", status: "Active", revenue: "₹45,000" },
  { id: "rest_02", name: "Spice Garden", owner: "Priya Verma", plan: "FREE", status: "Active", revenue: "₹12,400" },
  { id: "rest_03", name: "Burger King Clone", owner: "Amit Kumar", plan: "ENTERPRISE", status: "Suspended", revenue: "₹1,20,000" },
  { id: "rest_04", name: "Chai Point", owner: "Rahul Dravid", plan: "PRO", status: "Active", revenue: "₹85,000" },
];

export default function DashboardPage() {
  // --- INTERACTIVE STATE ---
  const [tenants, setTenants] = useState(INITIAL_TENANTS);
  
  // Initialize DB with Menu Items immediately
  const [dbData, setDbData] = useState<any>({
    "public.menu_items": MOCK_MENU_ITEMS,
    "public.orders": [], // Will be filled from LocalStorage
    "public.tenants": INITIAL_TENANTS
  });

  const [selectedTable, setSelectedTable] = useState("public.orders");
  const [queryLoading, setQueryLoading] = useState(false);
  const [lastQueryTime, setLastQueryTime] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // --- FETCH LIVE DATA (Orders from LocalStorage) ---
  const fetchLiveData = () => {
    // 1. Get Orders from LocalStorage
    const storedOrders = localStorage.getItem("simulated_orders");
    const liveOrders = storedOrders ? JSON.parse(storedOrders) : [];

    // 2. Update the DB State
    setDbData((prev: any) => ({
      ...prev,
      "public.orders": liveOrders,
      "public.menu_items": MOCK_MENU_ITEMS, // Ensure this is always up to date
      "public.tenants": tenants
    }));
  };

  // Fetch on mount
  useEffect(() => {
    fetchLiveData();
  }, []);

  // Helper to show temporary success messages
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- ACTION: TOGGLE TENANT STATUS ---
  const toggleTenantStatus = (id: string) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === "Active" ? "Suspended" : "Active";
        showNotification(`${t.name} is now ${newStatus}`);
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  // --- ACTION: DELETE TENANT ---
  const deleteTenant = (id: string) => {
    if (confirm("Are you sure? This will wipe all restaurant data.")) {
      setTenants(prev => prev.filter(t => t.id !== id));
      showNotification("Tenant deleted successfully");
    }
  };

  // --- ACTION: RUN DB QUERY ---
  const handleRunQuery = () => {
    setQueryLoading(true);
    // Simulate network query time
    setTimeout(() => {
      fetchLiveData(); // Fetch the latest data from LocalStorage
      setQueryLoading(false);
      setLastQueryTime(Date.now());
      showNotification(`Query executed successfully on ${selectedTable}`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome to the MenuX administration panel</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", val: "₹4.2M", color: "bg-green-50 text-green-700", icon: "💰" },
          { label: "Active Restaurants", val: tenants.filter(t => t.status === 'Active').length, color: "bg-blue-50 text-blue-700", icon: "🏪" },
          { label: "Live Orders", val: dbData["public.orders"].length, color: "bg-orange-50 text-orange-700", icon: "📦" },
          { label: "Menu Items", val: dbData["public.menu_items"].length, color: "bg-purple-50 text-purple-700", icon: "📋" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold mt-2 ${stat.color.split(" ")[1]}`}>{stat.val}</p>
              </div>
              <div className="text-4xl opacity-50">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"/> 
              System Status: Operational
            </h3>
            <p className="text-indigo-100 mt-2 max-w-md text-sm">
              All systems are running smoothly. Database latency: 24ms • AWS S3 Capacity: 45% • Security: Secure
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono font-thin">99.99%</p>
            <p className="text-indigo-200 text-xs uppercase font-bold mt-1">Uptime</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Restaurant Management</h3>
          <div className="space-y-3">
            <a href="/admin/restaurants" className="block p-3 hover:bg-slate-50 rounded-lg border border-slate-100">
              View All Restaurants
            </a>
            <a href="/admin/restaurants/create" className="block p-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-100 font-medium">
              Add New Restaurant
            </a>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Explorer</h3>
          <div className="space-y-3">
            <a href="/admin/database" className="block p-3 hover:bg-slate-50 rounded-lg border border-slate-100">
              View Database Tables
            </a>
            <button 
              onClick={handleRunQuery}
              disabled={queryLoading}
              className="w-full p-3 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg border border-green-100 font-medium disabled:opacity-50"
            >
              {queryLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Server Logs</h3>
          <div className="space-y-3">
            <a href="/admin/logs" className="block p-3 hover:bg-slate-50 rounded-lg border border-slate-100">
              View Server Logs
            </a>
            <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-100 text-sm">
              System monitoring active
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle size={18} className="text-green-400" />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}
    </div>
  );
}