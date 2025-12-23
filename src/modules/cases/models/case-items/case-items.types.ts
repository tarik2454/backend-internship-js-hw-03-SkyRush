import { Document, Types } from "mongoose";

export interface ICaseItem extends Document {
  caseId: Types.ObjectId;
  itemId: Types.ObjectId;
  chance: number;
}

