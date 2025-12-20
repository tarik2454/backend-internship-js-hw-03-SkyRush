import { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  token?: string;
  balance: number;
  totalWagered: number;
  gamesPlayed: number;
  totalWon: number;
  serverSeed?: string;
  clientSeed?: string;
}
