import express from "express";
import { authenticate } from "../../middlewares";

const minesRouter = express.Router();

minesRouter.get("/start", authenticate, minesController.startMine);

minesRouter.get("/reveal", authenticate, minesController.revealMine);

minesRouter.get("/cashout", authenticate, minesController.cashoutMine);

minesRouter.get("/active", authenticate, minesController.activateMine);

minesRouter.get("/history", authenticate, minesController.historyMine);

export { minesRouter };
