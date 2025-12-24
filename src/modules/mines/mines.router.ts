import express from "express";
import minesController from "./mines.controller";
import { authenticate } from "../../middlewares";
import { validateBody, validateQuery } from "../../decorators";
import {
  startMineSchema,
  revealMineSchema,
  cashoutMineSchema,
  getHistorySchema,
} from "./mines.schema";

const minesRouter = express.Router();

minesRouter.post(
  "/start",
  authenticate,
  validateBody(startMineSchema),
  minesController.startMine
);

minesRouter.post(
  "/reveal",
  authenticate,
  validateBody(revealMineSchema),
  minesController.revealMine
);

minesRouter.post(
  "/cashout",
  authenticate,
  validateBody(cashoutMineSchema),
  minesController.cashoutMine
);

minesRouter.get("/active", authenticate, minesController.activateMine);

minesRouter.get(
  "/history",
  authenticate,
  validateQuery(getHistorySchema),
  minesController.historyMine
);

export { minesRouter };
