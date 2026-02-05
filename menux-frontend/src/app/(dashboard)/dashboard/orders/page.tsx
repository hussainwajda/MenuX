// src/app/(dashboard)/dashboard/orders/page.tsx
'use client';

import { useState } from "react";
import { Search, Filter, Calendar, ChevronDown, Download, Eye } from "lucide-react";
import { MOCK_ORDERS } from "@/data/mockData";

// Extended mock data to simulate history (since MOCK_ORDERS only has recent ones)
const HISTORY_DATA = [
  ...MOCK_ORDERS.map(o => ({ ...o, date: "Today" })),
  {
    id: "ORD-9981",
    customer_name: "Amitabh Bachan",
    table_number: "4",
    items_count: 5,
    total_amount: 2450,
    status: "SERVED",
    created_at: "8:30 PM",
    date: "Yesterday"
  },
  {
    id: "ORD-9980",
    customer_name: "Rekha Ji",
    table_number: "2",
    items_count: 2,
    total_amount: 850,
    status: "CANCELLED",
    created_at: "7:15 PM",
    date: "Yesterday"
  },
  {
    id: "ORD-9855",
    customer_name: "Shahrukh Khan",
    table_number: "VIP",
    items_count: 12,
    total_amount: 15400,
    status: "SERVED",
    created_at: "9:00 PM",
    date: "2 Oct 2023"
  }
];

export default function OrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All Time");

  // Group orders by Date Key
  const groupedOrders = HISTORY_DATA.reduce((groups: any, order) => {
    const date = order.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(order);
    return groups;
  }, {});

  const statusColors: Record<string, string> = {
    SERVED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    PENDING: "bg-blue-100 text-blue-700",
    COOKING: "bg-orange-100 text-orange-700",
    READY: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-500 mt-1">View past orders and transactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600">
           <Download size={16} /> Export Report
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {/* Date Filter */}
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-orange-500 hover:text-orange-600 transition-colors">
              <Calendar size={16} /> {selectedDateFilter} <ChevronDown size={14} />
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:border-orange-500 hover:text-orange-600 transition-colors">
              <Filter size={16} /> Status
           </button>
        </div>
      </div>

      {/* Grouped Lists */}
      <div className="space-y-8">
        {Object.keys(groupedOrders).map((dateKey) => (
          <div key={dateKey}>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 pl-1">{dateKey}</h3>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groupedOrders[dateKey].map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800">{order.id}</span>
                        <div className="text-xs text-gray-400">{order.created_at}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{order.customer_name}</div>
                        <div className="text-xs text-gray-500">Table {order.table_number}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.items_count} Items
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">
                        ₹{order.total_amount || (order.items_count * 150)} {/* Fallback if mock data lacks total */}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}   