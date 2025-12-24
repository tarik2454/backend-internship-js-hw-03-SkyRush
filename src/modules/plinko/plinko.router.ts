import express from "express";
import { authenticate } from "../../middlewares";
import { validateBody, validateQuery } from "../../decorators";
import plinkoController from "./plinko.controller";
import { dropPlinkoSchema, getMultipliersSchema } from "./plinko.schema";

const plinkoRouter = express.Router();

/**
 * @swagger
 * /plinko/drop:
 *   post:
 *     summary: Запустить игру Plinko
 *     description: Бросить шарики в игре Plinko с заданными параметрами
 *     tags: [Plinko]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - balls
 *               - risk
 *               - lines
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 100
 *                 description: Сумма ставки
 *                 example: 10
 *               balls:
 *                 type: number
 *                 enum: [1, 2, 5, 10]
 *                 description: Количество шариков
 *                 example: 5
 *               risk:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Уровень риска
 *                 example: "medium"
 *               lines:
 *                 type: number
 *                 minimum: 8
 *                 maximum: 16
 *                 description: Количество линий (рядов)
 *                 example: 12
 *     responses:
 *       200:
 *         description: Результаты игры
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: array
 *                         items:
 *                           type: string
 *                           enum: [L, R]
 *                       slotIndex:
 *                         type: number
 *                       multiplier:
 *                         type: number
 *                       winAmount:
 *                         type: number
 *                 totalWin:
 *                   type: number
 *                 balance:
 *                   type: number
 *       400:
 *         description: Неверные параметры запроса
 *       401:
 *         description: Не авторизован
 */
plinkoRouter.post(
  "/drop",
  authenticate,
  validateBody(dropPlinkoSchema),
  plinkoController.dropPlinko
);

/**
 * @swagger
 * /plinko/multipliers:
 *   get:
 *     summary: Получить множители для игры
 *     description: Получить массив множителей для заданных параметров риска и количества линий
 *     tags: [Plinko]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: risk
 *         required: true
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Уровень риска
 *         example: "medium"
 *       - in: query
 *         name: lines
 *         required: true
 *         schema:
 *           type: number
 *           minimum: 8
 *           maximum: 16
 *         description: Количество линий
 *         example: 12
 *     responses:
 *       200:
 *         description: Массив множителей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 multipliers:
 *                   type: array
 *                   items:
 *                     type: number
 *                   example: [0.5, 1.2, 2.0, 5.0, 10.0, 5.0, 2.0, 1.2, 0.5]
 *       400:
 *         description: Неверные параметры запроса
 *       401:
 *         description: Не авторизован
 */
plinkoRouter.get(
  "/multipliers",
  authenticate,
  validateQuery(getMultipliersSchema),
  plinkoController.getMultipliers
);

/**
 * @swagger
 * /plinko/history:
 *   get:
 *     summary: Получить историю игр пользователя
 *     description: Получить список предыдущих игр пользователя в Plinko
 *     tags: [Plinko]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Количество записей
 *         example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         description: Смещение для пагинации
 *         example: 0
 *     responses:
 *       200:
 *         description: История игр
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       betAmount:
 *                         type: number
 *                       ballsCount:
 *                         type: number
 *                       riskLevel:
 *                         type: string
 *                       linesCount:
 *                         type: number
 *                       totalWin:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Не авторизован
 */
plinkoRouter.get("/history", authenticate, plinkoController.getHistory);

/**
 * @swagger
 * /plinko/recent:
 *   get:
 *     summary: Получить последние игры всех пользователей
 *     description: Получить список последних игр в Plinko от всех пользователей
 *     tags: [Plinko]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Последние игры
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recent:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       betAmount:
 *                         type: number
 *                       totalWin:
 *                         type: number
 *                       multiplier:
 *                         type: number
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Не авторизован
 */
plinkoRouter.get("/recent", authenticate, plinkoController.getRecent);

export { plinkoRouter };
