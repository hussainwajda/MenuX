"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { clearRestaurantAuth, setRestaurantAuth } from "@/lib/api-client";
import { decodeJwt } from "@/lib/jwt";
import { useRestaurantSessionStore } from "@/store/useRestaurantSessionStore";

type CaptainLoginApiResponse = {
  success: boolean;
  message: string;
  data?: {
    token: string;
    userId: string;
    restaurantId: string;
    roleName: string;
    permissions: string[];
    userName: string;
    email: string;
  };
};

export default function CaptainLoginPage() {
  const router = useRouter();
  const params = useParams<{ restaurantSlug: string }>();
  const restaurantSlug = params?.restaurantSlug || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLoggedIn = useRestaurantSessionStore((s) => s.isLoggedIn);
  const setSession = useRestaurantSessionStore((s) => s.setSession);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.captainLogin(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const body = (await response.json().catch(() => null)) as CaptainLoginApiResponse | null;
      if (!response.ok) {
        throw new Error(body?.message || "Captain login failed");
      }

      const loginData = body?.data;
      if (!loginData?.token) {
        throw new Error("Invalid login response");
      }

      const decoded = decodeJwt(loginData.token);
      const exp = typeof decoded?.exp === "number" ? decoded.exp : null;
      const expiresIn = exp ? Math.max(0, Math.floor(exp - Date.now() / 1000)) : null;
      const expiresAt = exp ? exp * 1000 : null;

      clearRestaurantAuth();
      setRestaurantAuth(loginData.token, expiresAt);
      setSession({
        restaurant: {
          id: loginData.restaurantId,
          name: loginData.userName,
          slug: restaurantSlug,
          ownerEmail: loginData.email,
          isActive: true,
        },
        accessToken: loginData.token,
        rbacToken: loginData.token,
        refreshToken: null,
        userRole: loginData.roleName,
        permissions: Array.isArray(loginData.permissions) ? loginData.permissions : [],
        authType: "captain",
        expiresIn,
      });

      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Captain login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0b0a] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#ff6b35]/40 blur-[120px]" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-[#4f46e5]/40 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Captain Login</p>
          <h1 className="mt-2 text-2xl font-semibold">Restaurant: {restaurantSlug}</h1>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40"
                placeholder="captain@restaurant.com"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00c2a8]/40"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Enter Dashboard"}
            </button>
            {error && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
