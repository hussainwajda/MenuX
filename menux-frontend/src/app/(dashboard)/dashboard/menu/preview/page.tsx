'use client';

import { useState, useEffect } from 'react';
import { useRestaurantSessionStore } from '@/store/useRestaurantSessionStore';
import { apiClient } from '@/lib/api-client';
import { MenuPreview, MenuCategoryWithItems, MenuVariant } from '@/types';
import { Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function MenuPreviewPage() {
  const restaurant = useRestaurantSessionStore((s) => s.restaurant);
  const [menuPreview, setMenuPreview] = useState<MenuPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const restaurantId = restaurant?.id;

  useEffect(() => {
    if (restaurantId) {
      fetchMenuPreview();
    }
  }, [restaurantId]);

  const fetchMenuPreview = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const categories = await apiClient.getMenuCategories(restaurantId);
      const sortedCategories = categories.sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );

      const itemSets = await Promise.all(
        sortedCategories.map((category) =>
          apiClient.getMenuItemsByCategory(restaurantId, category.id)
        )
      );
      const items = itemSets.flat();

      const variantsByItem = await Promise.all(
        items.map(async (item) => {
          const variants = await apiClient.getMenuVariants(restaurantId, item.id);
          return { itemId: item.id, variants };
        })
      );
      const variantsMap = variantsByItem.reduce<Record<string, MenuVariant[]>>((acc, entry) => {
        acc[entry.itemId] = entry.variants;
        return acc;
      }, {});

      const categoriesWithItems: MenuCategoryWithItems[] = sortedCategories.map((category) => ({
        id: category.id,
        name: category.name,
        sortOrder: category.sortOrder ?? 0,
        isActive: category.isActive,
        items: items
          .filter((item) => item.categoryId === category.id)
          .map((item) => ({
            ...item,
            variants: variantsMap[item.id] ?? [],
          })),
      }));

      const data: MenuPreview = { categories: categoriesWithItems };
      setMenuPreview(data);

      const expanded = new Set(data.categories.map(cat => cat.id));
      setExpandedCategories(expanded);
      const visible = new Set(
        data.categories.flatMap(cat => cat.items.map(item => item.id))
      );
      setVisibleItems(visible);
    } catch (error) {
      toast.error('Failed to fetch menu preview');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newVisible = new Set(visibleItems);
    if (newVisible.has(itemId)) {
      newVisible.delete(itemId);
    } else {
      newVisible.add(itemId);
    }
    setVisibleItems(newVisible);
  };

  const toggleAllCategories = () => {
    if (menuPreview) {
      const allCategoryIds = new Set(menuPreview.categories.map(cat => cat.id));
      setExpandedCategories(allCategoryIds);
      const allItemIds = new Set(
        menuPreview.categories.flatMap(cat => cat.items.map(item => item.id))
      );
      setVisibleItems(allItemIds);
    }
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
    setVisibleItems(new Set());
  };

  if (!restaurant?.isActive) {
    return (
      <div className="flex-1 bg-[#F8F9FA] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <EyeOff className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Inactive</h1>
            <p className="text-gray-600 mb-6">
              Your restaurant account is currently inactive. Please contact support to activate your account and view the menu preview.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                <strong>Restaurant:</strong> {restaurant?.name || 'Unknown'}<br />
                <strong>Status:</strong> Inactive
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Menu Preview</h1>
          <p className="text-gray-500 mt-1">View your menu as customers will see it</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={toggleAllCategories} variant="outline" className="border-gray-300">
            Expand All
          </Button>
          <Button onClick={collapseAllCategories} variant="outline" className="border-gray-300">
            Collapse All
          </Button>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Active: {restaurant?.name}
          </div>
        </div>
      </div>

      {/* Menu Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading menu preview...</div>
        ) : !menuPreview || menuPreview.categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No menu data found. Please add categories and menu items to see the preview.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {menuPreview.categories.map((category) => (
              <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                {/* Category Header */}
                <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => toggleCategory(category.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-6 h-6 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                        <p className="text-sm text-gray-500">
                          {category.items.length} item{category.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items */}
                {expandedCategories.has(category.id) && (
                  <div className="border-t border-gray-200">
                    {category.items.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No items in this category.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item) => (
                          <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                  ) : (
                                    <span className="text-gray-500 text-sm">No image</span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-3">
                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {item.isVeg ? 'Veg' : 'Non-Veg'}
                                    </span>
                                    {!item.isAvailable && (
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Out of Stock
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">{item.description || 'No description'}</p>
                                  <p className="text-lg font-semibold text-gray-900 mt-2">INR {item.price}</p>
                                  
                                  {/* Variants */}
                                  {item.variants.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-sm font-medium text-gray-700">Variants:</p>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {item.variants.map((variant) => (
                                          <div key={variant.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                            <span className="text-sm text-gray-700">{variant.name}</span>
                                            <span className="text-sm font-medium text-gray-900">
                                              INR {item.price + variant.priceDifference}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.isAvailable ? 'Available' : 'Not Available'}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleItem(item.id)}
                                  className="text-gray-600 hover:text-gray-900 border-gray-300"
                                >
                                  {visibleItems.has(item.id) ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {menuPreview && (
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">Total Categories</h4>
              <p className="text-2xl font-bold text-blue-600">{menuPreview.categories.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900">Total Items</h4>
              <p className="text-2xl font-bold text-green-600">
                {menuPreview.categories.reduce((total, cat) => total + cat.items.length, 0)}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900">Active Items</h4>
              <p className="text-2xl font-bold text-purple-600">
                {menuPreview.categories.reduce((total, cat) => 
                  total + cat.items.filter(item => item.isAvailable).length, 0
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

