// src/components/auth/AdminLogin.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { setAdminAuth } from "@/lib/api-client";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const sessionStore = useSessionStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (!username || !password) {
        setError("Username and password are required");
        toast.error("Username and password are required");
        return;
      }

      const form = new FormData();
      form.append("username", username);
      form.append("password", password);

      const response = await fetch("/api/admin/login", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid credentials");
        }
        throw new Error("Login failed. Please try again.");
      }

      const data = await response.json();
      setAdminAuth(username, password);
      sessionStore.setAdmin(data);
      toast.success("Signed in successfully");
      router.replace("/admin/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.9)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-white text-slate-900 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Super Admin</p>
            <h1 className="text-xl font-semibold">MenuX Command</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs uppercase tracking-[0.2em] text-white/50">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs uppercase tracking-[0.2em] text-white/50">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              required
            />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
          <button
            type="submit"
            className="w-full bg-white text-slate-950 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition"
          >
            Enter Admin Console
          </button>
        </form>
      </div>
    </div>
  );
}
