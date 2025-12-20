import { Request, Response, NextFunction } from "express";

type ControllerFunction<Req extends Request = Request> = (
  req: Req,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export const ctrlWrapper = <Req extends Request = Request>(
  ctrl: ControllerFunction<Req>
) => {
  const func = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Приводим req к ожидаемому типу контроллера (Req)
      // Это безопасно, так как Express передает объект запроса, который мы расширяем
      await ctrl(req as Req, res, next);
    } catch (err) {
      next(err);
    }
  };

  return func;
};
