import { HttpErrorWithStatus } from "../types";

const messageList: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
};

export const HttpError = (
  status: number,
  message?: string
): HttpErrorWithStatus => {
  const error = new Error(
    message || messageList[status]
  ) as HttpErrorWithStatus;
  error.status = status;
  return error;
};
