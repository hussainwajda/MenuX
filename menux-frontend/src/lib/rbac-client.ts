import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";

async function rbacFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = useRestaurantSessionStore.getState().rbacToken;
  if (!token) {
    throw new Error("RBAC session unavailable. Please login again.");
  }

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (body && typeof body.message === "string" && body.message) ||
      `Request failed with ${response.status}`;
    throw new Error(message);
  }

  if (!body || typeof body !== "object") {
    return undefined as T;
  }

  return (body as { data: T }).data;
}

export const rbacClient = {
  getRoles: () => rbacFetch(API_ENDPOINTS.roles()),
  createRole: (payload: { name: string; description?: string | null; permissionKeys: string[] }) =>
    rbacFetch(API_ENDPOINTS.roles(), {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getUsers: () => rbacFetch(API_ENDPOINTS.users()),
  createUser: (payload: {
    name: string;
    email: string;
    password: string;
    roleId: string;
    isActive: boolean;
  }) =>
    rbacFetch(API_ENDPOINTS.users(), {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getPermissionModules: () => rbacFetch(API_ENDPOINTS.permissionModules()),
};
