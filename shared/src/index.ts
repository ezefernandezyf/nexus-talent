export {
  // Auth
  authLoginSchema,
  authRegisterSchema,
  authSessionDTOSchema,
  // Analysis
  analysisRequestSchema,
  analysisResponseSchema,
  GROQ_JOB_ANALYSIS_JSON_SCHEMA,
  // Profile
  profileSchema,
  profileUpdateSchema,
  // User Settings
  userSettingsSchema,
  userSettingsUpdateSchema,
  // History / List
  analysisListSchema,
  // Common
  errorResponseSchema,
  // CV - Experience & Education
  workExperienceSchema,
  workExperienceCreateSchema,
  workExperienceUpdateSchema,
  educationSchema,
  educationCreateSchema,
  educationUpdateSchema,
  // CV - Generation
  cvGenerateRequestSchema,
  cvSectionSchema,
  cvGenerateResponseSchema,
} from "./schemas.js";

export type {
  AuthLoginDTO,
  AuthRegisterDTO,
  AuthSessionDTO,
  AnalysisRequestDTO,
  AnalysisResponseDTO,
  ProfileDTO,
  ProfileUpdateDTO,
  UserSettingsDTO,
  UserSettingsUpdateDTO,
  AnalysisListDTO,
  ErrorResponseDTO,
  // CV - Experience & Education
  WorkExperienceDTO,
  WorkExperienceCreateDTO,
  WorkExperienceUpdateDTO,
  EducationDTO,
  EducationCreateDTO,
  EducationUpdateDTO,
  // CV - Generation
  CVGenerateRequestDTO,
  CVGenerateResponseDTO,
} from "./schemas.js";
