import express from "express";
import userController from "./users.controller";
import { validateBody } from "../../decorators/index";
import { userUpdateSchema } from "./users.schema";
import { authenticate } from "../../middlewares/index";

const userRouter = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить всех пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   gamesPlayed:
 *                     type: number
 *                   balance:
 *                     type: number
 *       401:
 *         description: Не авторизован
 */
userRouter.get("/", authenticate, userController.getAllUsers);

/**
 * @swagger
 * /users/current:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о текущем пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 */
userRouter.get("/current", authenticate, userController.getCurrent);

/**
 * @swagger
 * /users/update:
 *   patch:
 *     summary: Обновить данные пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *               balance:
 *                 type: number
 *               totalWagered:
 *                 type: number
 *               gamesPlayed:
 *                 type: number
 *               totalWon:
 *                 type: number
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Неверный формат данных
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
userRouter.patch(
  "/update",
  authenticate,
  validateBody(userUpdateSchema),
  userController.updateUser
);

export { userRouter };
