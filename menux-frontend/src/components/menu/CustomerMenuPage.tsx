"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import {
  apiClient,
  type OrderStatus,
  type PaymentGateway,
  type PublicDiningContextResponse,
  type PublicMenuCategoryResponse,
  type PublicOrderTrackerResponse,
  type PublicMenuVariantResponse,
} from "@/lib/api-client";
import { useCartStore } from "@/store/useCartStore";

type MenuContext = "table" | "room";

type CustomerMenuPageProps = {
  restaurantSlug: string;
  context: MenuContext;
  targetId: string;
};

type UiMenuItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  variants: PublicMenuVariantResponse[];
};

type CheckoutMode = "CASH" | "RAZORPAY";

type GuestOrderSession = {
  orderId: string;
  createdAt: string;
  context: MenuContext;
  targetId: string;
  restaurantSlug: string;
};

function currency(value: number) {
  return `Rs. ${Number.isFinite(value) ? value.toFixed(2).replace(/\.00$/, "") : "0"}`;
}

function categoryAnchor(categoryId: string) {
  return `category-${categoryId}`;
}

function guestSessionKey(restaurantSlug: string, context: MenuContext, targetId: string) {
  return `menux_public_order_session:${restaurantSlug}:${context}:${targetId}`;
}

function formatStatusLabel(status?: string) {
  return (status || "").replace(/_/g, " ");
}

