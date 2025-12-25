import { Request } from "express";
import { IUser } from "../modules/users/models/users.types";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { HydratedDocument } from "mongoose";

export interface RequestWithUser<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: IUser;
}

export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user: HydratedDocument<IUser>;
  ip: string;
  userAgent: string;
}

export type AuthBodyRequest<Body> = AuthenticatedRequest<
  Record<string, never>,
  unknown,
  Body
>;

export interface HttpErrorWithStatus extends Error {
  status: number;
}

export interface ExpressError extends Error {
  status?: number;
  statusCode?: number;
}
