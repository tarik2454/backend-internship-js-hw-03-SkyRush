import { Schema, model } from "mongoose";
import { ICaseItem } from "./case-items.types";

const caseItemSchema = new Schema<ICaseItem>(
  {
    caseId: { type: Schema.Types.ObjectId, ref: "Case", required: true },
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    chance: { type: Number, required: true },
  },
  { versionKey: false }
);

caseItemSchema.index({ caseId: 1, itemId: 1 }, { unique: true });

export const CaseItem = model<ICaseItem>("CaseItem", caseItemSchema);

