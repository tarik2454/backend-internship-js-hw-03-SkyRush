import express from "express";
import { authenticate } from "../../middlewares/index";
import leaderboardController from "./leaderboard.controller";

const leaderboardRouter = express.Router();

leaderboardRouter.get("/", authenticate, leaderboardController.getLeaderboard);

export { leaderboardRouter };

