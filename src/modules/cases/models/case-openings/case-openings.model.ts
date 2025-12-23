import { Schema, model } from "mongoose";
import { ICaseOpening } from "./case-openings.types";

const caseOpeningSchema = new Schema<ICaseOpening>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: "Case", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    rollValue: { type: Number, required: true },
    serverSeed: { type: String, required: true },
    clientSeed: { type: String, required: true },
    nonce: { type: Number, required: true },
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

caseOpeningSchema.index({ userId: 1, createdAt: -1 });

export const CaseOpening = model<ICaseOpening>(
  "CaseOpening",
  caseOpeningSchema
);

