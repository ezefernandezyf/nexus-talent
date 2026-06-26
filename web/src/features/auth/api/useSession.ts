import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api-client";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface SessionResponse {
  user: AuthUser;
  isAdmin: boolean;
}

export function useSession() {
  return useQuery<SessionResponse | null>({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const response = await apiClient.get<SessionResponse>("/auth/me");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
