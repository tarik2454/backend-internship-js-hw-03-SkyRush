import { Response } from "express";
import { ctrlWrapper } from "../../decorators";
import { AuthenticatedRequest } from "../../types";
import leaderboardService from "./leaderboard.service";
import { PeriodType } from "./leaderboard.types";

const getLeaderboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const period = (req.query.period as PeriodType) || "all";

  if (!["daily", "weekly", "monthly", "all"].includes(period)) {
    res.status(400).json({ message: "Invalid period. Use: daily, weekly, monthly, all" });
    return;
  }

  const leaderboard = await leaderboardService.getLeaderboard(
    period,
    req.user?._id
  );

  res.json(leaderboard);
};

export default {
  getLeaderboard: ctrlWrapper(getLeaderboard),
};

