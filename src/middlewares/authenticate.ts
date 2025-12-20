import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { User } from "../modules/users/users.model";
import { HttpError } from "../helpers/index";
import { RequestWithUser } from "../types";

const { JWT_SECRET } = process.env;

export const authenticate = async (
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    next(HttpError(401));
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET as string) as { id: string };
    const user = await User.findById(payload.id);
    if (!user || !user.token || user.token !== token) {
      next(HttpError(401));
      return;
    }
    req.user = user;
    next();
  } catch {
    next(HttpError(401));
  }
};
