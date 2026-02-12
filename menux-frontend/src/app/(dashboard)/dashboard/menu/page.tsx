// src/app/(dashboard)/dashboard/menu/page.tsx
'use client';

import { useState } from "react";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";
import { MenuCategoriesTab } from "@/app/dashboard/menu/components/MenuCategoriesTab";
import { MenuItemsTab } from "@/app/dashboard/menu/components/MenuItemsTab";
import { MenuVariantsTab } from "@/app/dashboard/menu/components/MenuVariantsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert } from "lucide-react";

export default function MenuManagementPage() {
  const restaurant = useRestaurantSessionStore((s) => s.restaurant);
  const [activeTab, setActiveTab] = useState("items"); // Changed default to "items"

  // Check if restaurant is active
  if (!restaurant?.isActive) {
    return (
      <div className="flex-1 bg-[#F8F9FA] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Inactive</h1>
            <p className="text-gray-600 mb-6">
              Your restaurant account is currently inactive. Please contact support to activate your account and access the menu management features.
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
          <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant's menu categories, items, and variants</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Active: {restaurant?.name}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-t-2xl">
            <TabsTrigger 
              value="categories" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-xl"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger 
              value="items" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-xl"
            >
              Menu Items
            </TabsTrigger>
            <TabsTrigger 
              value="variants" 
              className="data-[state=active]:bg-white data-[state=active]:text-gray-900 rounded-xl"
            >
              Variants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="p-6">
            <MenuCategoriesTab />
          </TabsContent>

          <TabsContent value="items" className="p-6">
            <MenuItemsTab />
          </TabsContent>

          <TabsContent value="variants" className="p-6">
            <MenuVariantsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
