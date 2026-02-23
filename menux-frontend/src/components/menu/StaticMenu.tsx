'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { MenuItem, MenuCategory, MenuVariant } from '@/types'; // Using your exact types
import { Loader2, Leaf, Flame } from 'lucide-react';

interface StaticMenuProps {
  restaurantSlug: string;
}

export default function StaticMenu({ restaurantSlug }: StaticMenuProps) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  // Updated MenuItemVariant to MenuVariant to match your api-client.ts
  const [menuData, setMenuData] = useState<Record<string, { items: MenuItem[], variants: Record<string, MenuVariant[]> }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch restaurants list using your existing pagination method (page 0, size 100)
        const restaurantsPage = await apiClient.getRestaurants(0, 100);
        
        // Find the restaurant in the '.content' array
        const matchedRestaurant = restaurantsPage.content.find((r) => {
          const generatedSlug = r.name ? r.name.toLowerCase().replace(/\s+/g, '-') : '';
          return r.slug === restaurantSlug || generatedSlug === restaurantSlug;
        });

        if (!matchedRestaurant) {
          setError(`Could not find a restaurant matching: ${restaurantSlug}`);
          setLoading(false);
          return;
        }

        const restaurantId = matchedRestaurant.id;

        // 2. Fetch Categories using the matched ID
        const cats = await apiClient.getMenuCategories(restaurantId);
        const activeCats = cats.filter(c => c.isActive).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setCategories(activeCats);

        const organizedData: typeof menuData = {};

        // 3. Fetch Items and Variants
        await Promise.all(activeCats.map(async (cat) => {
          const items = await apiClient.getMenuItemsByCategory(restaurantId, cat.id);
          const activeItems = items.filter(i => i.isAvailable);
          
          const variantsMap: Record<string, MenuVariant[]> = {};
          
          await Promise.all(activeItems.map(async (item) => {
            // Using your existing getMenuVariants method
            const variants = await apiClient.getMenuVariants(restaurantId, item.id);
            variantsMap[item.id] = variants;
          }));

          organizedData[cat.id] = { items: activeItems, variants: variantsMap };
        }));

        setMenuData(organizedData);
      } catch (error) {
        console.error("Failed to load static menu:", error);
        setError("Failed to load the menu. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMenu();
  }, [restaurantSlug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-orange-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium">Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-red-500 p-4 text-center">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-12 pb-20 bg-gray-50 min-h-screen">
      <div className="text-center space-y-2 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold text-orange-600 capitalize">
          {restaurantSlug.replace(/-/g, ' ')}
        </h1>
        <p className="text-gray-500 font-medium">Digital Menu</p>
      </div>

      {categories.map((category) => (
        <section key={category.id} className="space-y-6">
          <h2 className="text-3xl font-bold border-b-2 border-orange-500 pb-2 text-gray-800">
            {category.name}
          </h2>
          
          <div className="grid gap-6">
            {menuData[category.id]?.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-24 h-24 bg-orange-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-orange-100">
                    <span className="text-orange-300 text-xs text-center px-2">No Image</span>
                  </div>
                )}
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {item.name}
                      {item.isVeg ? <Leaf className="w-4 h-4 text-green-500" /> : <Flame className="w-4 h-4 text-red-500" />}
                    </h3>
                    <span className="font-bold text-orange-600">₹{item.price}</span>
                  </div>
                  
                  <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
                  
                  {/* Updated to check against MenuVariant priceDifference */}
                  {menuData[category.id].variants[item.id]?.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {menuData[category.id].variants[item.id].map((v) => (
                        <span key={v.id} className="text-[11px] font-medium bg-orange-50 border border-orange-100 px-2 py-1 rounded-md text-orange-800">
                          {v.name} {v.priceDifference > 0 ? `(+₹${v.priceDifference})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}