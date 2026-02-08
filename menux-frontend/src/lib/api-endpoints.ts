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
};
