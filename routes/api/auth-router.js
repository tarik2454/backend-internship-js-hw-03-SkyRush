const express = require("express");

const authController = require("../../controllers/auth-controller");
const { validateBody } = require("../../decorators/index");
const {
  userSignupSchema,
  userSigninSchema,
} = require("../../schemas/user-schemas");
const { authenticate } = require("../../middlewares/index");

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

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.signout);

module.exports = { authRouter };
