import { Document, Types } from "mongoose";

export interface ICaseOpening extends Document {
  caseId: Types.ObjectId;
  userId: Types.ObjectId;
  itemId: Types.ObjectId;
  rollValue: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  createdAt: Date;
}
