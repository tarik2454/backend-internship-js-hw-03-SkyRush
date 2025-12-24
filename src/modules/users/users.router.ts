import express from "express";
import userController from "./users.controller";
import { validateBody } from "../../decorators/index";
import { userUpdateSchema } from "./users.schema";
import { authenticate } from "../../middlewares/index";

const userRouter = express.Router();

userRouter.get("/", authenticate, userController.getAllUsers);

userRouter.get("/current", authenticate, userController.getCurrent);

userRouter.patch(
  "/update",
  authenticate,
  validateBody(userUpdateSchema),
  userController.updateUser
);

export { userRouter };
