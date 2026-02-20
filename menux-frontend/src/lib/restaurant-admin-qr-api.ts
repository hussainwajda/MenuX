import axios, { AxiosError } from "axios";
import { clearRestaurantAuth } from "@/lib/api-client";

const RESTAURANT_AUTH_STORAGE_KEY = "menux_restaurant_bearer";
const RESTAURANT_SESSION_STORAGE_KEY = "menux_restaurant_session";
const QR_BASE_URL = process.env.NEXT_PUBLIC_QR_BASE_URL || "https://menux-new.vercel.app";

export type QrManagedEntity = "table" | "room";

export interface QrManagementItem {
  id: string;
  number: string;
  isActive: boolean;
  qrImageUrl: string;
  qrUrl: string;
}

export class RestaurantApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "RestaurantApiError";
    this.status = status;
    this.details = details;
  }
}

function parseRestaurantToken() {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(RESTAURANT_AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number | null };
    if (!parsed.token) return null;

    if (parsed.expiresAt && parsed.expiresAt <= Date.now()) {
      clearRestaurantAuth();
      sessionStorage.removeItem(RESTAURANT_SESSION_STORAGE_KEY);
      return null;
    }

    return parsed.token;
  } catch {
    clearRestaurantAuth();
    sessionStorage.removeItem(RESTAURANT_SESSION_STORAGE_KEY);
    return null;
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  clearRestaurantAuth();
  sessionStorage.removeItem(RESTAURANT_SESSION_STORAGE_KEY);

  if (window.location.pathname !== "/dashboard") {
    window.location.href = "/dashboard";
  }
}

function getErrorMessage(error: AxiosError<{ message?: string; error?: string }>) {
  const payload = error.response?.data;

  if (typeof payload === "string") {
    return payload;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (payload?.error) {
    return payload.error;
  }

  return error.message || "Request failed";
}

const restaurantAdminApi = axios.create({
  timeout: 15000,
});

restaurantAdminApi.interceptors.request.use((config) => {
  const token = parseRestaurantToken();

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

restaurantAdminApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      redirectToLogin();
    }

    const apiError = new RestaurantApiError(
      getErrorMessage(error as AxiosError<{ message?: string; error?: string }>),
      status,
      error.response?.data
    );

    return Promise.reject(apiError);
  }
);

function toAbsoluteUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (typeof window === "undefined") {
    return path;
  }

  return `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function isLikelyImageUrl(value: string) {
  const normalized = value.toLowerCase();
  return (
    normalized.includes("/qr") ||
    normalized.endsWith(".png") ||
    normalized.endsWith(".jpg") ||
    normalized.endsWith(".jpeg") ||
    normalized.endsWith(".webp") ||
    normalized.includes("image")
  );
}

function generateQrImageUrl(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(url)}`;
}

function fallbackQrTarget(entity: QrManagedEntity, slug: string | undefined, id: string) {
  const safeSlug = slug || "restaurant";
  const path = entity === "room" ? `/${safeSlug}/room/${id}` : `/${safeSlug}/table/${id}`;
  const base = QR_BASE_URL.endsWith("/") ? QR_BASE_URL.slice(0, -1) : QR_BASE_URL;
  return `${base}${path}`;
}

function normalizeItem(entity: QrManagedEntity, raw: Record<string, unknown>, slug?: string): QrManagementItem {
  const id = String(raw.id ?? raw.uuid ?? "");

  const numberValue =
    entity === "room"
      ? raw.roomNumber ?? raw.room_number ?? raw.number
      : raw.tableNumber ?? raw.table_number ?? raw.number;

  const number = String(numberValue ?? "").trim();

  const apiQrUrl = typeof raw.qrUrl === "string" ? raw.qrUrl : typeof raw.qr_url === "string" ? raw.qr_url : "";
  const apiQrCodeUrl =
    typeof raw.qrCodeUrl === "string"
      ? raw.qrCodeUrl
      : typeof raw.qr_code_url === "string"
      ? raw.qr_code_url
      : "";

  const fallbackTarget = fallbackQrTarget(entity, slug, id);

  const qrUrl = apiQrUrl || (apiQrCodeUrl && !isLikelyImageUrl(apiQrCodeUrl) ? toAbsoluteUrl(apiQrCodeUrl) : fallbackTarget);
  const qrImageUrl = apiQrCodeUrl && isLikelyImageUrl(apiQrCodeUrl) ? toAbsoluteUrl(apiQrCodeUrl) : generateQrImageUrl(qrUrl);

  return {
    id,
    number,
    qrUrl,
    qrImageUrl,
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
  };
}

function normalizeListResponse(response: unknown): Record<string, unknown>[] {
  if (Array.isArray(response)) {
    return response as Record<string, unknown>[];
  }

  if (response && typeof response === "object" && Array.isArray((response as { content?: unknown[] }).content)) {
    return (response as { content: Record<string, unknown>[] }).content;
  }

  return [];
}

function endpointFor(entity: QrManagedEntity, id?: string) {
  const base = entity === "room" ? "/api/admin/rooms" : "/api/admin/tables";
  return id ? `${base}/${id}` : base;
}

function toggleEndpointFor(entity: QrManagedEntity, id: string) {
  const base = entity === "room" ? "/api/admin/rooms" : "/api/admin/tables";
  return `${base}/${id}/toggle`;
}

export async function getQrManagementItems(entity: QrManagedEntity, slug?: string) {
  const response = await restaurantAdminApi.get(endpointFor(entity));
  const data = normalizeListResponse(response.data);
  return data.map((item) => normalizeItem(entity, item, slug));
}

export async function createQrManagementItem(entity: QrManagedEntity, number: string, slug?: string) {
  const payload = entity === "room" ? { roomNumber: number } : { tableNumber: number };
  const response = await restaurantAdminApi.post(endpointFor(entity), payload);
  return normalizeItem(entity, response.data as Record<string, unknown>, slug);
}

export async function updateQrManagementItem(
  entity: QrManagedEntity,
  id: string,
  payload: { number?: string; isActive?: boolean },
  slug?: string
) {
  const body: Record<string, unknown> = {};

  if (payload.number !== undefined) {
    body[entity === "room" ? "roomNumber" : "tableNumber"] = payload.number;
  }

  if (payload.isActive !== undefined) {
    const response = await restaurantAdminApi.patch(toggleEndpointFor(entity, id), body);
    return normalizeItem(entity, response.data as Record<string, unknown>, slug);
  }

  const response = await restaurantAdminApi.put(endpointFor(entity, id), body);
  return normalizeItem(entity, response.data as Record<string, unknown>, slug);
}

export async function deleteQrManagementItem(entity: QrManagedEntity, id: string) {
  await restaurantAdminApi.delete(endpointFor(entity, id));
}
