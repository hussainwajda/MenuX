import { useAuthStore } from "@/store/useAuthStore";

export function hasPermission(permissionKey: string): boolean {
  return useAuthStore.getState().hasPermission(permissionKey);
}

export function hasAnyPermission(permissionKeys: string[]): boolean {
  return permissionKeys.some((key) => hasPermission(key));
}
