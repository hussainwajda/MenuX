import type { AuthTokenPayload, AuthUser } from "@/types/auth";

export function decodeJwt(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(exp?: number | null): boolean {
  if (!exp) return false;
  return exp * 1000 <= Date.now();
}

export function userFromToken(payload: AuthTokenPayload): AuthUser {
  return {
    id: typeof payload.userId === "string" ? payload.userId : undefined,
    restaurantId: typeof payload.restaurantId === "string" ? payload.restaurantId : undefined,
    name:
      (typeof payload.name === "string" && payload.name) ||
      (typeof payload.sub === "string" && payload.sub) ||
      "User",
    email:
      (typeof payload.email === "string" && payload.email) ||
      (typeof payload.sub === "string" && payload.sub) ||
      "unknown@menux.app",
  };
}
