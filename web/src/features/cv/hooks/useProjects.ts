import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, deleteProject, listProjects, updateProject } from "@/features/cv/api/cv-repository";
import type { ProjectCreateDTO, ProjectDTO, ProjectUpdateDTO } from "@nexus-talent/shared";

/**
 * Query key for projects cache.
 * Invalidated on every CRUD mutation to keep the list fresh.
 */
const PROJECTS_KEY = ["cv", "projects"] as const;

/**
 * React Query hook for Projects CRUD.
 *
 * Returns the query result (with `data` as `ProjectDTO[]`) plus
 * `createMutation`, `updateMutation`, and `deleteMutation`.
 *
 * Usage:
 * ```ts
 * const { data: projects, isLoading, createMutation } = useProjects();
 * await createMutation.mutateAsync({ name: "My App", ... });
 * ```
 */
export function useProjects() {
  const queryClient = useQueryClient();

  const query = useQuery<ProjectDTO[]>({
    queryKey: PROJECTS_KEY,
    queryFn: listProjects,
  });

  const createMutation = useMutation<ProjectDTO, Error, ProjectCreateDTO>({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });

  const updateMutation = useMutation<
    ProjectDTO,
    Error,
    { id: string; data: ProjectUpdateDTO }
  >({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });

  return {
    ...query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
