// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_MENU_ITEMS } from "@/data/mockData";
import ProductCard from "@/components/dashboard/ProductList";
import OrderQueueCard from "@/components/dashboard/OrderQueue";
import KOTModal from "@/components/dashboard/KOTModal";
import { Search, Bell, LogOut, Store, Sparkles, ShieldCheck } from "lucide-react";
import { Order, KOT, OrderStatus } from "@/types";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";
import { apiClient, clearRestaurantAuth, setRestaurantAuth, type AdminOrderResponse } from "@/lib/api-client";

function RestaurantAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setSession = useRestaurantSessionStore((s) => s.setSession);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);
    try {
      const response = await apiClient.restaurantLogin(email.trim(), password);
      const expiresIn = response.expiresIn ?? 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      setRestaurantAuth(response.accessToken, expiresAt);
      setSession({
        restaurant: {
          id: response.restaurant?.id,
          name: response.restaurant?.name,
          slug: response.restaurant?.slug,
          subscriptionPlan: response.restaurant?.subscriptionPlan ?? response.restaurant?.subscription?.name,
          ownerEmail: response.restaurant?.ownerEmail ?? undefined,
          isActive: response.restaurant?.isActive,
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken ?? null,
        userRole: response.userRole,
        expiresIn,
      });
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0b0a] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#ff6b35]/40 blur-[120px]" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-[#4f46e5]/40 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#00c2a8]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
            <Sparkles className="h-4 w-4 text-[#ffb703]" />
            Restaurant Console
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Run service with precision, speed, and a little flair.
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            MenuX helps restaurants track orders, sync inventory, and keep every table humming.
            Sign in to manage your live kitchen queue or create a new restaurant workspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Live orders", value: "24/7", icon: <Store className="h-5 w-5" /> },
              { label: "Avg. service time", value: "12m", icon: <ShieldCheck className="h-5 w-5" /> },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-[0_30px_120px_-40px_rgba(0,0,0,0.9)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@restaurant.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong passphrase"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00c2a8]/40"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white text-black py-3 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Enter Dashboard"}
            </button>
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-white/50">
            <span>Need a super admin?</span>
            <Link href="/admin" className="text-white hover:text-[#ffb703] transition">
              Go to admin login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrderResponse[]>([]);
  const [selectedKOT, setSelectedKOT] = useState<KOT | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string>("");
  const logout = useRestaurantSessionStore((s) => s.logout);
  const expiresAt = useRestaurantSessionStore((s) => s.expiresAt);

  useEffect(() => {
    if (expiresAt && expiresAt <= Date.now()) {
      clearRestaurantAuth();
      logout();
    }
  }, [expiresAt, logout]);

  useEffect(() => {
    let cancelled = false;

    const toUiOrder = (order: AdminOrderResponse): Order => ({
      id: order.id,
      customer_name: "Guest",
      table_number: order.tableNumber || order.roomNumber || "N/A",
      items_count: order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
      total_amount: Number(order.totalAmount || 0),
      status: order.status as OrderStatus,
      created_at: new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    const fetchOrders = async (initial = false) => {
      try {
        if (initial) {
          setOrdersLoading(true);
          setOrdersError("");
        }
        const data = await apiClient.getAdminOrders();
        if (cancelled) return;
        setAdminOrders(data);
        setOrders(data.map(toUiOrder));
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load orders";
        setOrdersError(message);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    };

    void fetchOrders(true);
    const interval = setInterval(() => void fetchOrders(false), 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleViewKOT = (order: Order) => {
    const source = adminOrders.find((o) => o.id === order.id);
    const orderItems =
      source?.items?.map((i) => ({
        name: i.menuItemName,
        variant: i.variantName || undefined,
        quantity: i.quantity,
      })) || [];

    const kotData: KOT = {
      order_id: order.id,
      table_number: order.table_number,
      timestamp: order.created_at,
      items: orderItems,
    };
    setSelectedKOT(kotData);
  };

  const handleStatusUpdate = (orderId: string) => {
    const statusSequence: OrderStatus[] = [
      "PENDING",
      "ACCEPTED",
      "COOKING",
      "READY",
      "SERVED",
    ];

    const current = adminOrders.find((o) => o.id === orderId);
    if (!current) return;
    const currentIndex = statusSequence.indexOf(current.status as OrderStatus);
    const nextStatus =
      currentIndex < statusSequence.length - 1 ? statusSequence[currentIndex + 1] : current.status;
    if (nextStatus === current.status) return;

    void (async () => {
      try {
        const updated = await apiClient.updateAdminOrderStatus(orderId, nextStatus);
        setAdminOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: updated.status as OrderStatus } : o))
        );
      } catch (err) {
        console.error("Failed to update order status", err);
        setOrdersError(err instanceof Error ? err.message : "Failed to update order status");
      }
    })();
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-6">
      {selectedKOT && <KOTModal kot={selectedKOT} onClose={() => setSelectedKOT(null)} />}

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
          <button
            onClick={() => {
              clearRestaurantAuth();
              logout();
            }}
            className="p-2 bg-white rounded-full border border-gray-200 relative hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {ordersError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {ordersError}
        </div>
      )}

      {ordersLoading && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
          Loading live orders...
        </div>
      )}

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

      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Live Inventory</h2>
            <div className="flex gap-2">
              {["All Menu", "Burgers", "Pizzas"].map((filter, i) => (
                <button
                  key={i}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    i === 0
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"
                  }`}
                >
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_MENU_ITEMS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          <div className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-orange-100 text-2xl">
              +
            </div>
            <span className="font-medium text-sm">Add New Item</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  const isLoggedIn = useRestaurantSessionStore((s) => s.isLoggedIn);
  return isLoggedIn ? <RestaurantDashboard /> : <RestaurantAuth />;
}
