// src/app/menu/[restaurantId]/[tableId]/page.tsx
'use client';

import { useState, useMemo } from "react";
import { Search, ShoppingBag, X, Plus, Minus, Star, ChevronDown } from "lucide-react";
import { CATEGORIES, MOCK_MENU_ITEMS } from "@/data/mockData";
import { useCartStore } from "@/store/useCartStore"; 
import { useRouter, useParams } from "next/navigation"; // <--- 1. Import useParams

export default function CustomerMenuPage() { // <--- 2. Remove { params } prop
  const params = useParams(); // <--- 3. Get params using the hook
  const tableId = params.tableId as string; // <--- 4. Extract tableId safely
  
  const [activeCategory, setActiveCategory] = useState("Recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  
  const router = useRouter();

  // Variant Modal State
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<any>(null);

  // Cart Store
  const { items, addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart } = useCartStore();
  
  // Calculate Totals
  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return MOCK_MENU_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "Recommended" || item.category === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleAddClick = (item: any) => {
    if (item.variants && item.variants.length > 0) {
      setSelectedItemForVariant(item);
    } else {
      addItem({ ...item, quantity: 1, variant: "Standard", is_veg: item.is_veg });
    }
  };

  const confirmVariantSelection = (variant: any) => {
    if (selectedItemForVariant) {
      addItem({
        id: `${selectedItemForVariant.id}-${variant.name}`, 
        name: selectedItemForVariant.name,
        price: variant.price,
        quantity: 1,
        image: selectedItemForVariant.image,
        variant: variant.name,
        is_veg: selectedItemForVariant.is_veg 
      });
      setSelectedItemForVariant(null); 
    }
  };

  // --- HANDLE PLACE ORDER ---
  const handlePlaceOrder = () => {
    // 5. Use the 'tableId' variable we extracted earlier
    const newOrder = {
      id: `${Math.floor(1000 + Math.random() * 9000)}`, 
      customer_name: "New Customer", 
      table_number: tableId, // <--- Passing the correct ID here
      items_count: cartCount,
      total_amount: Math.round(cartTotal * 1.05),
      status: "PENDING",
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: items 
    };

    const existingOrders = JSON.parse(localStorage.getItem("simulated_orders") || "[]");
    localStorage.setItem("simulated_orders", JSON.stringify([newOrder, ...existingOrders]));
    
    window.dispatchEvent(new Event("storage"));

    setIsCartOpen(false);
    setIsOrderPlaced(true);
    clearCart();

    setTimeout(() => {
      setIsOrderPlaced(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans relative">
      
      {/* 1. Header & Search */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
           <div>
             <h1 className="text-lg font-black text-gray-900">Webblers Bistro</h1>
             {/* 6. Display it in the header too */}
             <p className="text-xs text-gray-500 font-medium">Table {tableId} • Dine-in</p>
           </div>
           <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
             <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
           </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search for dishes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* 2. Categories */}
      <div className="sticky top-[108px] z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto gap-3 p-4 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? "bg-orange-600 text-white shadow-md shadow-orange-200" 
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Menu Items List */}
      <div className="p-4 space-y-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="flex-1 flex flex-col justify-between">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 border ${item.is_veg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[1px]`}>
                      <div className={`w-full h-full rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-base leading-tight">{item.name}</h3>
                  <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price}</p>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>
              </div>
            </div>
            <div className="relative w-28 h-28 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <button 
                    onClick={() => handleAddClick(item)}
                    className="bg-white text-orange-600 font-extrabold text-xs px-6 py-2 rounded-lg shadow-md border border-gray-200 uppercase hover:bg-orange-50 active:scale-95 transition-transform whitespace-nowrap"
                  >
                    {item.variants?.length ? 'ADD +' : 'ADD'}
                  </button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- INTERACTIVE COMPONENTS --- */}

      {/* A. VARIANT SELECTION MODAL */}
      {selectedItemForVariant && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedItemForVariant.name}</h3>
                <p className="text-sm text-gray-500">Customize your portion</p>
              </div>
              <button onClick={() => setSelectedItemForVariant(null)} className="p-2 bg-gray-100 rounded-full"><X size={18} /></button>
            </div>
            
            <div className="space-y-3 mb-6">
              {selectedItemForVariant.variants.map((variant: any) => (
                <button
                  key={variant.name}
                  onClick={() => confirmVariantSelection(variant)}
                  className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <span className="font-bold text-gray-700">{variant.name}</span>
                  <span className="font-bold text-gray-900">₹{variant.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* B. CART "DRAWER" (Interactive View Cart) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full h-[80vh] rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-10 overflow-hidden">
            
            {/* Cart Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-gray-800">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Cart Items (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="mt-1">
                     <div className={`w-3 h-3 border ${item.is_veg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[1px]`}>
                        <div className={`w-full h-full rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                     </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    {item.variant !== "Standard" && <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">{item.variant}</span>}
                    <p className="font-bold text-gray-900 mt-1">₹{item.price * item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1 h-8 shadow-sm">
                    <button onClick={() => decreaseQuantity(item.id)} className="text-gray-400 hover:text-orange-600"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="text-green-600 hover:text-green-700"><Plus size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary & Pay Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
               <div className="flex justify-between mb-2 text-sm text-gray-500">
                 <span>Item Total</span>
                 <span>₹{cartTotal}</span>
               </div>
               <div className="flex justify-between mb-6 text-sm text-gray-500">
                 <span>Taxes (5%)</span>
                 <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
               </div>
               <div className="flex justify-between mb-6 text-xl font-black text-gray-800">
                 <span>Grand Total</span>
                 <span>₹{(cartTotal * 1.05).toFixed(2)}</span>
               </div>

               <button 
                 onClick={handlePlaceOrder}
                 className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 active:scale-95 transition-transform"
               >
                 Place Order
               </button>
            </div>
          </div>
        </div>
      )}

      {/* C. FLOATING ACTION BUTTON (To Open Cart) */}
      {!isCartOpen && cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-orange-600 text-white p-4 rounded-xl shadow-xl shadow-orange-500/30 flex justify-between items-center animate-in slide-in-from-bottom-5 active:scale-95 transition-transform"
          >
            <div className="text-left">
              <p className="text-xs font-medium opacity-90">{cartCount} ITEMS</p>
              <p className="font-bold text-lg">₹{Math.round(cartTotal * 1.05)}</p>
            </div>
            <div className="flex items-center gap-2 font-bold">
              View Cart <ShoppingBag size={18} />
            </div>
          </button>
        </div>
      )}

      {/* D. ORDER SUCCESS MODAL */}
      {isOrderPlaced && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-xs w-full animate-in zoom-in-95 duration-300">
            {/* Animated Tick */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-600 animate-in zoom-in spin-in-180 duration-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">Order Placed!</h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              Kitchen has received your order for Table {tableId}.
            </p>
            
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 animate-[width_3s_linear] w-full origin-left"/>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}