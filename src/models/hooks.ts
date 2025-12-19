import {
  Error as MongooseError,
  HydratedDocument,
  Query,
  Document,
} from "mongoose";

interface MongooseErrorWithCode extends MongooseError {
  code?: number;
  status?: number;
}

export function handleSaveError(
  err: MongooseErrorWithCode,
  _doc: HydratedDocument<unknown>,
  next: (error?: Error) => void
): void {
  const { name, code } = err;
  err.status = name === "MongoServerError" && code === 11000 ? 409 : 400;
  next();
}

export function handleFindOneAndUpdateError(
  err: MongooseErrorWithCode,
  _doc: Document | null,
  next: (error?: Error) => void
): void {
  const { name, code } = err;
  err.status = name === "MongoServerError" && code === 11000 ? 409 : 400;
  next();
}

export function preUpdate(
  this: Query<unknown, HydratedDocument<unknown>>,
  next: (error?: Error) => void
): void {
  this.setOptions({ new: true, runValidators: true });
  next();
}
