// Server → Client events
export interface GameStartEvent {
  gameId: string;
  serverSeedHash: string;
}

export interface GameTickEvent {
  multiplier: number;
  elapsed: number;
}

export interface GameCrashEvent {
  crashPoint: number;
  serverSeed: string;
  reveal: string;
}

// Client → Server events
export interface BetPlaceEvent {
  amount: number;
  autoCashout?: number;
}

export interface BetCashoutEvent {
  betId: string;
}

