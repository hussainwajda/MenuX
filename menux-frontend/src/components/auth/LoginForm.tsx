"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/types/auth";

type LoginMode = "owner" | "captain";

const LOGIN_CONTENT: Record<
  LoginMode,
  {
    title: string;
    subtitle: string;
    buttonLabel: string;
    endpoint: string;
  }
> = {
  owner: {
    title: "Owner Login",
    subtitle: "Sign in to manage your complete restaurant operations",
    buttonLabel: "Login as Owner",
    endpoint: API_ENDPOINTS.ownerLogin(),
  },
  captain: {
    title: "Captain Login",
    subtitle: "Sign in to manage tables, orders and service desk",
    buttonLabel: "Login as Captain",
    endpoint: API_ENDPOINTS.captainLogin(),
  },
};

export function LoginForm({ mode }: { mode: LoginMode }) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const content = LOGIN_CONTENT[mode];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(content.endpoint, {
        email,
        password,
      });

      const loginData = response?.data?.data;
      const token = loginData?.token;
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token in login response");
      }

      const fallbackUser: AuthUser = {
        id: loginData?.userId,
        name: loginData?.userName || email.split("@")[0] || "User",
        email: loginData?.email || email,
      };

      login(token, mode, fallbackUser);
      toast.success("Login successful");
      router.push("/dashboard");
    } catch (error: unknown) {
      const axiosMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (error as { response: { data: { message: string } } }).response.data.message
          : null;
      const message = axiosMessage || (error instanceof Error ? error.message : "Login failed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-white">{content.title}</h1>
        <p className="text-sm text-slate-300 mt-2">{content.subtitle}</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="email@restaurant.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-70"
          >
            {loading ? "Signing in..." : content.buttonLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
