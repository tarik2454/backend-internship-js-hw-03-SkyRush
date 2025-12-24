import express from "express";
import authController from "./auth.controller";
import { validateBody } from "../../decorators/index";
import { userSignupSchema, userSigninSchema } from "../users/users.schema";
import { authenticate, collectRequestInfo } from "../../middlewares/index";

const authRouter = express.Router();

authRouter.post(
  "/register",
  validateBody(userSignupSchema),
  authController.signup
);

authRouter.post(
  "/login",
  validateBody(userSigninSchema),
  authController.signin
);

authRouter.post(
  "/logout",
  authenticate,
  collectRequestInfo,
  authController.signout
);

export { authRouter };
