import mongoose, { HydratedDocument, Types } from "mongoose";
import { IUser } from "../users/models/users.types";
import {
  BetCrashResponse,
  CashoutCrashResponse,
  GetCrashHistoryResponse,
  GetCurrentCrashResponse,
  GetBetHistoryResponse,
  CrashBetHistory,
} from "./crash.types";
import { HttpError } from "../../helpers";
import { CrashGame } from "./models/crash-games/crash-games.model";
import { CrashBet } from "./models/crash-bets/crash-bets.model";
import { ICrashGame } from "./models/crash-games/crash-games.types";
import auditService from "../audit/audit.service";
import crashManager, { CrashState } from "./crash.manager";

class CrashService {
  async betCrash(
    user: HydratedDocument<IUser>,
    amount: number,
    autoCashout?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<BetCrashResponse> {
    if (amount < 0.1 || amount > 10000) {
      throw HttpError(400, "Bet amount must be between 0.10 and 10000");
    }

    if (
      autoCashout !== undefined &&
      (autoCashout < 1.0 || autoCashout > 1000)
    ) {
      throw HttpError(
        400,
        "Auto cashout multiplier must be between 1.00 and 1000"
      );
    }

    // Find current game in waiting state
    // Note: Games are created by CrashManager, which also manages timers
    const currentGame = await CrashGame.findOne({
      status: "waiting",
    }).sort({ createdAt: -1 });

    if (!currentGame) {
      // No waiting game found - CrashManager should create games
      throw HttpError(503, "No game available. Please try again in a moment.");
    }

    // Explicitly check that game is in waiting state
    if (currentGame.status !== "waiting") {
      throw HttpError(400, "Bets can only be placed during the waiting phase");
    }

    // Check if user already has an active bet in this game
    const existingBet = await CrashBet.findOne({
      gameId: currentGame._id,
      userId: user._id,
      status: "active",
    });

    if (existingBet) {
      throw HttpError(400, "You already have an active bet in this game");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const oldBalance = user.balance;
      const oldTotalWagered = user.totalWagered || 0;

      // Deduct bet amount from user balance
      const updatedUser = await mongoose.model("User").findOneAndUpdate(
        {
          _id: user._id,
          balance: { $gte: amount },
        },
        {
          $inc: {
            balance: -amount,
            totalWagered: amount,
            gamesPlayed: 1,
          },
        },
        {
          session,
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        throw HttpError(400, "Insufficient balance");
      }

      // Create bet
      const bet = await CrashBet.create(
        [
          {
            gameId: currentGame._id,
            userId: user._id,
            amount,
            autoCashout,
            status: "active",
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Log audit
      auditService
        .log({
          userId: user._id,
          action: "BET",
          entityType: "CrashBet" as const,
          entityId: bet[0]._id,
          oldValue: {
            balance: oldBalance,
            totalWagered: oldTotalWagered,
            gamesPlayed: (user.gamesPlayed || 0) - 1,
          },
          newValue: {
            balance: updatedUser.balance,
            totalWagered: updatedUser.totalWagered,
            gamesPlayed: updatedUser.gamesPlayed,
            gameId: currentGame._id.toString(),
            betId: bet[0]._id.toString(),
            amount,
            autoCashout,
          },
          ipAddress,
          userAgent,
        })
        .catch((err) => {
          console.error("Audit log failed:", err);
        });

      return {
        betId: bet[0]._id.toString(),
        amount,
        gameId: currentGame._id.toString(),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cashoutCrash(
    user: HydratedDocument<IUser>,
    betId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<CashoutCrashResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find active bet
      const bet = await CrashBet.findOne({
        _id: betId,
        userId: user._id,
        status: "active",
      }).session(session);

      if (!bet) {
        throw HttpError(404, "Active bet not found");
      }

      // Find game
      const game = await CrashGame.findById(bet.gameId).session(session);

      if (!game) {
        throw HttpError(404, "Game not found");
      }

      if (game.status !== "running") {
        throw HttpError(400, "Game is not in running state");
      }

      // Get current multiplier from game state (this should come from WebSocket/state management)
      // For now, we'll calculate it based on elapsed time
      // In a real implementation, this should come from the running game state
      const currentMultiplier = await this.getCurrentMultiplier(game);

      if (!currentMultiplier || currentMultiplier < 1.0) {
        throw HttpError(400, "Invalid multiplier");
      }

      const winAmount = Math.round(bet.amount * currentMultiplier * 100) / 100;
      const oldBalance = user.balance;
      const oldTotalWon = user.totalWon || 0;

      // Update bet
      const updatedBet = await CrashBet.findByIdAndUpdate(
        bet._id,
        {
          $set: {
            cashoutMultiplier: currentMultiplier,
            winAmount,
            status: "won",
          },
        },
        {
          session,
          new: true,
        }
      );

      if (!updatedBet) {
        throw HttpError(500, "Failed to update bet");
      }

      // Add win amount to user balance
      const updatedUser = await mongoose.model("User").findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $inc: {
            balance: winAmount,
            totalWon: winAmount,
          },
        },
        {
          session,
          new: true,
          runValidators: true,
        }
      );

      if (!updatedUser) {
        throw HttpError(500, "Failed to update user balance");
      }

      await session.commitTransaction();

      // Log audit
      auditService
        .log({
          userId: user._id,
          action: "CASHOUT",
          entityType: "CrashBet" as const,
          entityId: bet._id,
          oldValue: {
            balance: oldBalance,
            totalWon: oldTotalWon,
            status: "active",
          },
          newValue: {
            balance: updatedUser.balance,
            totalWon: updatedUser.totalWon,
            status: "won",
            multiplier: currentMultiplier,
            winAmount,
          },
          ipAddress,
          userAgent,
        })
        .catch((err) => {
          console.error("Audit log failed:", err);
        });

      return {
        multiplier: currentMultiplier,
        winAmount,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async getCurrentMultiplier(game: ICrashGame): Promise<number | null> {
    const managerState = crashManager.getState();
    if (
      managerState.gameId === game._id.toString() &&
      managerState.state === CrashState.RUNNING
    ) {
      return managerState.multiplier;
    }

    if (game.status !== "running" || !game.startedAt) {
      return null;
    }

    const elapsed = Math.max(0, Date.now() - game.startedAt.getTime());
    // Use the same formula as in CrashManager for consistency if not currently active in memory
    const multiplier = Math.pow(1.0024, elapsed / 100);
    return Math.max(1.0, Math.floor(multiplier * 100) / 100);
  }

  async getCrashHistory(
    _user: HydratedDocument<IUser>,
    limit: number,
    offset: number
  ): Promise<GetCrashHistoryResponse> {
    const games = await CrashGame.find({
      status: "crashed",
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .select("_id crashPoint serverSeedHash serverSeed")
      .lean();

    return {
      games: games.map((game) => ({
        gameId: game._id.toString(),
        crashPoint: game.crashPoint,
        hash: game.serverSeedHash,
        seed: game.serverSeed,
      })),
    };
  }

  async getCurrentCrash(
    user?: HydratedDocument<IUser>
  ): Promise<GetCurrentCrashResponse> {
    // Find current game (waiting or running)
    const currentGame = await CrashGame.findOne({
      status: { $in: ["waiting", "running"] },
    }).sort({ createdAt: -1 });

    if (!currentGame) {
      throw HttpError(404, "No active game found");
    }

    // Get current multiplier if game is running
    let multiplier: number | undefined;
    if (currentGame.status === "running" && currentGame.startedAt) {
      multiplier = (await this.getCurrentMultiplier(currentGame)) || undefined;
    }

    // Find user's bet if user is provided
    let myBet: { betId: string; amount: number } | undefined;
    if (user) {
      const userBet = await CrashBet.findOne({
        gameId: currentGame._id,
        userId: user._id,
        status: "active",
      });

      if (userBet) {
        myBet = {
          betId: userBet._id.toString(),
          amount: userBet.amount,
        };
      }
    }

    return {
      gameId: currentGame._id.toString(),
      state: currentGame.status,
      multiplier,
      serverSeedHash: currentGame.serverSeedHash,
      bets: [],
      myBet,
    };
  }

  async getUserBetHistory(
    user: HydratedDocument<IUser>,
    limit: number,
    offset: number
  ): Promise<GetBetHistoryResponse> {
    const bets = await CrashBet.find({
      userId: user._id,
      status: { $in: ["won", "lost"] },
    })
      .populate("gameId", "crashPoint")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    const betsHistory: CrashBetHistory[] = bets.map((bet) => {
      const game = bet.gameId as unknown;
      let crashPoint = 0;

      if (game && typeof game === "object" && "crashPoint" in game) {
        crashPoint = (game as { crashPoint: number }).crashPoint;
      }

      return {
        betId: bet._id.toString(),
        gameId:
          bet.gameId instanceof Types.ObjectId
            ? bet.gameId.toString()
            : typeof bet.gameId === "object" &&
              bet.gameId !== null &&
              "_id" in bet.gameId
            ? String((bet.gameId as { _id: unknown })._id)
            : String(bet.gameId),
        amount: bet.amount,
        cashoutMultiplier: bet.cashoutMultiplier,
        winAmount: bet.winAmount,
        status: bet.status as "won" | "lost",
        crashPoint,
        createdAt: bet.createdAt,
      };
    });

    return {
      bets: betsHistory,
    };
  }
}

export default new CrashService();
