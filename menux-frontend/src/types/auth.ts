export interface AuthUser {
  id?: string;
  restaurantId?: string;
  name: string;
  email: string;
}

export interface AuthTokenPayload {
  sub?: string;
  userId?: string;
  restaurantId?: string;
  name?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface AuthState {
  user: AuthUser | null;
  role: string | null;
  permissions: string[];
  token: string | null;
  exp: number | null;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  token: string;
  user?: AuthUser;
  role?: string;
  permissions?: string[];
}
