// src/lib/api.ts

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  subscriptionName: string;
  isActive: boolean;
  logoUrl?: string;
}

export interface Subscription {
  id: string;
  name: string;
}

export interface RestaurantCreateRequest {
  name: string;
  slug: string;
  logoUrl?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  subscriptionId: string;
  themeConfig?: {
    primaryColor: string;
    fontFamily: string;
  };
  isActive: boolean;
  ownerPassword: string;
}

export interface RestaurantResponse {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  subscriptionName: string;
  isActive: boolean;
  logoUrl?: string;
  themeConfig?: {
    primaryColor: string;
    fontFamily: string;
  };
}

// API Base URL - in a real app, this would be configurable
const API_BASE_URL = '/api';

// Generic fetch function with error handling
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
}

// Restaurant API functions
export const restaurantApi = {
  // Get all restaurants
  async getAll(): Promise<{ content: Restaurant[]; totalElements: number; totalPages: number }> {
    return apiFetch('/restaurants');
  },

  // Get restaurant by ID
  async getById(id: string): Promise<RestaurantResponse> {
    return apiFetch(`/restaurants/${id}`);
  },

  // Create a new restaurant
  async create(restaurant: RestaurantCreateRequest): Promise<RestaurantResponse> {
    return apiFetch('/restaurants', {
      method: 'POST',
      body: JSON.stringify(restaurant),
    });
  },

  // Update a restaurant
  async update(id: string, restaurant: Partial<RestaurantCreateRequest>): Promise<RestaurantResponse> {
    return apiFetch(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(restaurant),
    });
  },

  // Delete/deactivate a restaurant
  async delete(id: string): Promise<void> {
    return apiFetch(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload logo
  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiFetch('/restaurants/upload/logo', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData, let browser set it with boundary
      headers: {} as any,
    });
  },
};

// Subscription API functions
export const subscriptionApi = {
  // Get all subscriptions
  async getAll(): Promise<Subscription[]> {
    return apiFetch('/subscriptions');
  },
};

// Admin API functions
export const adminApi = {
  // Login
  async login(credentials: { email: string; password: string }): Promise<{ token: string }> {
    return apiFetch('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};