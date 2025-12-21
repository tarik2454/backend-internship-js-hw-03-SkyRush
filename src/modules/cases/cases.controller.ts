import { Request, Response } from "express";
import {
  CasesResponse,
  CaseDetailsResponse,
  OpenCaseResponse,
} from "./cases.types";
import { HydratedDocument } from "mongoose";
import { IUser } from "../users/users.types";
import casesService from "./cases.service";
import { ctrlWrapper } from "../../decorators/index";
import { AuthenticatedRequest } from "../../types";
import { OpenCaseDTO } from "./cases.schema";

const getAllCases = async (
  _req: Request,
  res: Response<CasesResponse>
): Promise<void> => {
  const result = await casesService.getAllCases();
  res.json(result);
};

const getCaseById = async (
  req: Request,
  res: Response<CaseDetailsResponse>
): Promise<void> => {
  const { id } = req.params;
  const result = await casesService.getCaseById(id);
  res.json(result);
};

const openCase = async (
  req: AuthenticatedRequest<{ id: string }, Record<string, never>, OpenCaseDTO>,
  res: Response<OpenCaseResponse>
): Promise<void> => {
  const { id } = req.params;
  const { clientSeed } = req.body;
  const user = req.user as HydratedDocument<IUser>;

  const result = await casesService.openCase(user, id, clientSeed);
  res.json(result);
};

export default {
  getAllCases: ctrlWrapper(getAllCases),
  getCaseById: ctrlWrapper(getCaseById),
  openCase: ctrlWrapper(openCase),
};
