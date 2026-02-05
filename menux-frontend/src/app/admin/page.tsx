// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from "react";
import { 
  ShieldCheck, Database, Users, Activity, Search, 
  AlertTriangle, Server, Lock, Unlock, Eye, Trash2, RefreshCw, CheckCircle 
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

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
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

  // Fetch on mount and when tab changes to 'database'
  useEffect(() => {
    fetchLiveData();
  }, [activeTab]);

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

  // Sidebar Component
  const SidebarItem = ({ id, icon, label }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium mb-1 ${
        activeTab === id 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 z-50">
          <CheckCircle size={18} className="text-green-400" />
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col p-6">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">MenuX Admin</h1>
            <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">God Mode</p>
          </div>
        </div>

        <nav className="flex-1">
          <SidebarItem id="overview" icon={<Activity size={18} />} label="System Overview" />
          <SidebarItem id="tenants" icon={<Users size={18} />} label="Tenant Management" />
          <SidebarItem id="database" icon={<Database size={18} />} label="Database Explorer" />
          <SidebarItem id="logs" icon={<Server size={18} />} label="Server Logs" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <div className="flex items-center gap-3 px-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="text-xs">
              <p className="font-bold">Super User</p>
              <p className="text-slate-400">root@menux.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">System Health</h2>
               <button onClick={() => window.location.reload()} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><RefreshCw size={18}/></button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", val: "₹4.2M", color: "bg-green-50 text-green-700" },
                { label: "Active Tenants", val: tenants.filter(t => t.status === 'Active').length, color: "bg-blue-50 text-blue-700" },
                { label: "Live Orders", val: dbData["public.orders"].length, color: "bg-orange-50 text-orange-700" },
                { label: "Menu Items", val: dbData["public.menu_items"].length, color: "bg-purple-50 text-purple-700" },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-3xl font-black mt-2 ${stat.color.split(" ")[1]}`}>{stat.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden group cursor-default">
               <div className="absolute top-0 right-0 p-32 bg-indigo-600 blur-[100px] opacity-30 rounded-full group-hover:opacity-50 transition-opacity"></div>
               <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"/> 
                      All Systems Operational
                    </h3>
                    <p className="text-slate-400 mt-2 max-w-md text-sm">
                      Database latency: 24ms • AWS S3 Capacity: 45% • Security: Secure
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-mono font-thin text-indigo-400">99.99%</p>
                    <p className="text-xs text-slate-500 uppercase font-bold mt-1">Uptime</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* --- TENANT MANAGEMENT TAB (Interactive) --- */}
        {activeTab === "tenants" && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold">Restaurant Tenants</h2>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                 <input type="text" placeholder="Search tenants..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64" />
               </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                   <tr>
                     <th className="px-6 py-4">Restaurant</th>
                     <th className="px-6 py-4">Owner</th>
                     <th className="px-6 py-4">Plan</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {tenants.map((t) => (
                     <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors ${t.status === 'Suspended' ? 'bg-red-50/30' : ''}`}>
                       <td className="px-6 py-4 font-bold text-slate-800">{t.name}</td>
                       <td className="px-6 py-4 text-slate-500">{t.owner}</td>
                       <td className="px-6 py-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">{t.plan}</span></td>
                       <td className="px-6 py-4">
                         {t.status === "Active" 
                           ? <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-green-500"/> Active</span>
                           : <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs"><div className="w-1.5 h-1.5 rounded-full bg-red-500"/> Suspended</span>
                         }
                       </td>
                       <td className="px-6 py-4 text-right flex gap-2 justify-end">
                         <button 
                           onClick={() => toggleTenantStatus(t.id)}
                           title={t.status === "Active" ? "Suspend Tenant" : "Activate Tenant"}
                           className={`p-2 rounded transition-colors ${
                             t.status === "Active" 
                               ? "hover:bg-red-50 text-slate-400 hover:text-red-500" 
                               : "bg-green-50 text-green-600 hover:bg-green-100"
                           }`}
                         >
                           {t.status === "Active" ? <Unlock size={16} /> : <Lock size={16} />}
                         </button>

                         <button 
                           onClick={() => deleteTenant(t.id)}
                           title="Delete Tenant" 
                           className="p-2 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded"
                         >
                           <Trash2 size={16} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* --- DATABASE TAB (CONNECTED TO LIVE MOCK DATA) --- */}
        {activeTab === "database" && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-xl border border-yellow-200">
               <div className="flex items-center gap-3">
                 <AlertTriangle className="text-yellow-600" />
                 <div>
                   <h3 className="font-bold text-yellow-800 text-sm">Direct Database Access</h3>
                   <p className="text-yellow-700 text-xs">Viewing live data from application state and LocalStorage.</p>
                 </div>
               </div>
               <span className="text-xs font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Read-Write Mode</span>
             </div>

             <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
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
          </div>
        )}
      </main>
    </div>
  );
}