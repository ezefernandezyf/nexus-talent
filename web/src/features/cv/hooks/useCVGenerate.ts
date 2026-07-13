import { useMutation } from "@tanstack/react-query";
import type { CVGenerateRequestDTO, CVGenerateResponseDTO } from "@nexus-talent/shared";
import { generateCV } from "@/features/cv/api/cv-repository";

export function useCVGenerate() {
  return useMutation<CVGenerateResponseDTO, Error, CVGenerateRequestDTO>({
    mutationFn: generateCV,
  });
}
