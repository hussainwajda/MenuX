"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";

export default function ResetPasswordPage() {
  const [accessToken, setAccessToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);

    const type = hashParams.get("type") || queryParams.get("type");
    const token =
      hashParams.get("access_token") ||
      queryParams.get("access_token") ||
      queryParams.get("token");

    if (token && (!type || type === "recovery")) {
      setAccessToken(token);
    } else {
      setError("Reset link is invalid or expired. Please request a new one.");
    }

    if (window.location.hash) {
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${window.location.search}`
      );
    }
  }, []);

  const isValid = useMemo(() => {
    return newPassword.length >= 8 && newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!accessToken) {
      setError("Reset link is invalid or expired. Please request a new one.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.restaurantResetPassword(accessToken, newPassword);
      setMessage(res.message || "Password updated successfully. Please login.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : "Unable to reset password right now.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0b0a] text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#ff6b35]/40 blur-[120px]" />
        <div className="absolute top-20 right-0 h-80 w-80 rounded-full bg-[#4f46e5]/40 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#00c2a8]/30 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-md px-6 py-16">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8">
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-2 text-sm text-white/70">
            Enter a new password for your restaurant account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00c2a8]/40"
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/40"
                placeholder="Repeat your new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full rounded-xl bg-white text-black py-3 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 text-xs text-white/70">
            <Link href="/dashboard" className="underline underline-offset-4 hover:text-white">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
