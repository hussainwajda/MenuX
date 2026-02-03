// src/components/dashboard/ProductList.tsx
'use client';

import { useState } from 'react';
import { Edit3 } from "lucide-react";

// Updated Interface to match Customer Menu Data
interface Variant {
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  is_veg: boolean;
  is_available?: boolean; // Optional because mock data might miss it
  variants?: Variant[];   // Updated to match Customer side structure
  category?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  // Default to true if undefined
  const [isAvailable, setIsAvailable] = useState(product.is_available ?? true);

  // Helper to display variants properly
  const getVariantText = () => {
    if (!product.variants || product.variants.length === 0) return "Standard Serving";
    return product.variants.map(v => v.name).join(", ");
  };

  return (
    <div className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md ${!isAvailable ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      {/* Image Area */}
      <div className="relative h-40 w-full mb-4 rounded-2xl overflow-hidden bg-gray-100 group">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Veg/Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-200">
          <div className={`w-3 h-3 rounded-full border-2 ${product.is_veg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center`}>
            <div className={`w-1.5 h-1.5 rounded-full ${product.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-gray-800 shadow-sm">
          {product.category || 'Food'}
        </div>
      </div>

      {/* Content Area */}
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-lg leading-tight truncate pr-2">{product.name}</h3>
          <div className="font-bold text-gray-800">₹{product.price}</div>
        </div>
        
        {/* Variants Display - Updated to handle object array */}
        <p className="text-xs text-gray-400 mb-4 truncate">
          {getVariantText()}
        </p>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {/* Availability Toggle */}
          <div 
            onClick={() => setIsAvailable(!isAvailable)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-[10px] font-bold uppercase">{isAvailable ? 'In Stock' : 'Sold Out'}</span>
          </div>

          <div className="flex gap-1">
            <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
              <Edit3 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}