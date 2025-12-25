import { CrashGame } from "./models/crash-games/crash-games.model";
import { CrashBet } from "./models/crash-bets/crash-bets.model";
import { ICrashBet } from "./models/crash-bets/crash-bets.types";
import crashWebSocketHandler from "./crash.ws.handler";
import {
  generateServerSeed,
  hashServerSeed,
  generateCrashPoint,
} from "./crash.utils";
import mongoose from "mongoose";

export enum CrashState {
  WAITING = "waiting",
  RUNNING = "running",
  CRASHED = "crashed",
}

class CrashManager {
  private currentState: CrashState = CrashState.WAITING;
  private currentMultiplier = 1.0;
  private currentGameId: string | null = null;
  private startedAt: number | null = null;
  private crashPoint = 0;
  private tickInterval: NodeJS.Timeout | null = null;
  private waitingTimeout: NodeJS.Timeout | null = null;
  private isStopped = false; // Flag to stop the game cycle

  private WAITING_TIME = 10000; // 10 seconds
  private TICK_RATE = 100; // 100ms

  async initialize() {
    console.log("Initializing Crash Manager...");
    const activeGame = await CrashGame.findOne({
      status: { $in: [CrashState.WAITING, CrashState.RUNNING] },
    }).sort({ createdAt: -1 });

    if (activeGame) {
      this.currentGameId = activeGame._id.toString();
      this.crashPoint = activeGame.crashPoint;

      if (activeGame.status === CrashState.RUNNING && activeGame.startedAt) {
        this.currentState = CrashState.RUNNING;
        this.startedAt = activeGame.startedAt.getTime();
        this.resumeGame();
      } else {
        // Game is in WAITING state - calculate remaining wait time
        const gameAge = Date.now() - activeGame.createdAt.getTime();
        const remainingTime = Math.max(0, this.WAITING_TIME - gameAge);

        if (remainingTime <= 0) {
          // Game should have started already - start it now
          this.startGame();
        } else {
          // Start timer with remaining time
          this.startWaitingTimer(remainingTime);
        }
      }
    } else {
      await this.createNewGame();
    }
  }

  private async createNewGame() {
    const serverSeed = generateServerSeed();
    const serverSeedHash = hashServerSeed(serverSeed);
    const clientSeed = generateServerSeed();
    const nonce = Math.floor(Math.random() * 1000000);
    const crashPoint = generateCrashPoint(serverSeed, clientSeed, nonce);

    // Don't create new game if stopped
    if (this.isStopped) {
      console.log("Game cycle is stopped, not creating new game");
      return;
    }

    const game = await CrashGame.create({
      crashPoint,
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      status: CrashState.WAITING,
    });

    this.currentGameId = game._id.toString();
    this.crashPoint = crashPoint;
    this.currentState = CrashState.WAITING;
    this.currentMultiplier = 1.0;

    if (this.currentGameId) {
      crashWebSocketHandler.emitGameStart(this.currentGameId, serverSeedHash);
    }
    this.startWaitingTimer();
  }

  private startWaitingTimer(customTime?: number) {
    if (this.waitingTimeout) clearTimeout(this.waitingTimeout);
    const waitTime = customTime ?? this.WAITING_TIME;
    this.waitingTimeout = setTimeout(() => this.startGame(), waitTime);
  }

  private async startGame() {
    if (!this.currentGameId) return;

    this.currentState = CrashState.RUNNING;
    this.startedAt = Date.now();

    await CrashGame.findByIdAndUpdate(this.currentGameId, {
      status: CrashState.RUNNING,
      startedAt: new Date(this.startedAt),
    });

    this.tick();
  }

  private resumeGame() {
    this.tick();
  }

