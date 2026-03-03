'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiClient, type PublicMenuCategoryResponse } from '@/lib/api-client';
import { Loader2, Leaf, Flame } from 'lucide-react';

interface StaticMenuProps {
  restaurantSlug: string;
  orderButtonHref?: string;
  orderButtonLabel?: string;
}

function formatCurrency(value: number) {
  return `Rs. ${Number.isFinite(value) ? value.toFixed(2).replace(/\.00$/, '') : '0'}`;
}

export default function StaticMenu({
  restaurantSlug,
  orderButtonHref,
  orderButtonLabel = 'Order Now',
}: StaticMenuProps) {
  const [categories, setCategories] = useState<PublicMenuCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchLiveMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getPublicMenuBySlug(restaurantSlug);
        if (!mounted) return;
        setCategories(data);
      } catch (err) {
        console.error('Failed to load static menu:', err);
        if (!mounted) return;
        setError('Failed to load the menu. Please check your connection.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLiveMenu();

    return () => {
      mounted = false;
    };
  }, [restaurantSlug]);

  const visibleCategories = useMemo(
    () =>
      categories
        .map((cat) => ({
          ...cat,
          items: (cat.items ?? []).filter((item) => item.isAvailable !== false),
        }))
        .filter((cat) => cat.items.length > 0),
    [categories]
  );

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
    <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-8 sm:space-y-10 pb-20 bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-20 pt-2">
        <div className="text-center space-y-2 sm:space-y-3 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl sm:text-4xl font-bold text-orange-600 capitalize tracking-tight">
            {restaurantSlug.replace(/-/g, ' ')}
          </h1>
          <p className="text-gray-500 font-medium text-sm sm:text-base">Digital Menu</p>

          {orderButtonHref && (
            <div className="pt-2">
              <Link
                href={orderButtonHref}
                className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-2.5 sm:py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 hover:bg-orange-700 transition-colors"
              >
                {orderButtonLabel}
              </Link>
            </div>
          )}
        </div>
      </div>

      {visibleCategories.map((category) => (
        <section key={category.categoryId} className="space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold border-b-2 border-orange-500 pb-2 text-gray-800">
            {category.categoryName}
          </h2>

          <div className="grid gap-3 sm:gap-6">
            {category.items.map((item) => (
              <div
                key={item.itemId}
                className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* 1. Responsive Image Sizing */}
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-orange-100">
                    <span className="text-orange-300 text-[10px] sm:text-xs text-center px-2">No Image</span>
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {/* 2. Fixed Title and Price Collision */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base sm:text-lg flex items-center gap-1.5 flex-1 min-w-0 text-gray-900">
                      <span className="truncate">{item.name}</span>
                      {(item.isVeg ?? false) ? (
                        <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
                      ) : (
                        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" />
                      )}
                    </h3>
                    
                    {/* shrink-0 prevents the price from being squished */}
                    <span className="font-bold text-orange-600 whitespace-nowrap shrink-0 text-sm sm:text-base pt-0.5">
                      {formatCurrency(Number(item.price ?? 0))}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mt-1 sm:mt-1.5 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* 3. Responsive Variant Tags */}
                  {item.variants?.length > 0 && (
                    <div className="mt-2.5 sm:mt-3 flex gap-1.5 sm:gap-2 flex-wrap">
                      {item.variants.map((v) => (
                        <span
                          key={v.id}
                          className="text-[10px] sm:text-[11px] font-semibold bg-orange-50 border border-orange-100 px-2 py-0.5 sm:py-1 rounded text-orange-800"
                        >
                          {v.name}{' '}
                          {Number(v.priceDifference ?? 0) > 0
                            ? `(+${formatCurrency(Number(v.priceDifference))})`
                            : ''}
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
