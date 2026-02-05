// src/components/dashboard/OrderQueue.tsx
'use client';

import { Order, OrderStatus } from "@/types"; // Ensure OrderStatus is imported or defined
import { Clock, ChevronRight, Printer, CheckCircle2, ArrowRightCircle } from "lucide-react";

interface OrderQueueCardProps {
  order: Order;
  onPrintKOT: () => void;
  onUpdateStatus: () => void;
}

export default function OrderQueueCard({ order, onPrintKOT, onUpdateStatus }: OrderQueueCardProps) {
  
  const statusColors: Record<string, string> = {
    PENDING: "text-blue-600 bg-blue-50 border-blue-100",
    ACCEPTED: "text-emerald-600 bg-emerald-50 border-emerald-100",
    COOKING: "text-orange-600 bg-orange-50 border-orange-100",
    READY: "text-purple-600 bg-purple-50 border-purple-100",
    SERVED: "text-gray-500 bg-gray-50 border-gray-100",
    CANCELLED: "text-red-600 bg-red-50 border-red-100",
  };

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border-2 transition-all ${statusColors[order.status] || 'border-gray-100'}`}>
      
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-gray-500 bg-white/50 px-2 py-1 rounded uppercase tracking-wider border border-gray-200">
            #{order.id}
          </span>
          <h3 className="font-bold text-gray-800 mt-2 text-lg truncate w-32">{order.customer_name}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> {order.created_at}
          </p>
        </div>
        <div className="bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-700">Table {order.table_number}</span>
        </div>
      </div>

      {/* Items Summary */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500">{order.items_count} items in this order</p>
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
           {/* Simple progress bar simulation based on status */}
           <div className={`h-full transition-all duration-500 ${
             order.status === 'PENDING' ? 'w-[10%] bg-blue-500' :
             order.status === 'COOKING' ? 'w-[50%] bg-orange-500' :
             order.status === 'READY' ? 'w-[80%] bg-purple-500' :
             order.status === 'SERVED' ? 'w-[100%] bg-green-500' : 'w-0'
           }`} />
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex gap-2 mt-auto">
        
        {/* Button 1: Print KOT */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent bubbling
            onPrintKOT();
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Printer size={14} /> KOT
        </button>

        {/* Button 2: Update Status */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onUpdateStatus();
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-gray-800 active:scale-95 transition-all"
        >
          {order.status === 'SERVED' ? 'Done' : 'Next'} 
          <ArrowRightCircle size={14} />
        </button>
      </div>

      {/* Current Status Badge */}
      <div className="mt-3 text-center">
         <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
           {order.status}
         </span>
      </div>
    </div>
  );
}