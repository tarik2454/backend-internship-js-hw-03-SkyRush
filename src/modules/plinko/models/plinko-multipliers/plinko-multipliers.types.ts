import { Document } from "mongoose";

export interface IPlinkoMultiplier extends Document {
  lines: number;
  riskLevel: "low" | "medium" | "high";
  slotIndex: number;
  multiplier: number;
}

