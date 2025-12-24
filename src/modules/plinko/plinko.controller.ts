import { Response } from "express";
import { AuthenticatedRequest } from "../../types";
import { ctrlWrapper } from "../../decorators";
import * as plinkoService from "./plinko.service";
import {
  DropPlinkoDTO,
  GetMultipliersDTO,
  GetHistoryDTO,
} from "./plinko.schema";

const dropPlinko = async (req: AuthenticatedRequest, res: Response) => {
  const result = await plinkoService.processDrop(
    req.user._id,
    req.body as DropPlinkoDTO
  );
  res.json(result);
};

const getMultipliers = async (req: AuthenticatedRequest, res: Response) => {
  const { risk, lines } = req.query as unknown as GetMultipliersDTO;
  const multipliers = plinkoService.getMultipliersList(lines, risk);
  res.json({ multipliers });
};

const getHistory = async (req: AuthenticatedRequest, res: Response) => {
  let { limit = 10, offset = 0 } = req.query as unknown as GetHistoryDTO;

  limit = Math.min(Number(limit), 10);
  offset = Math.max(Number(offset), 0);

  const result = await plinkoService.getUserHistory(
    req.user._id,
    limit,
    offset
  );
  res.json(result);
};

const getRecent = async (_req: AuthenticatedRequest, res: Response) => {
  const result = await plinkoService.getRecentDrops();
  res.json(result);
};

export default {
  dropPlinko: ctrlWrapper(dropPlinko),
  getMultipliers: ctrlWrapper(getMultipliers),
  getHistory: ctrlWrapper(getHistory),
  getRecent: ctrlWrapper(getRecent),
};
