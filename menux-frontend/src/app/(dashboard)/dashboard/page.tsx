// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useState, useEffect } from "react";
import { MOCK_ORDERS, MOCK_MENU_ITEMS } from "@/data/mockData"; // Changed Import to MOCK_MENU_ITEMS
import ProductCard from "@/components/dashboard/ProductList"; // Ensure this matches your file name
import OrderQueueCard from "@/components/dashboard/OrderQueue";
import KOTModal from "@/components/dashboard/KOTModal"; 
import { Search, Bell } from "lucide-react";
import { Order, KOT, OrderStatus } from "@/types";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedKOT, setSelectedKOT] = useState<KOT | null>(null);

  // --- LISTENER FOR LIVE ORDERS ---
  useEffect(() => {
    const checkOrders = () => {
      const simulatedData = localStorage.getItem("simulated_orders");
      if (simulatedData) {
        const newOrders = JSON.parse(simulatedData);
        
        setOrders(prevOrders => {
           // Merge new LocalStorage data with current State
           // We place 'prevOrders' FIRST here so that if we just updated a status 
           // in the UI, we prioritize that over the old 'newOrders' data momentarily
           const combined = [...prevOrders, ...newOrders];
           
           // Deduplicate based on ID
           const unique = combined.filter((order, index, self) =>
              index === self.findIndex((t) => (
                t.id === order.id
              ))
           );
           // Sort by creation time (optional, keeps new orders at top)
           // return unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           return unique;
        });
      }
    };

    checkOrders();
    window.addEventListener("storage", checkOrders);
    const interval = setInterval(checkOrders, 2000); // Polling every 2s

    return () => {
      window.removeEventListener("storage", checkOrders);
      clearInterval(interval);
    };
  }, []);

  // --- KOT MODAL LOGIC ---
  const handleViewKOT = (order: Order) => {
    // Check if the order has real items (from customer side) or fallback to dummy
    const orderItems = (order as any).items || [
        { name: "Fiery Jalapeno Pizza", variant: "Medium", quantity: 1, note: "Extra spicy" },
        { name: "Chicken Dominator", variant: "Large", quantity: 1 },
        { name: "Coke", quantity: order.items_count - 2 },
    ];

    const kotData: KOT = {
      order_id: order.id,
      table_number: order.table_number,
      timestamp: order.created_at,
      items: orderItems
    };
    setSelectedKOT(kotData);
  };

  // --- STATUS UPDATE LOGIC ---
  const handleStatusUpdate = (orderId: string) => {
    const statusSequence: OrderStatus[] = ['PENDING', 'ACCEPTED', 'COOKING', 'READY', 'SERVED'];

    setOrders(currentOrders => {
      // 1. Calculate the New State
      const updatedOrders = currentOrders.map(order => {
        if (order.id === orderId) {
          const currentIndex = statusSequence.indexOf(order.status);
          const nextStatus = currentIndex < statusSequence.length - 1 
            ? statusSequence[currentIndex + 1] 
            : order.status;
          
          return { ...order, status: nextStatus };
        }
        return order;
      });

      // 2. CRITICAL: Update LocalStorage so the polling doesn't revert it
      const simulatedData = localStorage.getItem("simulated_orders");
      if (simulatedData) {
        let storedOrders = JSON.parse(simulatedData);
        const orderIndex = storedOrders.findIndex((o: Order) => o.id === orderId);

        if (orderIndex !== -1) {
          // Find the updated status from our calculation above
          const updatedOrder = updatedOrders.find(o => o.id === orderId);
          if (updatedOrder) {
            storedOrders[orderIndex].status = updatedOrder.status;
            // Save back to storage
            localStorage.setItem("simulated_orders", JSON.stringify(storedOrders));
          }
        }
      }

      return updatedOrders;
    });
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-6">
      {/* KOT Modal Overlay */}
      {selectedKOT && (
        <KOTModal 
          kot={selectedKOT} 
          onClose={() => setSelectedKOT(null)} 
        />
      )}

      {/* Top Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Queues</h1>
          <p className="text-gray-500 text-sm">Manage incoming orders from tables</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search table or order..." 
              className="pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 text-sm focus:outline-none w-64"
            />
          </div>
          <button className="p-2 bg-white rounded-full border border-gray-200 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Order Queue Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {orders.map((order) => (
          <OrderQueueCard 
            key={order.id} 
            order={order}
            onPrintKOT={() => handleViewKOT(order)}
            onUpdateStatus={() => handleStatusUpdate(order.id)}
          />
        ))}
      </div>

      {/* Product List Area */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Live Inventory</h2>
            <div className="flex gap-2">
               {["All Menu", "Burgers", "Pizzas"].map((filter, i) => (
                 <button key={i} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${i===0 ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200'}`}>
                   {filter}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 text-gray-600">
               Input Manually
             </button>
          </div>
        </div>

        {/* The Grid - Now using MOCK_MENU_ITEMS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {MOCK_MENU_ITEMS.map((product) => (
             <ProductCard key={product.id} product={product} />
           ))}
           <div className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-orange-100 text-2xl">+</div>
              <span className="font-medium text-sm">Add New Item</span>
           </div>
        </div>
      </section>
    </div>
  );
}