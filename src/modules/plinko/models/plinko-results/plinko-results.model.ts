import { Schema, model } from "mongoose";
import { IPlinkoResult } from "./plinko-results.types";

const plinkoResultSchema = new Schema<IPlinkoResult>(
  {
    dropId: { type: Schema.Types.ObjectId, ref: "PlinkoDrop", required: true },
    ballIndex: { type: Number, required: true },
    path: { type: [Number], required: true },
    slotIndex: { type: Number, required: true },
    multiplier: { type: Number, required: true },
    winAmount: { type: Number, required: true },
    serverSeed: { type: String, required: true },
    clientSeed: { type: String, required: true },
    nonce: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false }
);

plinkoResultSchema.index({ dropId: 1 });

export const PlinkoResult = model<IPlinkoResult>(
  "PlinkoResult",
  plinkoResultSchema
);

