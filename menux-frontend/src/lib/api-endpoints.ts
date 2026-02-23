const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;

export const API_ENDPOINTS = {
  adminLogin: () => `${API_BASE_URL}/api/admin/login`,

  restaurants: () => `${API_BASE_URL}/api/restaurants`,
  restaurantById: (id: string) => `${API_BASE_URL}/api/restaurants/${id}`,
  restaurantUploadLogo: () => `${API_BASE_URL}/api/restaurants/upload/logo`,
  restaurantAuthLogin: () => `${API_BASE_URL}/api/restaurants/auth/login`,

  subscriptions: () => `${API_BASE_URL}/api/subscriptions`,
  subscriptionDropdown: () => `${API_BASE_URL}/api/subscription-dropdown`,

  // Menu Management Endpoints
  menuCategories: (restaurantId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-categories`,
  menuCategory: (restaurantId: string, categoryId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-categories/${categoryId}`,
  menuItems: (restaurantId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-items`,
  menuItemUpload: (restaurantId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-items/upload`,
  menuItem: (restaurantId: string, itemId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-items/${itemId}`,
  menuItemsByCategory: (restaurantId: string, categoryId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-items/category/${categoryId}`,
  menuVariants: (restaurantId: string, itemId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-items/${itemId}/variants`,
  menuVariant: (restaurantId: string, itemId: string, variantId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu-items/${itemId}/variants/${variantId}`,
  menuPreview: (restaurantId: string) => `${API_BASE_URL}/api/restaurants/${restaurantId}/menu`,

  // Public customer menu / QR endpoints
  publicMenuBySlug: (slug: string) => `${API_BASE_URL}/api/restaurants/slug/${slug}/menu`,
  publicTableContext: (slug: string, tableId: string) => `${API_BASE_URL}/api/restaurants/slug/${slug}/table/${tableId}`,
  publicRoomContext: (slug: string, roomId: string) => `${API_BASE_URL}/api/restaurants/slug/${slug}/room/${roomId}`,
  publicOrders: () => `${API_BASE_URL}/api/public/orders`,
  publicOrderById: (orderId: string) => `${API_BASE_URL}/api/public/orders/${orderId}`,

  adminOrders: () => `${API_BASE_URL}/api/admin/orders`,
  adminOrderById: (orderId: string) => `${API_BASE_URL}/api/admin/orders/${orderId}`,
  adminOrderStatus: (orderId: string) => `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
  adminOrderMarkPaid: (orderId: string) => `${API_BASE_URL}/api/admin/orders/${orderId}/mark-paid`,
};
