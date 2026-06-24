import axios from "axios";
import { queryClient } from "../lib/query-client";
import { useAuthStatus } from "../features/auth/store/auth-status";

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

      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in";
      }
    }

    return Promise.reject(error);
  },
);
