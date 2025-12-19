import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  token?: string;
  balance: number;
  totalWagered: number;
  gamesPlayed: number;
  totalWon: number;
}

export interface RequestWithUser extends Request {
  user?: IUser;
}

export interface HttpErrorWithStatus extends Error {
  status: number;
}

export interface ExpressError extends Error {
  status?: number;
  statusCode?: number;
}

