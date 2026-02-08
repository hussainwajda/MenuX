import { API_ENDPOINTS } from "./api-endpoints";

const ADMIN_AUTH_STORAGE_KEY = "menux_admin_basic_auth";
const RESTAURANT_AUTH_STORAGE_KEY = "menux_restaurant_bearer";

type ApiAuthMode = "admin" | "restaurant" | "none";

export interface SubscriptionResponse {
  id: number;
  name: string;
  priceMonthly?: number | null;
  priceYearly?: number | null;
  maxTables?: number | null;
  maxMenuItems?: number | null;
  maxAdmins?: number | null;
  allowCustomDomain?: boolean | null;
  allowQrDownload?: boolean | null;
  allowThemeCustomization?: boolean | null;
  allowAnalytics?: boolean | null;
  allowOnlineOrders?: boolean | null;
  features?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface SubscriptionDropdownResponse {
  id: number;
  name: string;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  themeConfig?: {
    primaryColor?: string;
    fontFamily?: string;
  } | null;
  subscription: SubscriptionResponse;
  isActive: boolean;
  createdAt: string;
  subscriptionStartedAt: string;
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerPhone?: string | null;
}

export interface RestaurantCreateRequest {
  name: string;
  slug: string;
  logoUrl?: string | null;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  subscriptionId: number;
  themeConfig?: {
    primaryColor?: string;
    fontFamily?: string;
  } | null;
  isActive: boolean;
  ownerPassword: string;
}

export interface RestaurantUpdateRequest {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  subscriptionId?: number;
  themeConfig?: {
    primaryColor?: string;
    fontFamily?: string;
  } | null;
  isActive?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export function setAdminAuth(username: string, password: string) {
  if (typeof window === "undefined") return;
  const token = btoa(`${username}:${password}`);
  localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, token);
}

export function clearAdminAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}

export function hasAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(ADMIN_AUTH_STORAGE_KEY));
}

export function setRestaurantAuth(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESTAURANT_AUTH_STORAGE_KEY, token);
}

export function clearRestaurantAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RESTAURANT_AUTH_STORAGE_KEY);
}

function getAdminAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  return token ? `Basic ${token}` : null;
}

function getRestaurantAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(RESTAURANT_AUTH_STORAGE_KEY);
  return token ? `Bearer ${token}` : null;
}

type ApiRequestOptions = RequestInit & {
  auth?: ApiAuthMode;
};

async function apiFetch<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const authMode = options.auth ?? "admin";
  if (!headers.has("Authorization")) {
    if (authMode === "admin") {
      const adminAuth = getAdminAuthHeader();
      if (adminAuth) headers.set("Authorization", adminAuth);
    } else if (authMode === "restaurant") {
      const restaurantAuth = getRestaurantAuthHeader();
      if (restaurantAuth) headers.set("Authorization", restaurantAuth);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as unknown as T;
}

export const apiClient = {
  adminLogin: (username: string, password: string) =>
    apiFetch<any>(API_ENDPOINTS.adminLogin(), {
      method: "POST",
      auth: "none",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    }),

  getRestaurants: (page = 0, size = 20) =>
    apiFetch<PageResponse<RestaurantResponse>>(
      `${API_ENDPOINTS.restaurants()}?page=${page}&size=${size}`
    ),

  getRestaurantById: (id: string) =>
    apiFetch<RestaurantResponse>(API_ENDPOINTS.restaurantById(id)),

  createRestaurant: (payload: RestaurantCreateRequest) =>
    apiFetch<RestaurantResponse>(API_ENDPOINTS.restaurants(), {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateRestaurant: (id: string, payload: RestaurantUpdateRequest) =>
    apiFetch<RestaurantResponse>(API_ENDPOINTS.restaurantById(id), {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteRestaurant: (id: string) =>
    apiFetch<void>(API_ENDPOINTS.restaurantById(id), {
      method: "DELETE",
    }),

  uploadRestaurantLogo: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ logo_url: string }>(API_ENDPOINTS.restaurantUploadLogo(), {
      method: "POST",
      body: formData,
    });
  },

  getSubscriptions: () =>
    apiFetch<SubscriptionResponse[]>(API_ENDPOINTS.subscriptions(), {
      auth: "admin",
    }),

  getSubscriptionDropdown: () =>
    apiFetch<SubscriptionDropdownResponse[]>(API_ENDPOINTS.subscriptionDropdown(), {
      auth: "admin",
    }),
};
