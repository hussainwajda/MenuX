"use client";

import { ShieldAlert } from "lucide-react";
import { QrManagementPage } from "@/components/dashboard/qr-management/QrManagementPage";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";

export default function TablesPage() {
  const restaurant = useRestaurantSessionStore((state) => state.restaurant);

  if (!restaurant?.isActive) {
    return (
      <div className="flex-1 bg-[#F8F9FA] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Inactive</h1>
            <p className="text-gray-600">
              Your account is inactive. Contact support to access table management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QrManagementPage
      entity="table"
      title="Manage Tables"
      addButtonLabel="Add Table"
      numberLabel="Table Number"
      slug={restaurant?.slug}
    />
  );
}
