import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../helpers/index';
import { User } from '../models/User';
import { RequestWithUser } from '../types';

const { JWT_SECRET } = process.env;

const authenticate = async (
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const { authorization = '' } = req.headers;
  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    return next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET as string) as { id: string };
    const user = await User.findById(id);
    if (!user || !user.token) {
      return next(HttpError(401));
    }

    req.user = user;
    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unauthorized';
    next(HttpError(401, errorMessage));
  }
};

export default authenticate;

