import express from "express";
import { authenticate, generalLimiter } from "../../middlewares";
import auditController from "./audit.controller";

const auditRouter = express.Router();

auditRouter.get(
  "/",
  authenticate,
  generalLimiter,
  auditController.getAuditLogs
);

export { auditRouter };
//
