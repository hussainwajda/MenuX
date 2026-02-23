'use client';

import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Eye, Filter, Loader2, RefreshCw, Search } from "lucide-react";
import { apiClient, type AdminOrderResponse, type OrderStatus } from "@/lib/api-client";

function currency(value: number) {
  return `Rs. ${Number(value || 0).toFixed(2).replace(/\.00$/, "")}`;
}

function nextStatus(status: OrderStatus): OrderStatus {
  const sequence: OrderStatus[] = ["PENDING", "ACCEPTED", "COOKING", "READY", "SERVED"];
  const idx = sequence.indexOf(status);
  return idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : status;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<AdminOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderResponse | null>(null);
  const [markingPaid, setMarkingPaid] = useState<null | { orderId: string; gateway: "CASH" | "UPI" }>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async (first = false) => {
      try {
        if (first) {
          setLoading(true);
          setError("");
        }
        const data = await apiClient.getAdminOrders();
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load(true);
    const interval = setInterval(() => void load(false), 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        q.length === 0 ||
        order.id.toLowerCase().includes(q) ||
        (order.tableNumber || "").toLowerCase().includes(q) ||
        (order.roomNumber || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const groupedOrders = useMemo(() => {
    return filteredOrders.reduce<Record<string, AdminOrderResponse[]>>((acc, order) => {
      const dateKey = new Date(order.createdAt).toLocaleDateString();
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(order);
      return acc;
    }, {});
  }, [filteredOrders]);

  const statusColors: Record<string, string> = {
    SERVED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    PENDING: "bg-blue-100 text-blue-700",
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    COOKING: "bg-orange-100 text-orange-700",
    READY: "bg-purple-100 text-purple-700",
  };

  const handleAdvanceStatus = async (order: AdminOrderResponse) => {
    const next = nextStatus(order.status);
    if (next === order.status) return;

    try {
      setUpdatingOrderId(order.id);
      const updated = await apiClient.updateAdminOrderStatus(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkPaid = async (order: AdminOrderResponse, gateway: "CASH" | "UPI") => {
    try {
      setMarkingPaid({ orderId: order.id, gateway });
      const updated = await apiClient.markAdminOrderPaid(order.id, gateway);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      setSelectedOrder((prev) => (prev && prev.id === order.id ? updated : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark payment");
    } finally {
      setMarkingPaid(null);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] p-8 h-full overflow-y-auto font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order History</h1>
          <p className="text-gray-500 mt-1">Live orders from backend (auto-refresh every 5s)</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Order ID / Table / Room"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
            <Calendar size={16} /> Auto
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | OrderStatus)}
              className="bg-transparent outline-none"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="COOKING">Cooking</option>
              <option value="READY">Ready</option>
              <option value="SERVED">Served</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-600">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading orders...
        </div>
      )}

      <div className="space-y-8">
        {Object.keys(groupedOrders).length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-500 text-sm">
            No orders found.
          </div>
        )}

        {Object.entries(groupedOrders).map(([dateKey, dayOrders]) => (
          <div key={dateKey}>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 pl-1">{dateKey}</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Table/Room</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Payment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dayOrders.map((order) => {
                      const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;
                      const locationLabel = order.tableNumber
                        ? `Table ${order.tableNumber}`
                        : order.roomNumber
                        ? `Room ${order.roomNumber}`
                        : order.orderType;
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-800">{order.id.slice(0, 8)}</span>
                            <div className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-800">{locationLabel}</div>
                            <div className="text-xs text-gray-500">{order.orderType}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{itemCount} Items</td>
                          <td className="px-6 py-4 font-bold text-gray-800">{currency(Number(order.totalAmount || 0))}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                title="View"
                                onClick={() => setSelectedOrder(order)}
                                className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleAdvanceStatus(order)}
                                disabled={updatingOrderId === order.id || order.status === "SERVED" || order.status === "CANCELLED"}
                                className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold disabled:opacity-50"
                              >
                                {updatingOrderId === order.id ? "..." : "Next"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">
                  {selectedOrder.id} • {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : selectedOrder.roomNumber ? `Room ${selectedOrder.roomNumber}` : selectedOrder.orderType}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-bold text-gray-900">{selectedOrder.status}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className="font-bold text-gray-900">{selectedOrder.paymentStatus}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-gray-900">{currency(Number(selectedOrder.totalAmount || 0))}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-bold text-gray-900 text-sm">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>

              {selectedOrder.paymentStatus !== "PAID" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-bold text-amber-900">Mark Unpaid Payment as Paid</p>
                      <p className="text-sm text-amber-800">Creates an entry in order payments for cash or UPI collection.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMarkPaid(selectedOrder, "CASH")}
                        disabled={!!markingPaid}
                        className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-bold disabled:opacity-50"
                      >
                        {markingPaid?.orderId === selectedOrder.id && markingPaid.gateway === "CASH" ? "Saving..." : "Paid By CASH"}
                      </button>
                      <button
                        onClick={() => handleMarkPaid(selectedOrder, "UPI")}
                        disabled={!!markingPaid}
                        className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-800 text-sm font-bold disabled:opacity-50"
                      >
                        {markingPaid?.orderId === selectedOrder.id && markingPaid.gateway === "UPI" ? "Saving..." : "Paid By UPI"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 p-4">
                <h3 className="font-bold text-gray-900 mb-3">Ordered Products</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{item.menuItemName}</p>
                          {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900">x{item.quantity}</p>
                          <p className="text-xs text-gray-500">{currency(Number(item.price) * Number(item.quantity))}</p>
                        </div>
                      </div>
                      {item.instruction && (
                        <div className="mt-2 rounded-md border border-orange-300 bg-orange-50 px-3 py-2">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-orange-800">Instruction</p>
                          <p className="text-sm font-medium text-orange-900">{item.instruction}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Payments</h3>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.payments.length === 0 && <p className="text-gray-500">No payment records yet.</p>}
                    {selectedOrder.payments.map((p) => (
                      <div key={p.id} className="flex justify-between gap-2">
                        <span className="text-gray-700">{p.gateway}</span>
                        <span className="text-gray-500">{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-900 mb-2">Status Timeline</h3>
                  <div className="space-y-2 text-sm">
                    {selectedOrder.statusHistory.map((h) => (
                      <div key={h.id} className="flex justify-between gap-2">
                        <span className="text-gray-700">{h.status}</span>
                        <span className="text-gray-500">{new Date(h.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
