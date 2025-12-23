import { Schema, model } from "mongoose";
import { IItem } from "./items.types";

const itemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true },
    rarityId: { type: Schema.Types.ObjectId, ref: "Rarity", required: true },
    imageUrl: { type: String, required: true },
    value: { type: Number, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Item = model<IItem>("Item", itemSchema);

