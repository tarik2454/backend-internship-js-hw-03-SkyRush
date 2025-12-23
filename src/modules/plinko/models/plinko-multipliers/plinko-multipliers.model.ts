import { Schema, model } from "mongoose";
import { IPlinkoMultiplier } from "./plinko-multipliers.types";

const plinkoMultiplierSchema = new Schema<IPlinkoMultiplier>(
  {
    lines: { type: Number, required: true },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    slotIndex: { type: Number, required: true },
    multiplier: { type: Number, required: true },
  },
  { timestamps: false, versionKey: false }
);

plinkoMultiplierSchema.index(
  { lines: 1, riskLevel: 1, slotIndex: 1 },
  { unique: true }
);

export const PlinkoMultiplier = model<IPlinkoMultiplier>(
  "PlinkoMultiplier",
  plinkoMultiplierSchema
);

