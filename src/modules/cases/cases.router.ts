import express from "express";
import casesController from "./cases.controller";
import { authenticate, isValidId } from "../../middlewares/index";
import { validateBody } from "../../decorators/index";
import { openCaseSchema } from "./cases.schema";

const caseRouter = express.Router();

caseRouter.get("/", authenticate, casesController.getAllCases);

caseRouter.get("/:id", authenticate, isValidId, casesController.getCaseById);

caseRouter.post(
  "/:id/open",
  authenticate,
  isValidId,
  validateBody(openCaseSchema),
  casesController.openCase
);

export { caseRouter };
