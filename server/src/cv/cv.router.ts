import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validate } from "../infra/validate.js";
import {
  workExperienceCreateSchema,
  workExperienceUpdateSchema,
  educationCreateSchema,
  educationUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  cvGenerateRequestSchema,
} from "../../../shared/src/schemas.js";
import * as controller from "./cv.controller.js";

export const cvRouter = Router();

// ── Work Experience CRUD ─────────────────────────────────────
cvRouter.get("/experience", requireAuth, controller.listExperience);
cvRouter.post("/experience", requireAuth, validate(workExperienceCreateSchema), controller.createExperience);
cvRouter.put("/experience/:id", requireAuth, validate(workExperienceUpdateSchema), controller.updateExperience);
cvRouter.delete("/experience/:id", requireAuth, controller.deleteExperience);

// ── Education CRUD ───────────────────────────────────────────
cvRouter.get("/education", requireAuth, controller.listEducation);
cvRouter.post("/education", requireAuth, validate(educationCreateSchema), controller.createEducation);
cvRouter.put("/education/:id", requireAuth, validate(educationUpdateSchema), controller.updateEducation);
cvRouter.delete("/education/:id", requireAuth, controller.deleteEducation);

// ── Projects CRUD ────────────────────────────────────────────
cvRouter.get("/projects", requireAuth, controller.listProjects);
cvRouter.post("/projects", requireAuth, validate(projectCreateSchema), controller.createProject);
cvRouter.put("/projects/:id", requireAuth, validate(projectUpdateSchema), controller.updateProject);
cvRouter.delete("/projects/:id", requireAuth, controller.deleteProject);

// ── CV Generation (stub — full implementation in PR 2) ───────
cvRouter.post("/generate", requireAuth, validate(cvGenerateRequestSchema), controller.generateCV);
