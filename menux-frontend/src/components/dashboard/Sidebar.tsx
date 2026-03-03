// src/components/dashboard/Sidebar.tsx
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  Bell,
  Headphones,
  Settings,
  LogOut,
  Armchair,
  Hotel,
  Users,
} from "lucide-react";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";
import { clearRestaurantAuth } from "@/lib/api-client";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const subscriptionPlan = useRestaurantSessionStore((s) => s.restaurant?.subscriptionPlan);
  const restaurantSlug = useRestaurantSessionStore((s) => s.restaurant?.slug);
  const permissions = useRestaurantSessionStore((s) => s.permissions);
  const authType = useRestaurantSessionStore((s) => s.authType);
  const logout = useRestaurantSessionStore((s) => s.logout);
  const isUltraPlan = (subscriptionPlan || "").toUpperCase() === "ULTRA";
  const showRoomsOption = isUltraPlan || !subscriptionPlan;

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard", permission: null },
    { name: "Dish Inventory", icon: <UtensilsCrossed size={20} />, path: "/dashboard/menu", permission: "menu.edit" },
    { name: "Restaurant Tables", icon: <Armchair size={20} />, path: "/dashboard/tables", permission: "tables.view" },
    ...(showRoomsOption
      ? [{ name: "Hotel Rooms", icon: <Hotel size={20} />, path: "/dashboard/rooms", permission: "tables.view" }]
      : []),
    { name: "Orders", icon: <ClipboardList size={20} />, path: "/dashboard/orders", permission: "orders.view" },
    { name: "Employees", icon: <Users size={20} />, path: "/dashboard/users", permission: "users.manage" },
    { name: "Notifications", icon: <Bell size={20} />, path: "/dashboard/notifications", permission: null },
    { name: "Support", icon: <Headphones size={20} />, path: "/dashboard/support", permission: null },
  ];

  const visibleMenuItems =
    authType !== "captain" || !permissions?.length
      ? menuItems
      : menuItems.filter((item) => !item.permission || permissions.includes(item.permission));

  const handleLogout = () => {
    clearRestaurantAuth();
    logout();
    if (authType === "captain" && restaurantSlug) {
      router.replace(`/${restaurantSlug}/captain/login`);
      return;
    }
    router.replace("/dashboard");
  };

  return (
    <aside className="w-20 flex flex-col items-center py-6 justify-between bg-[#1a1614] h-screen border-r border-gray-800">
      
      <div className="flex flex-col items-center gap-8 w-full">
        
        {/* --- 1. CLICKABLE USER PROFILE AT TOP --- */}
        <Link 
          href="/dashboard/profile" 
          className="group relative flex flex-col items-center gap-1 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-900/40 group-hover:scale-105 transition-transform">
             M
          </div>
          {/* Tooltip */}
          <span className="absolute left-14 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Edit Profile
          </span>
        </Link>
        
        {/* Navigation Items */}
        <nav className="flex flex-col gap-3 w-full px-3">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`p-3 rounded-xl transition-all flex justify-center group relative ${
                  isActive 
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" 
                    : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                }`}
              >
                {item.icon}
                <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4 w-full px-3">
        <Link 
          href="/dashboard/settings"
          className={`p-3 rounded-xl flex justify-center transition-colors ${
            pathname === '/dashboard/settings' 
              ? "bg-orange-600 text-white" 
              : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          }`}
        >
          <Settings size={20} />
        </Link>        
        <button
          type="button"
          onClick={handleLogout}
          className="p-3 text-gray-500 hover:bg-gray-800 rounded-xl flex justify-center"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
