"use client";

import axios from "axios";
import { API_BASE_URL } from "@/lib/api-endpoints";
import { isTokenExpired } from "@/lib/jwt";
import { useAuthStore } from "@/store/useAuthStore";

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const mode = useAuthStore.getState().loginMode;
  window.location.href = mode === "captain" ? "/captain/login" : "/login";
}

let interceptorsInitialized = false;

export function setupAxiosInterceptors() {
  if (interceptorsInitialized) return;
  interceptorsInitialized = true;

  axiosClient.interceptors.request.use(
    (config) => {
      const { token, exp, logout } = useAuthStore.getState();

      if (isTokenExpired(exp)) {
        logout();
        redirectToLogin();
        return Promise.reject(new Error("Session expired. Please log in again."));
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        useAuthStore.getState().logout();
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );
}
