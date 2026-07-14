import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { WorkExperienceCreateDTO, WorkExperienceDTO, WorkExperienceUpdateDTO } from "@nexus-talent/shared";
import {
  createExperience,
  deleteExperience,
  listExperience,
  updateExperience,
} from "@/features/cv/api/cv-repository";

const EXPERIENCE_KEY = ["cv", "experience"] as const;

export function useExperience() {
  const queryClient = useQueryClient();

  const query = useQuery<WorkExperienceDTO[]>({
    queryKey: EXPERIENCE_KEY,
    queryFn: listExperience,
  });

  const createMutation = useMutation<WorkExperienceDTO, Error, WorkExperienceCreateDTO>({
    mutationFn: createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPERIENCE_KEY });
    },
  });

  const updateMutation = useMutation<
    WorkExperienceDTO,
    Error,
    { id: string; data: WorkExperienceUpdateDTO }
  >({
    mutationFn: ({ id, data }) => updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPERIENCE_KEY });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPERIENCE_KEY });
    },
  });

  return {
    ...query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
