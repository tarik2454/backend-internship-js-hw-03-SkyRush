import express from "express";
import {
  authenticate,
  collectRequestInfo,
  generalLimiter,
} from "../../middlewares/index";
import claimBonusController from "./bonus.controller";

const claimBonusRouter = express.Router();

claimBonusRouter.get(
  "/status",
  authenticate,
  generalLimiter,
  claimBonusController.getStatus
);

claimBonusRouter.post(
  "/claim",
  authenticate,
  collectRequestInfo,
  generalLimiter,
  claimBonusController.claimBonus
);

export { claimBonusRouter };
