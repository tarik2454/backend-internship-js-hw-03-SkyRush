import { Request } from "express";
import { IUser } from "../modules/users/users.types";

export interface RequestWithUser extends Request {
  user?: IUser;
}

export interface HttpErrorWithStatus extends Error {
  status: number;
}

export interface ExpressError extends Error {
  status?: number;
  statusCode?: number;
}
