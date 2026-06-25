import axios from "axios";
import { queryClient } from "./query-client";
import { useAuthStatus } from "@/features/auth/store/auth-status";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      queryClient.setQueryData(["auth", "session"], null);
      useAuthStatus.getState().setStatus("unauthenticated");

      // Only redirect to sign-in when the user is on a protected page.
      // Auth pages (sign-in, sign-up) expect 401 responses as part of
      // the normal "no session" flow — redirecting would break sign-up.
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const isAuthPage = path.startsWith("/auth/");
        if (!isAuthPage) {
          window.location.href = "/auth/sign-in";
        }
      }
    }

    return Promise.reject(error);
  },
);
