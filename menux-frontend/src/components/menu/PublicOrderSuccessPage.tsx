"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { apiClient, type OrderStatus, type PublicOrderTrackerResponse } from "@/lib/api-client";

type GuestOrderSession = {
  orderId: string;
  createdAt: string;
  context: "table" | "room";
  targetId: string;
  restaurantSlug: string;
};

function currency(value: number) {
  return `Rs. ${Number.isFinite(value) ? value.toFixed(2).replace(/\.00$/, "") : "0"}`;
}

function formatStatusLabel(status?: string) {
  return (status || "").replace(/_/g, " ");
}

function buildSimplePdf(lines: string[]) {
  const safe = (s: string) =>
    s
      .replace(/[^\x20-\x7E]/g, "?")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  const streamLines = ["BT", "/F1 12 Tf", "40 800 Td", "14 TL"];
  lines.forEach((line, idx) => {
    streamLines.push(`${idx === 0 ? "" : "T* " }(${safe(line)}) Tj`.trim());
  });
  streamLines.push("ET");
  const stream = streamLines.join("\n");

  const objects: string[] = [];
  objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
  objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
  objects.push(
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj"
  );
  objects.push("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");
  objects.push(`5 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += `${obj}\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function downloadInvoicePdf(order: PublicOrderTrackerResponse) {
  const lines = [
    `INVOICE - ${order.restaurantName}`,
    `Order ID: ${order.orderId}`,
    `Order Type: ${order.orderType}`,
    `Location: ${order.roomNumber ? `Room ${order.roomNumber}` : `Table ${order.tableNumber ?? "-"}`}`,
    `Status: ${order.status}`,
    `Payment: ${order.paymentStatus}`,
    `Created At: ${new Date(order.createdAt).toLocaleString()}`,
    "----------------------------------------",
    ...order.items.map((item) => {
      const name = item.variantName ? `${item.menuItemName} (${item.variantName})` : item.menuItemName;
      const total = Number(item.price) * Number(item.quantity);
      return `${name} x${item.quantity} - ${currency(total)}`;
    }),
    "----------------------------------------",
    `Total: ${currency(Number(order.totalAmount ?? 0))}`,
    "Thank you for ordering with MenuX",
  ];

  const blob = buildSimplePdf(lines);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${order.orderId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function PublicOrderSuccessPage({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<GuestOrderSession | null>(null);
  const [order, setOrder] = useState<PublicOrderTrackerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`menux_public_order_session_by_order:${orderId}`);
      if (!raw) {
        setError("Order session not found on this device. Open this page from the QR menu flow.");
        setLoading(false);
        return;
      }
      setSession(JSON.parse(raw) as GuestOrderSession);
    } catch {
      setError("Invalid order session on this device.");
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const fetchOrder = async (first = false) => {
      try {
        if (first) setLoading(true);
        const data = await apiClient.getPublicOrder(orderId, {
          slug: session.restaurantSlug,
          tableId: session.context === "table" ? session.targetId : null,
          roomId: session.context === "room" ? session.targetId : null,
        });
        if (!cancelled) {
          setOrder(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load order");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchOrder(true);
    const isTerminal = (s?: string) => s === "SERVED" || s === "CANCELLED";
    if (isTerminal(order?.status)) {
      return () => {
        cancelled = true;
      };
    }
    const id = window.setInterval(() => void fetchOrder(false), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [session, orderId, order?.status]);

  const trackerSteps: OrderStatus[] = ["PENDING", "ACCEPTED", "COOKING", "READY", "SERVED"];
  const activeStepIndex = order ? trackerSteps.indexOf(order.status) : -1;

  const returnHref = useMemo(() => {
    if (!session) return "/";
    return `/${session.restaurantSlug}/menu/${session.context}/${session.targetId}?view=order`;
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Order Tracking</p>
            <h1 className="text-xl font-black text-gray-900">{order?.restaurantName || "MenuX Order"}</h1>
            <p className="text-xs text-gray-500">
              {session?.context === "room" ? "Room" : "Table"} {order?.roomNumber || order?.tableNumber || session?.targetId || "-"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <Link
              href={returnHref}
              className="inline-flex items-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white"
            >
              Back to Menu
            </Link>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          {loading && !order ? (
            <div className="flex items-center gap-3 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading order details...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : order ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-black text-gray-900 break-all">{order.orderId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className="font-bold text-gray-900">{formatStatusLabel(order.paymentStatus)}</p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Current Status</span>
                  <span className="font-bold text-orange-700">{formatStatusLabel(order.status)}</span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {trackerSteps.map((step, idx) => (
                    <div key={step} className="text-center">
                      <div className={`h-2 rounded-full ${activeStepIndex >= idx ? "bg-green-500" : "bg-gray-200"}`} />
                      <p className="mt-2 text-[10px] font-semibold text-gray-500">{formatStatusLabel(step)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Estimated Time</p>
                  <p className="text-xl font-black text-gray-900">{order.estimatedMinutes ?? 0} min</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-black text-gray-900">{currency(Number(order.totalAmount ?? 0))}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Invoice / Items</h3>
                  <button
                    onClick={() => downloadInvoicePdf(order)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Download size={14} />
                    Download Invoice PDF
                  </button>
                </div>
                {order.items.map((item, idx) => (
                  <div key={`${item.menuItemId}-${idx}`} className="flex justify-between gap-3 text-sm border-b border-gray-100 pb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{item.menuItemName}</p>
                      {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                      {item.instruction && (
                        <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1 mt-1 inline-block">
                          Note: {item.instruction}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-800">x{item.quantity}</p>
                      <p className="text-xs text-gray-500">{currency(Number(item.price) * Number(item.quantity))}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-gray-100 p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-2">
                  {order.statusHistory.map((h, idx) => (
                    <div key={`${h.status}-${idx}-${h.updatedAt}`} className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{formatStatusLabel(h.status)}</span>
                      <span className="text-gray-500">{new Date(h.updatedAt).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <button
          onClick={() => router.refresh()}
          className="w-full rounded-xl bg-gray-900 text-white py-3 text-sm font-bold"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}
