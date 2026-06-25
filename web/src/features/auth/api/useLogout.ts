import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/core/api-client";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "session"], null);
    },
  });
}
