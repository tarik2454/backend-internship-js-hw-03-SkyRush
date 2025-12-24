import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

export const collectRequestInfo = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    (req.headers["x-real-ip"] as string) ||
    req.socket.remoteAddress ||
    req.ip ||
    "unknown";

  const authReq = req as AuthenticatedRequest;
  authReq.ip = ip;
  authReq.userAgent = req.headers["user-agent"] || "unknown";

  next();
};