export default function CustomerMenuPage({
  restaurantSlug,
  context,
  targetId,
}: CustomerMenuPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuCategories, setMenuCategories] = useState<PublicMenuCategoryResponse[]>([]);
  const [contextData, setContextData] = useState<PublicDiningContextResponse | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedItemForVariant, setSelectedItemForVariant] = useState<UiMenuItem | null>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<CheckoutMode>("CASH");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<PublicOrderTrackerResponse | null>(null);
  const [loadingActiveOrder, setLoadingActiveOrder] = useState(false);
  const [showConfirmationView, setShowConfirmationView] = useState(false);

  const { items, addItem, increaseQuantity, decreaseQuantity, updateInstruction, clearCart } = useCartStore();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [menu, diningContext] = await Promise.all([
          apiClient.getPublicMenuBySlug(restaurantSlug),
          context === "room"
            ? apiClient.getPublicRoomContext(restaurantSlug, targetId)
            : apiClient.getPublicTableContext(restaurantSlug, targetId),
        ]);

        if (!mounted) return;
        setMenuCategories(menu);
        setContextData(diningContext);
      } catch (e) {
        console.error("Failed to load customer menu", e);
        if (!mounted) return;
        setError("Failed to load menu/table details. Please scan QR again or try later.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [restaurantSlug, context, targetId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(guestSessionKey(restaurantSlug, context, targetId));
      if (!raw) return;
      const session = JSON.parse(raw) as GuestOrderSession;
      if (session.orderId) {
        setActiveOrderId(session.orderId);
      }
    } catch {
      // ignore malformed local session
    }
  }, [restaurantSlug, context, targetId]);

  useEffect(() => {
    if (!activeOrderId) return;
    let cancelled = false;

    const fetchOrder = async (withLoader = false) => {
      try {
        if (withLoader) setLoadingActiveOrder(true);
        const order = await apiClient.getPublicOrder(activeOrderId, {
          slug: restaurantSlug,
          tableId: context === "table" ? targetId : null,
          roomId: context === "room" ? targetId : null,
        });
        if (!cancelled) {
          setActiveOrder(order);
        }
      } catch (e) {
        console.error("Failed to fetch active order", e);
        if (!cancelled) {
          setCheckoutError("Unable to fetch live order status.");
        }
      } finally {
        if (!cancelled) setLoadingActiveOrder(false);
      }
    };

    void fetchOrder(true);
    const isTerminal = (s?: string) => s === "SERVED" || s === "CANCELLED";
    if (isTerminal(activeOrder?.status)) {
      return () => {
        cancelled = true;
      };
    }

    const interval = window.setInterval(() => void fetchOrder(false), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeOrderId, restaurantSlug, context, targetId, activeOrder?.status]);

  const allItems = useMemo<UiMenuItem[]>(() => {
    return menuCategories.flatMap((cat) =>
      (cat.items ?? []).map((item) => ({
        id: item.itemId,
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        name: item.name,
        description: item.description,
        price: Number(item.price ?? 0),
        imageUrl: item.imageUrl,
        isVeg: Boolean(item.isVeg ?? false),
        isAvailable: item.isAvailable !== false,
        variants: item.variants ?? [],
      }))
    );
  }, [menuCategories]);

  const categoryTabs = useMemo(() => {
    const dynamic = menuCategories
      .filter((cat) => (cat.items ?? []).some((i) => i.isAvailable !== false))
      .map((cat) => cat.categoryName);
    return ["All", ...dynamic];
  }, [menuCategories]);

  useEffect(() => {
    if (activeCategory !== "All" && !categoryTabs.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [activeCategory, categoryTabs]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (!item.isAvailable) return false;
      const categoryMatch = activeCategory === "All" || item.categoryName === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        q.length === 0 ||
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [allItems, activeCategory, searchQuery]);

  const groupedFilteredItems = useMemo(() => {
    const map = new Map<string, { id: string; name: string; items: UiMenuItem[] }>();
    for (const cat of menuCategories) {
      map.set(cat.categoryName, { id: cat.categoryId, name: cat.categoryName, items: [] });
    }
    for (const item of filteredItems) {
      const group = map.get(item.categoryName);
      if (group) group.items.push(item);
    }
    return Array.from(map.values()).filter((group) => group.items.length > 0);
  }, [menuCategories, filteredItems]);

  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = cartTotal * 0.05;
  const grandTotal = cartTotal + gst;
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddBaseItem = (item: UiMenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.imageUrl ?? undefined,
      variant: "Standard",
      is_veg: item.isVeg,
    });
  };

  const handleAddClick = (item: UiMenuItem) => {
    if (item.variants?.length) {
      setSelectedItemForVariant(item);
      return;
    }
    handleAddBaseItem(item);
  };

  const confirmVariantSelection = (variant: PublicMenuVariantResponse | null) => {
    if (!selectedItemForVariant) return;

    if (!variant) {
      handleAddBaseItem(selectedItemForVariant);
      setSelectedItemForVariant(null);
      return;
    }

    const price = selectedItemForVariant.price + Number(variant.priceDifference ?? 0);
    addItem({
      id: `${selectedItemForVariant.id}::${variant.id}`,
      name: selectedItemForVariant.name,
      price,
      quantity: 1,
      image: selectedItemForVariant.imageUrl ?? undefined,
      variant: variant.name,
      is_veg: selectedItemForVariant.isVeg,
    });
    setSelectedItemForVariant(null);
  };

  const selectedContextIds = {
    tableId: context === "table" ? targetId : null,
    roomId: context === "room" ? targetId : null,
  };

  const buildPublicOrderItems = () => {
    return items.map((item) => {
      const [menuItemId, maybeVariantId] = item.id.includes("::") ? item.id.split("::") : [item.id, null];
      const variantId = item.variant && item.variant !== "Standard" ? maybeVariantId ?? null : null;
      return {
        menuItemId,
        variantId,
        quantity: item.quantity,
        instruction: item.instruction?.trim() ? item.instruction.trim() : null,
      };
    });
  };

  const storeGuestSession = (orderId: string) => {
    if (typeof window === "undefined") return;
    const session: GuestOrderSession = {
      orderId,
      createdAt: new Date().toISOString(),
      context,
      targetId,
      restaurantSlug,
    };
    localStorage.setItem(guestSessionKey(restaurantSlug, context, targetId), JSON.stringify(session));
    localStorage.setItem(`menux_public_order_session_by_order:${orderId}`, JSON.stringify(session));
  };

  const simulateRazorpayCheckout = async (orderId: string) => {
    const fakeTxId = `razorpay_demo_${orderId}_${Date.now()}`;
    return apiClient.payPublicOrder(orderId, {
      slug: restaurantSlug,
      ...selectedContextIds,
      gateway: "RAZORPAY" satisfies PaymentGateway,
      simulateSuccess: true,
      transactionId: fakeTxId,
    });
  };

  const handleCheckoutSubmit = async () => {
    if (items.length === 0 || submittingOrder) return;
    setCheckoutError(null);
    setSubmittingOrder(true);

    try {
      const createResponse = await apiClient.createPublicOrder({
        slug: restaurantSlug,
        ...selectedContextIds,
        items: buildPublicOrderItems(),
      });

      if (selectedPaymentMode === "RAZORPAY") {
        await simulateRazorpayCheckout(createResponse.orderId);
      }

      storeGuestSession(createResponse.orderId);
      setActiveOrderId(createResponse.orderId);
      setShowPaymentSheet(false);
      setIsCartOpen(false);
      clearCart();
      router.push(`/order/${createResponse.orderId}`);
    } catch (e) {
      console.error("Failed to place order", e);
      setCheckoutError(e instanceof Error ? e.message : "Failed to place order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-orange-600">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
          <p className="font-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Route: /{restaurantSlug}/menu/{context}/{targetId}
          </p>
        </div>
      </div>
    );
  }

  const trackerSteps: OrderStatus[] = ["PENDING", "ACCEPTED", "COOKING", "READY", "SERVED"];
  const activeStepIndex = activeOrder ? trackerSteps.indexOf(activeOrder.status) : -1;

  if (showConfirmationView) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Live Order</p>
              <h1 className="text-lg font-black text-gray-900">
                {activeOrder?.restaurantName || contextData?.restaurantName || "Restaurant"}
              </h1>
              <p className="text-xs text-gray-500">
                {context === "room" ? "Room" : "Table"} {activeOrder?.roomNumber || activeOrder?.tableNumber || contextData?.entityNumber || targetId}
              </p>
            </div>
            <button
              onClick={() => setShowConfirmationView(false)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white"
            >
              Back to Menu
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            {loadingActiveOrder && !activeOrder ? (
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading live order status...
              </div>
            ) : activeOrder ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Order ID</p>
                    <p className="font-black text-gray-900">{activeOrder.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className="font-bold text-gray-800">
                      {formatStatusLabel(activeOrder.paymentStatus)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current Status</span>
                    <span className="text-sm font-bold text-orange-700">
                      {formatStatusLabel(activeOrder.status)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {trackerSteps.map((step, idx) => {
                      const done = activeStepIndex >= idx;
                      return (
                        <div key={step} className="text-center">
                          <div
                            className={`h-2 rounded-full ${done ? "bg-green-500" : "bg-gray-200"}`}
                          />
                          <p className="mt-2 text-[10px] font-semibold text-gray-500">
                            {formatStatusLabel(step)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">Estimated Time</p>
                    <p className="text-xl font-black text-gray-900">
                      {activeOrder.estimatedMinutes ?? 0} min
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-4">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-black text-gray-900">{currency(Number(activeOrder.totalAmount ?? 0))}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900">Items</h3>
                  {activeOrder.items.map((orderItem, idx) => (
                    <div key={`${orderItem.menuItemId}-${idx}`} className="flex justify-between text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{orderItem.menuItemName}</p>
                        {orderItem.variantName && (
                          <p className="text-xs text-gray-500">{orderItem.variantName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">x{orderItem.quantity}</p>
                        <p className="text-xs text-gray-500">{currency(Number(orderItem.price) * Number(orderItem.quantity))}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-600">{checkoutError || "No active order found."}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans relative">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {contextData?.restaurantLogoUrl ? (
              <img
                src={contextData.restaurantLogoUrl}
                alt={contextData.restaurantName}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                {(contextData?.restaurantName || restaurantSlug).slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-lg font-black text-gray-900 truncate">
                {contextData?.restaurantName || restaurantSlug.replace(/-/g, " ")}
              </h1>
              <p className="text-xs text-gray-500 font-medium truncate">
                {context === "room" ? "Room" : "Table"}{" "}
                {contextData?.entityNumber || targetId}
                {" • "}Dine-in
                {contextData?.entityActive === false ? " • Inactive" : ""}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      <div className="sticky top-[108px] z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto gap-3 p-4 no-scrollbar scroll-smooth">
          {categoryTabs.map((cat) => (
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

      <div className="p-4 space-y-8">
        {groupedFilteredItems.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-100 p-6 text-center text-gray-500">
            No items found for this search/category.
          </div>
        )}

        {groupedFilteredItems.map((group) => (
          <section key={group.id} id={categoryAnchor(group.id)} className="space-y-4">
            <div className="px-1">
              <h2 className="text-lg font-black text-gray-900">{group.name}</h2>
            </div>

            <div className="space-y-4">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4"
                >
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-3 h-3 border ${
                            item.isVeg ? "border-green-600" : "border-red-600"
                          } flex items-center justify-center p-[1px]`}
                        >
                          <div
                            className={`w-full h-full rounded-full ${
                              item.isVeg ? "bg-green-600" : "bg-red-600"
                            }`}
                          />
                        </div>
                        {item.variants.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 font-semibold">
                            {item.variants.length} variants
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-800 text-base leading-tight">{item.name}</h3>
                      <p className="text-sm font-bold text-gray-900 mt-1">{currency(item.price)}</p>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>
                      )}

                      {item.variants.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.variants.slice(0, 3).map((variant) => (
                            <span
                              key={variant.id}
                              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
                            >
                              {variant.name}
                              {Number(variant.priceDifference || 0) > 0
                                ? ` (+${currency(Number(variant.priceDifference))})`
                                : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative w-28 h-28 flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl border border-gray-100"
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[11px] text-orange-500 font-semibold text-center px-2">
                        No Image
                      </div>
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                      <button
                        onClick={() => handleAddClick(item)}
                        className="bg-white text-orange-600 font-extrabold text-xs px-5 py-2 rounded-lg shadow-md border border-gray-200 uppercase hover:bg-orange-50 active:scale-95 transition-transform whitespace-nowrap"
                      >
                        {item.variants.length ? "Add +" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectedItemForVariant && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedItemForVariant.name}</h3>
                <p className="text-sm text-gray-500">Choose base or variant</p>
              </div>
              <button
                onClick={() => setSelectedItemForVariant(null)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <button
                onClick={() => confirmVariantSelection(null)}
                className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
              >
                <span className="font-bold text-gray-700">Standard</span>
                <span className="font-bold text-gray-900">{currency(selectedItemForVariant.price)}</span>
              </button>

              {selectedItemForVariant.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => confirmVariantSelection(variant)}
                  className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <span className="font-bold text-gray-700">{variant.name}</span>
                  <span className="font-bold text-gray-900">
                    {currency(selectedItemForVariant.price + Number(variant.priceDifference || 0))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full h-[80vh] rounded-t-3xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-black text-gray-800">Your Order</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {items.length === 0 && <p className="text-sm text-gray-500">Your cart is empty.</p>}
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="mt-1">
                    <div
                      className={`w-3 h-3 border ${
                        item.is_veg ? "border-green-600" : "border-red-600"
                      } flex items-center justify-center p-[1px]`}
                    >
                      <div
                        className={`w-full h-full rounded-full ${
                          item.is_veg ? "bg-green-600" : "bg-red-600"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    {item.variant && item.variant !== "Standard" && (
                      <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                        {item.variant}
                      </span>
                    )}
                    <div className="mt-2">
                      <label className="text-[10px] font-bold uppercase tracking-wide text-orange-700">
                        Instructions (optional)
                      </label>
                      <textarea
                        value={item.instruction || ""}
                        onChange={(e) => updateInstruction(item.id, e.target.value)}
                        placeholder="Less spicy, no onion, extra crispy..."
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-orange-200 bg-orange-50/50 px-2 py-1.5 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <p className="font-bold text-gray-900 mt-1">
                      {currency(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-2 py-1 h-8 shadow-sm">
                    <button onClick={() => decreaseQuantity(item.id)} className="text-gray-400 hover:text-orange-600">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)} className="text-green-600 hover:text-green-700">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between mb-2 text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{currency(cartTotal)}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm text-gray-500">
                <span>GST (5%)</span>
                <span>{currency(gst)}</span>
              </div>
              <div className="flex justify-between mb-6 text-xl font-black text-gray-800">
                <span>Grand Total</span>
                <span>{currency(grandTotal)}</span>
              </div>

              <button
                onClick={() => {
                  setCheckoutError(null);
                  setShowPaymentSheet(true);
                }}
                disabled={items.length === 0 || contextData?.entityActive === false}
                className="w-full bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 active:scale-95 transition-transform"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full rounded-t-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Choose Payment</h3>
                <p className="text-sm text-gray-500">Temporary guest session for this table/room will be created.</p>
              </div>
              <button
                onClick={() => setShowPaymentSheet(false)}
                className="p-2 rounded-full bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedPaymentMode("RAZORPAY")}
                className={`w-full text-left rounded-xl border p-4 ${
                  selectedPaymentMode === "RAZORPAY" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                }`}
              >
                <p className="font-bold text-gray-900">Pay with Razorpay (Demo)</p>
                <p className="text-xs text-gray-500 mt-1">
                  Calls payment API and returns dummy confirmation as paid.
                </p>
              </button>

              <button
                onClick={() => setSelectedPaymentMode("CASH")}
                className={`w-full text-left rounded-xl border p-4 ${
                  selectedPaymentMode === "CASH" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                }`}
              >
                <p className="font-bold text-gray-900">Pay on Counter</p>
                <p className="text-xs text-gray-500 mt-1">
                  Order gets placed now, payment remains unpaid for counter collection.
                </p>
              </button>
            </div>

            {checkoutError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {checkoutError}
              </div>
            )}

            <button
              onClick={handleCheckoutSubmit}
              disabled={submittingOrder}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-60"
            >
              {submittingOrder
                ? "Processing..."
                : selectedPaymentMode === "RAZORPAY"
                ? `Pay ${currency(grandTotal)}`
                : "Place Order"}
            </button>
          </div>
        </div>
      )}

      {!isCartOpen && cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-orange-600 text-white p-4 rounded-xl shadow-xl shadow-orange-500/30 flex justify-between items-center active:scale-95 transition-transform"
          >
            <div className="text-left">
              <p className="text-xs font-medium opacity-90">{cartCount} ITEMS</p>
              <p className="font-bold text-lg">{currency(grandTotal)}</p>
            </div>
            <div className="flex items-center gap-2 font-bold">
              View Cart <ShoppingBag size={18} />
            </div>
          </button>
        </div>
      )}

      {!isCartOpen && !showPaymentSheet && activeOrderId && (
        <div className="fixed bottom-24 right-4 z-30">
          <button
            onClick={() => router.push(`/order/${activeOrderId}`)}
            className="rounded-full bg-white border border-orange-200 text-orange-700 px-4 py-2 shadow-lg font-bold text-sm"
          >
            Your Orders
          </button>
        </div>
      )}
    </div>
  );
}
