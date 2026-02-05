// src/components/dashboard/KOTModal.tsx
'use client';

import { KOT } from "@/types";
import { Printer, X } from "lucide-react";

export default function KOTModal({ kot, onClose }: { kot: KOT; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="font-bold">Kitchen Order Ticket</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {/* Ticket Content */}
        <div className="p-6 font-mono text-sm text-gray-800">
          <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
            <h3 className="text-lg font-bold uppercase">Webblers Bistro</h3>
            <p>Table: <span className="text-xl">{kot.table_number}</span></p>
            <p>ID: #{kot.order_id}</p>
            <p>{kot.timestamp}</p>
          </div>

          <table className="w-full mb-4">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-2">QTY</th>
                <th className="py-2">ITEM</th>
              </tr>
            </thead>
            <tbody>
              {kot.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="py-2 align-top font-bold">{item.quantity} x</td>
                  <td className="py-2">
                    <div>{item.name}</div>
                    {item.variant && <div className="text-[10px] text-gray-500 italic">[{item.variant}]</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-center text-[10px] text-gray-400 mt-8">
            *** End of KOT ***
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 flex gap-2">
          <button 
            onClick={() => window.print()} 
            className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors"
          >
            <Printer size={18} /> Print KOT
          </button>
        </div>
      </div>
    </div>
  );
}