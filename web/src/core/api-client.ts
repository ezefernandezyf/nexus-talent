import axios from "axios";
import { useAuthStore } from "../auth/auth-store";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearSession();

      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in";
      }
    }

    return Promise.reject(error);
  },
);
