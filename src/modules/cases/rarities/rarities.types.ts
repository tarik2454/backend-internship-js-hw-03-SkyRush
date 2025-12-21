import { Document } from "mongoose";

export interface IRarity extends Document {
  name: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Gold";
  color: string;
  chance: number;
}
