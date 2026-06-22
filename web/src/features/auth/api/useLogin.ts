import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../core/api-client";
import type { AuthUser } from "./useSession";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  user: AuthUser;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (input) => {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        email: input.email.trim(),
        password: input.password,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });
}
