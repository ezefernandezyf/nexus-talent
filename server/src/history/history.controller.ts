import type { Request, Response, NextFunction } from "express";
import * as historyService from "./history.service.js";
import { AppError } from "../infra/error-handler.js";

// ============================================================================
// GET /api/analyses
// ============================================================================

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await historyService.getAll(req.userId!);
    res.status(200).json({ items, total: items.length });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// GET /api/analyses/:id
// ============================================================================

export async function detail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const analysis = await historyService.getById(req.userId!, String(req.params.id));
    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DELETE /api/analyses/:id
// ============================================================================

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await historyService.remove(req.userId!, String(req.params.id));
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// PATCH /api/analyses/:id
// ============================================================================

export async function patch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const analysis = await historyService.update(req.userId!, String(req.params.id), req.body);
    res.status(200).json(analysis);
  } catch (error) {
    next(error);
  }
}
