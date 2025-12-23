import { Document, Types } from "mongoose";

export interface IPlinkoResult extends Document {
  dropId: Types.ObjectId;
  ballIndex: number;
  path: number[];
  slotIndex: number;
  multiplier: number;
  winAmount: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  createdAt: Date;
  updatedAt: Date;
}

