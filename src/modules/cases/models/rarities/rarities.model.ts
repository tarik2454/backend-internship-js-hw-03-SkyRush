import { Schema, model } from "mongoose";
import { IRarity } from "./rarities.types";

const raritySchema = new Schema<IRarity>(
  {
    name: { type: String, required: true, unique: true },
    color: { type: String, required: true },
    chance: { type: Number, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Rarity = model<IRarity>("Rarity", raritySchema);

