import { Schema, model } from "mongoose";
import { IPlinkoDrop } from "./plinko-drops.types";

const plinkoDropSchema = new Schema<IPlinkoDrop>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    betAmount: { type: Number, required: true },
    ballsCount: { type: Number, default: 1 },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    linesCount: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false }
);

export const PlinkoDrop = model<IPlinkoDrop>("PlinkoDrop", plinkoDropSchema);

