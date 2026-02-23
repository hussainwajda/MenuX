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
  subscriptionPlan?: string | null;
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

export interface RestaurantLoginResponse {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number | null;
  userRole: string;
  restaurant: RestaurantResponse;
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
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string | null;
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

// Menu Management Types
export interface MenuCategory {
  id: string;
  restaurantId?: string;
  name: string;
  sortOrder?: number | null;
  isActive: boolean;
  createdAt: string;
}

export interface MenuCategoryCreate {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MenuCategoryUpdate {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId?: string;
  name: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  categoryId: string;
  createdAt: string;
  variants?: MenuVariant[];
}

export interface MenuItemCreate {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface MenuItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  isVeg?: boolean;
  isAvailable?: boolean;
  imageUrl?: string;
  categoryId?: string;
}

export interface MenuItemAvailability {
  isAvailable: boolean;
}

export interface MenuVariant {
  id: string;
  menuItemId?: string;
  name: string;
  priceDifference: number;
  createdAt: string;
}

export interface MenuVariantCreate {
  name: string;
  priceDifference: number;
}

export interface MenuVariantUpdate {
  name?: string;
  priceDifference?: number;
}

export interface MenuCategoryWithItems {
  id: string;
  name: string;
  sortOrder?: number | null;
  isActive: boolean;
  items: MenuItem[];
}

export interface MenuPreview {
  categories: MenuCategoryWithItems[];
}

export interface PublicDiningContextResponse {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantLogoUrl?: string | null;
  subscriptionPlan?: string | null;
  entityType: "table" | "room";
  entityId: string;
  entityNumber: string;
  entityActive: boolean;
}

export interface PublicMenuVariantResponse {
  id: string;
  menuItemId?: string;
  name: string;
  priceDifference: number;
  createdAt?: string;
}

export interface PublicMenuItemResponse {
  itemId: string;
  name: string;
  description?: string | null;
  price: number;
  isVeg?: boolean | null;
  isAvailable?: boolean | null;
  imageUrl?: string | null;
  variants: PublicMenuVariantResponse[];
}

export interface PublicMenuCategoryResponse {
  categoryId: string;
  categoryName: string;
  items: PublicMenuItemResponse[];
}

export type PaymentGateway = "UPI" | "RAZORPAY" | "CASH";
export type OrderPaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";
export type OrderStatus =
  | "CREATED"
  | "PENDING"
  | "ACCEPTED"
  | "COOKING"
  | "READY"
  | "SERVED"
  | "CANCELLED";

export interface PublicCreateOrderItemRequest {
  menuItemId: string;
  variantId?: string | null;
  quantity: number;
  instruction?: string | null;
}

export interface PublicCreateOrderResponse {
  orderId: string;
  totalAmount: number;
  paymentRequired: boolean;
}

export interface PublicOrderPaymentResponse {
  orderId: string;
  paymentId: string;
  paymentRecordStatus: "INITIATED" | "SUCCESS" | "FAILED" | string;
  orderPaymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string | null;
}

export interface PublicOrderTrackerItemResponse {
  menuItemId: string;
  menuItemName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  price: number;
  instruction?: string | null;
}

export interface PublicOrderTrackerStatusResponse {
  status: OrderStatus;
  updatedAt: string;
}

export interface PublicOrderTrackerResponse {
  orderId: string;
  restaurantName: string;
  tableId?: string | null;
  tableNumber?: string | null;
  roomId?: string | null;
  roomNumber?: string | null;
  orderType: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  totalAmount: number;
  createdAt: string;
  estimatedMinutes?: number | null;
  items: PublicOrderTrackerItemResponse[];
  statusHistory: PublicOrderTrackerStatusResponse[];
}

export interface AdminOrderItemResponse {
  id: string;
  menuItemId: string;
  menuItemName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  price: number;
  instruction?: string | null;
}

export interface AdminOrderResponse {
  id: string;
  restaurantId: string;
  tableId?: string | null;
  tableNumber?: string | null;
  roomId?: string | null;
  roomNumber?: string | null;
  orderType: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  totalAmount: number;
  createdAt: string;
  items: AdminOrderItemResponse[];
  statusHistory: Array<{ id: string; status: OrderStatus; updatedAt: string }>;
  payments: Array<{ id: string; gateway: PaymentGateway; transactionId?: string | null; status: string; createdAt: string }>;
  kitchenTicket?: { id: string; orderId: string; status: string; createdAt: string; updatedAt: string } | null;
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

export function setRestaurantAuth(token: string, expiresAt?: number | null) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({ token, expiresAt: expiresAt ?? null });
  sessionStorage.setItem(RESTAURANT_AUTH_STORAGE_KEY, payload);
}

export function clearRestaurantAuth() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RESTAURANT_AUTH_STORAGE_KEY);
}

function getAdminAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  return token ? `Basic ${token}` : null;
}

function getRestaurantAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESTAURANT_AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number | null };
    if (!parsed.token) return null;
    if (parsed.expiresAt && parsed.expiresAt <= Date.now()) {
      sessionStorage.removeItem(RESTAURANT_AUTH_STORAGE_KEY);
      return null;
    }
    return `Bearer ${parsed.token}`;
  } catch {
    sessionStorage.removeItem(RESTAURANT_AUTH_STORAGE_KEY);
    return null;
  }
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
    apiFetch<Record<string, unknown>>(API_ENDPOINTS.adminLogin(), {
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

  restaurantLogin: (email: string, password: string) =>
    apiFetch<RestaurantLoginResponse>(API_ENDPOINTS.restaurantAuthLogin(), {
      method: "POST",
      auth: "none",
      body: JSON.stringify({ email, password }),
    }),

  // Menu Categories
  getMenuCategories: (restaurantId: string) =>
    apiFetch<MenuCategory[]>(API_ENDPOINTS.menuCategories(restaurantId), {
      auth: "restaurant",
    }),

  createMenuCategory: (restaurantId: string, data: MenuCategoryCreate) =>
    apiFetch<MenuCategory>(API_ENDPOINTS.menuCategories(restaurantId), {
      method: "POST",
      auth: "restaurant",
      body: JSON.stringify(data),
    }),

  updateMenuCategory: (restaurantId: string, categoryId: string, data: MenuCategoryUpdate) =>
    apiFetch<MenuCategory>(API_ENDPOINTS.menuCategory(restaurantId, categoryId), {
      method: "PATCH",
      auth: "restaurant",
      body: JSON.stringify(data),
    }),

  deleteMenuCategory: (restaurantId: string, categoryId: string) =>
    apiFetch<void>(API_ENDPOINTS.menuCategory(restaurantId, categoryId), {
      method: "DELETE",
      auth: "restaurant",
    }),

  // Menu Items
  getMenuItems: (restaurantId: string) =>
    apiFetch<MenuItem[]>(API_ENDPOINTS.menuItems(restaurantId), {
      auth: "restaurant",
    }),

  uploadMenuItemImage: (restaurantId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ image_url: string }>(API_ENDPOINTS.menuItemUpload(restaurantId), {
      method: "POST",
      auth: "restaurant",
      body: formData,
    });
  },

  getMenuItemsByCategory: (restaurantId: string, categoryId: string) =>
    apiFetch<MenuItem[]>(API_ENDPOINTS.menuItemsByCategory(restaurantId, categoryId), {
      auth: "restaurant",
    }),

  createMenuItem: (restaurantId: string, data: MenuItemCreate) =>
    apiFetch<MenuItem>(API_ENDPOINTS.menuItems(restaurantId), {
      method: "POST",
      auth: "restaurant",
      body: JSON.stringify(data),
    }),

  updateMenuItem: (restaurantId: string, itemId: string, data: MenuItemUpdate) =>
    apiFetch<MenuItem>(API_ENDPOINTS.menuItem(restaurantId, itemId), {
      method: "PATCH",
      auth: "restaurant",
      body: JSON.stringify(data),
    }),

  updateMenuItemAvailability: (restaurantId: string, itemId: string, data: MenuItemAvailability) =>
    apiFetch<MenuItem>(API_ENDPOINTS.menuItem(restaurantId, itemId) + "/availability", {
      method: "PATCH",
      auth: "restaurant",
      body: JSON.stringify(data),
    }),

  deleteMenuItem: (restaurantId: string, itemId: string) =>
    apiFetch<void>(API_ENDPOINTS.menuItem(restaurantId, itemId), {
      method: "DELETE",
      auth: "restaurant",
    }),

  // Menu Variants
  getMenuVariants: (restaurantId: string, itemId: string) =>
    apiFetch<MenuVariant[]>(API_ENDPOINTS.menuVariants(restaurantId, itemId), {
      auth: "restaurant",
    }),

  createMenuVariant: (restaurantId: string, itemId: string, data: MenuVariantCreate) =>
    apiFetch<MenuVariant>(API_ENDPOINTS.menuVariants(restaurantId, itemId), {
      method: "POST",
      auth: "restaurant",
      body: JSON.stringify(data),
    }),

  updateMenuVariant: (restaurantId: string, itemId: string, variantId: string, data: MenuVariantUpdate) =>
    apiFetch<MenuVariant>(API_ENDPOINTS.menuVariant(restaurantId, itemId, variantId), {
      method: "PATCH",
      auth: "restaurant",
      body: JSON.stringify(data),
    }),

  deleteMenuVariant: (restaurantId: string, itemId: string, variantId: string) =>
    apiFetch<void>(API_ENDPOINTS.menuVariant(restaurantId, itemId, variantId), {
      method: "DELETE",
      auth: "restaurant",
    }),

  // Menu Preview
  getMenuPreview: (restaurantId: string) =>
    apiFetch<MenuCategoryWithItems[]>(API_ENDPOINTS.menuPreview(restaurantId), {
      auth: "restaurant",
    }).then((categories) => ({ categories })),

  // Public customer menu / QR
  getPublicMenuBySlug: (slug: string) =>
    apiFetch<PublicMenuCategoryResponse[]>(API_ENDPOINTS.publicMenuBySlug(slug), {
      auth: "none",
    }),

  getPublicTableContext: (slug: string, tableId: string) =>
    apiFetch<PublicDiningContextResponse>(API_ENDPOINTS.publicTableContext(slug, tableId), {
      auth: "none",
    }),

  getPublicRoomContext: (slug: string, roomId: string) =>
    apiFetch<PublicDiningContextResponse>(API_ENDPOINTS.publicRoomContext(slug, roomId), {
      auth: "none",
    }),

  createPublicOrder: (payload: {
    slug: string;
    tableId?: string | null;
    roomId?: string | null;
    items: PublicCreateOrderItemRequest[];
  }) =>
    apiFetch<PublicCreateOrderResponse>(API_ENDPOINTS.publicOrders(), {
      method: "POST",
      auth: "none",
      body: JSON.stringify(payload),
    }),

  payPublicOrder: (
    orderId: string,
    payload: {
      slug: string;
      tableId?: string | null;
      roomId?: string | null;
      gateway: PaymentGateway;
      simulateSuccess?: boolean;
      transactionId?: string | null;
    }
  ) =>
    apiFetch<PublicOrderPaymentResponse>(`${API_ENDPOINTS.publicOrderById(orderId)}/pay`, {
      method: "POST",
      auth: "none",
      body: JSON.stringify(payload),
    }),

  getPublicOrder: (orderId: string, params: { slug: string; tableId?: string | null; roomId?: string | null }) => {
    const q = new URLSearchParams({ slug: params.slug });
    if (params.tableId) q.set("tableId", params.tableId);
    if (params.roomId) q.set("roomId", params.roomId);
    return apiFetch<PublicOrderTrackerResponse>(`${API_ENDPOINTS.publicOrderById(orderId)}?${q.toString()}`, {
      auth: "none",
    });
  },

  getAdminOrders: () =>
    apiFetch<AdminOrderResponse[]>(API_ENDPOINTS.adminOrders(), {
      auth: "restaurant",
    }),

  updateAdminOrderStatus: (orderId: string, status: OrderStatus) =>
    apiFetch<AdminOrderResponse>(API_ENDPOINTS.adminOrderStatus(orderId), {
      method: "PATCH",
      auth: "restaurant",
      body: JSON.stringify({ status }),
    }),

  markAdminOrderPaid: (orderId: string, gateway: "CASH" | "UPI") =>
    apiFetch<AdminOrderResponse>(API_ENDPOINTS.adminOrderMarkPaid(orderId), {
      method: "POST",
      auth: "restaurant",
      body: JSON.stringify({ gateway }),
    }),
};
