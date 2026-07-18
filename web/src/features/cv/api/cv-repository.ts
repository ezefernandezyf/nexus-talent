import { apiClient } from "@/core/api-client";
import type {
  WorkExperienceDTO,
  WorkExperienceCreateDTO,
  WorkExperienceUpdateDTO,
  EducationDTO,
  EducationCreateDTO,
  EducationUpdateDTO,
  ProjectDTO,
  ProjectCreateDTO,
  ProjectUpdateDTO,
  CVGenerateRequestDTO,
  CVGenerateResponseDTO,
} from "@nexus-talent/shared";

const BASE = "/cv";

// ---------------------------------------------------------------------------
// Work Experience
// ---------------------------------------------------------------------------

export function listExperience(): Promise<WorkExperienceDTO[]> {
  return apiClient.get<WorkExperienceDTO[]>(`${BASE}/experience`).then((res) => res.data);
}

export function createExperience(data: WorkExperienceCreateDTO): Promise<WorkExperienceDTO> {
  return apiClient.post<WorkExperienceDTO>(`${BASE}/experience`, data).then((res) => res.data);
}

export function updateExperience(id: string, data: WorkExperienceUpdateDTO): Promise<WorkExperienceDTO> {
  return apiClient.put<WorkExperienceDTO>(`${BASE}/experience/${id}`, data).then((res) => res.data);
}

export function deleteExperience(id: string): Promise<void> {
  return apiClient.delete(`${BASE}/experience/${id}`).then(() => undefined);
}

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

export function listEducation(): Promise<EducationDTO[]> {
  return apiClient.get<EducationDTO[]>(`${BASE}/education`).then((res) => res.data);
}

export function createEducation(data: EducationCreateDTO): Promise<EducationDTO> {
  return apiClient.post<EducationDTO>(`${BASE}/education`, data).then((res) => res.data);
}

export function updateEducation(id: string, data: EducationUpdateDTO): Promise<EducationDTO> {
  return apiClient.put<EducationDTO>(`${BASE}/education/${id}`, data).then((res) => res.data);
}

export function deleteEducation(id: string): Promise<void> {
  return apiClient.delete(`${BASE}/education/${id}`).then(() => undefined);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export function listProjects(): Promise<ProjectDTO[]> {
  return apiClient.get<ProjectDTO[]>(`${BASE}/projects`).then((res) => res.data);
}

export function createProject(data: ProjectCreateDTO): Promise<ProjectDTO> {
  return apiClient.post<ProjectDTO>(`${BASE}/projects`, data).then((res) => res.data);
}

export function updateProject(id: string, data: ProjectUpdateDTO): Promise<ProjectDTO> {
  return apiClient.put<ProjectDTO>(`${BASE}/projects/${id}`, data).then((res) => res.data);
}

export function deleteProject(id: string): Promise<void> {
  return apiClient.delete(`${BASE}/projects/${id}`).then(() => undefined);
}

// ---------------------------------------------------------------------------
// CV Generation
// ---------------------------------------------------------------------------

export function generateCV(data: CVGenerateRequestDTO): Promise<CVGenerateResponseDTO> {
  return apiClient.post<CVGenerateResponseDTO>(`${BASE}/generate`, data).then((res) => res.data);
}
