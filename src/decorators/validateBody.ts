import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { HttpError } from "../helpers/index";

export const validateBody = (schema: z.ZodTypeAny) => {
  const func = (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error as ZodError;

      const errorMessage = error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(HttpError(400, errorMessage));
    }
    next();
  };
  return func;
};

export const validateQuery = (schema: z.ZodTypeAny) => {
  const func = (req: Request, _res: Response, next: NextFunction): void => {
    const normalizedQuery: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(req.query)) {
      normalizedQuery[key] = Array.isArray(value) ? value[0] : value;
    }

    const result = schema.safeParse(normalizedQuery);

    if (!result.success) {
      const error = result.error as ZodError;

      const errorMessage = error.issues
        .map((issue) => issue.message)
        .join(", ");
      return next(HttpError(400, errorMessage));
    }

    req.query = result.data as unknown as typeof req.query;
    next();
  };
  return func;
};
