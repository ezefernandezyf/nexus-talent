import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../core/api-client";

interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RegisterInput>({
    mutationFn: async (input) => {
      await apiClient.post("/auth/register", {
        email: input.email.trim(),
        password: input.password,
        displayName: input.displayName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });
}
