// src/app/admin/database_explorer/page.tsx
'use client';

import { useState, useEffect } from "react";
import { 
  Database, Search, AlertTriangle, RefreshCw, CheckCircle 
} from "lucide-react";
// Import the actual Menu Data used in the app
import { MOCK_MENU_ITEMS } from "@/data/mockData";

// --- INITIAL TENANT DATA (Since we don't have a backend for tenants yet, this acts as the "source") ---
const INITIAL_TENANTS = [
  { id: "rest_01", name: "Webblers Bistro", owner: "Rohan Sharma", plan: "PRO", status: "Active", revenue: "₹45,000" },
  { id: "rest_02", name: "Spice Garden", owner: "Priya Verma", plan: "FREE", status: "Active", revenue: "₹12,400" },
  { id: "rest_03", name: "Burger King Clone", owner: "Amit Kumar", plan: "ENTERPRISE", status: "Suspended", revenue: "₹1,20,000" },
  { id: "rest_04", name: "Chai Point", owner: "Rahul Dravid", plan: "PRO", status: "Active", revenue: "₹85,000" },
];

export default function DatabaseExplorerPage() {
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
      "public.tenants": INITIAL_TENANTS
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
          <h1 className="text-3xl font-bold text-slate-900">Database Explorer</h1>
          <p className="text-slate-600 mt-1">Direct database access and management</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRunQuery} disabled={queryLoading} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <RefreshCw size={20} className={queryLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-yellow-600" />
          <div>
            <h3 className="font-bold text-yellow-800 text-sm">Direct Database Access</h3>
            <p className="text-yellow-700 text-xs">Viewing live data from application state and LocalStorage.</p>
          </div>
          <span className="ml-auto text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Read-Write Mode</span>
        </div>
      </div>

      {/* Database Viewer */}
      <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        {/* DB Header */}
        <div className="bg-slate-800 p-3 flex items-center gap-4 border-b border-slate-700">
          <span className="text-slate-400 text-xs font-mono">SELECT * FROM</span>
          <select 
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="bg-slate-900 text-green-400 font-mono text-sm border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="public.orders">public.orders</option>
            <option value="public.menu_items">public.menu_items</option>
            <option value="public.tenants">public.tenants</option>
          </select>
          
          <button 
            onClick={handleRunQuery}
            disabled={queryLoading}
            className="ml-auto bg-indigo-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {queryLoading ? <RefreshCw size={12} className="animate-spin"/> : "RUN QUERY"}
          </button>
        </div>

        {/* DB Result View */}
        <div className="p-0 overflow-auto flex-1 bg-[#0d1117]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 text-slate-300 font-mono text-xs sticky top-0">
              <tr>
                {dbData[selectedTable]?.length > 0 ? Object.keys(dbData[selectedTable][0]).map((head) => (
                  <th key={head} className="px-4 py-3 border-r border-slate-700 whitespace-nowrap">{head}</th>
                )) : <th className="px-4 py-3">result</th>}
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-slate-400">
              {queryLoading ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-600">Executing query...</td></tr>
              ) : (
                 dbData[selectedTable]?.length > 0 ? (
                     dbData[selectedTable].map((row: any, idx: number) => (
                         <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                            {Object.values(row).map((val: any, i) => (
                              <td key={i} className="px-4 py-2 border-r border-slate-800 border-b border-slate-800/50 max-w-[200px] truncate">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                         </tr>
                       ))
                 ) : (
                     <tr><td className="p-8 text-center text-slate-600">No records found in this table.</td></tr>
                 )
              )}
            </tbody>
          </table>
        </div>
        
        {/* DB Footer */}
        <div className="bg-slate-800 p-2 px-4 text-[10px] text-slate-500 font-mono flex justify-between border-t border-slate-700">
          <span>{dbData[selectedTable]?.length || 0} rows returned</span>
          <span>Last query: {lastQueryTime ? `${(Date.now() - lastQueryTime)}ms ago` : "Waiting..."}</span>
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