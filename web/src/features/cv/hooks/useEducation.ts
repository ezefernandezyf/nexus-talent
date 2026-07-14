import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EducationCreateDTO, EducationDTO, EducationUpdateDTO } from "@nexus-talent/shared";
import { createEducation, deleteEducation, listEducation, updateEducation } from "@/features/cv/api/cv-repository";

const EDUCATION_KEY = ["cv", "education"] as const;

export function useEducation() {
  const queryClient = useQueryClient();

  const query = useQuery<EducationDTO[]>({
    queryKey: EDUCATION_KEY,
    queryFn: listEducation,
  });

  const createMutation = useMutation<EducationDTO, Error, EducationCreateDTO>({
    mutationFn: createEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEY });
    },
  });

  const updateMutation = useMutation<EducationDTO, Error, { id: string; data: EducationUpdateDTO }>(
    {
      mutationFn: ({ id, data }) => updateEducation(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: EDUCATION_KEY });
      },
    },
  );

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteEducation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEY });
    },
  });

  return {
    ...query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