  private tick() {
    if (this.tickInterval) clearTimeout(this.tickInterval);

    const tickFn = async () => {
      if (!this.startedAt || this.currentState !== CrashState.RUNNING) return;

      const elapsed = Date.now() - this.startedAt;
      this.currentMultiplier = this.calculateMultiplier(elapsed);

      if (this.currentMultiplier >= this.crashPoint) {
        await this.crash();
        return;
      }

      crashWebSocketHandler.emitGameTick(this.currentMultiplier, elapsed);
      await this.checkAutoCashout();

      // Schedule next tick
      this.tickInterval = setTimeout(tickFn, this.TICK_RATE);
    };

    this.tickInterval = setTimeout(tickFn, this.TICK_RATE);
  }

  private calculateMultiplier(elapsedMs: number): number {
    // Exponential formula: 1.0024 ^ (ms / 100)
    const multiplier = Math.pow(1.0024, elapsedMs / 100);
    return Math.floor(multiplier * 100) / 100;
  }

  private async checkAutoCashout() {
    if (!this.currentGameId) return;

    const betsToCashout = await CrashBet.find({
      gameId: this.currentGameId,
      status: "active",
      autoCashout: { $lte: this.currentMultiplier, $ne: null },
    });

    for (const bet of betsToCashout) {
      try {
        // We'll use the autoCashout value as the multiplier for fairness
        if (bet.autoCashout === undefined || bet.autoCashout === null) {
          continue;
        }
        const multiplier = bet.autoCashout;
        await this.processCashout(bet, multiplier);
      } catch (error) {
        console.error("Auto cashout failed for bet:", bet._id, error);
      }
    }
  }

  private async processCashout(bet: ICrashBet, multiplier: number) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const winAmount = Math.round(bet.amount * multiplier * 100) / 100;

      await CrashBet.findByIdAndUpdate(
        bet._id,
        {
          $set: {
            cashoutMultiplier: multiplier,
            winAmount,
            status: "won",
          },
        },
        { session }
      );

      await mongoose.model("User").findByIdAndUpdate(
        bet.userId,
        {
          $inc: {
            balance: winAmount,
            totalWon: winAmount,
          },
        },
        { session }
      );

      await session.commitTransaction();
      crashWebSocketHandler.emitPlayerCashout(
        bet.userId.toString(),
        multiplier,
        winAmount
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async crash() {
    if (this.tickInterval) {
      if (this.tickInterval instanceof Object) {
        clearTimeout(this.tickInterval);
      } else {
        clearInterval(this.tickInterval);
      }
    }
    this.currentState = CrashState.CRASHED;

    const game = await CrashGame.findById(this.currentGameId);
    if (!game) return;

    await CrashGame.findByIdAndUpdate(this.currentGameId, {
      status: CrashState.CRASHED,
      crashedAt: new Date(),
    });

    // Mark remaining bets as lost
    await CrashBet.updateMany(
      { gameId: this.currentGameId, status: "active" },
      { $set: { status: "lost" } }
    );

    crashWebSocketHandler.emitGameCrash(
      this.crashPoint,
      game.serverSeed,
      game.serverSeed // Use serverSeed as reveal
    );

    // Only create new game if not stopped
    if (!this.isStopped) {
      setTimeout(() => this.createNewGame(), 3000);
    }
  }

  public getState() {
    return {
      state: this.currentState,
      multiplier: this.currentMultiplier,
      gameId: this.currentGameId,
      startedAt: this.startedAt,
    };
  }

  /**
   * Stop the game cycle - stops timers and prevents new games from being created
   */
  public stop(): void {
    console.log("Stopping Crash Manager...");
    this.isStopped = true;

    // Clear waiting timer
    if (this.waitingTimeout) {
      clearTimeout(this.waitingTimeout);
      this.waitingTimeout = null;
    }

    // Clear tick interval
    if (this.tickInterval) {
      clearTimeout(this.tickInterval);
      this.tickInterval = null;
    }
  }

  /**
   * Start the game cycle - initializes and starts the game
   */
  public start(): void {
    console.log("Starting Crash Manager...");
    this.isStopped = false;
    this.initialize();
  }
}

export default new CrashManager();
