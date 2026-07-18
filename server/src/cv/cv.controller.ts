import type { Request, Response, NextFunction } from "express";
import * as cvService from "./cv.service.js";

// ============================================================================
// Work Experience
// ============================================================================

export async function listExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await cvService.listExperience(req.userId!);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.getExperience(req.params.id as string, req.userId!);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.createExperience(req.userId!, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateExperience(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.updateExperience(req.params.id as string, req.userId!, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction) {
  try {
    await cvService.deleteExperience(req.params.id as string, req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// Education
// ============================================================================

export async function listEducation(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await cvService.listEducation(req.userId!);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getEducation(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.getEducation(req.params.id as string, req.userId!);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createEducation(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.createEducation(req.userId!, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateEducation(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.updateEducation(req.params.id as string, req.userId!, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteEducation(req: Request, res: Response, next: NextFunction) {
  try {
    await cvService.deleteEducation(req.params.id as string, req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// Projects
// ============================================================================

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await cvService.listProjects(req.userId!);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.getProject(req.params.id as string, req.userId!);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.createProject(req.userId!, req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await cvService.updateProject(req.params.id as string, req.userId!, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await cvService.deleteProject(req.params.id as string, req.userId!);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ============================================================================
// Generate CV
// ============================================================================

export async function generateCV(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await cvService.generateCV(req.userId!, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
