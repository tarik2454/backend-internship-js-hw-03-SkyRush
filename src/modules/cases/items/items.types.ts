import { Document, Types } from "mongoose";

export interface IItem extends Document {
  name: string;
  rarityId: Types.ObjectId;
  imageUrl: string;
  value: number;
  createdAt: Date;
}
