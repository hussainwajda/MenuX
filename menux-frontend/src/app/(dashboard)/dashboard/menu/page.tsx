// src/app/(dashboard)/dashboard/menu/page.tsx
'use client';

import { useState } from "react";
import { MOCK_MENU_ITEMS } from "@/data/mockData";
import ProductCard from "@/components/dashboard/ProductList";
import { Plus, Search, Filter } from "lucide-react";

export default function MenuManagementPage() {
  const [products, setProducts] = useState(MOCK_MENU_ITEMS);

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dish Inventory</h1>
          <p className="text-gray-500 mt-1">Manage availability and prices</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all">
           <Plus size={18} /> Add New Dish
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}