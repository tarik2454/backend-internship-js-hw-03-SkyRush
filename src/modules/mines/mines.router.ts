import express from "express";
import minesController from "./mines.controller";
import { authenticate } from "../../middlewares";
import { validateBody } from "../../decorators";
import {
  startMineSchema,
  revealMineSchema,
  cashoutMineSchema,
} from "./mines.schema";

const minesRouter = express.Router();

/**
 * @swagger
 * /mines/start:
 *   post:
 *     summary: Начать новую игру Mines
 *     description: Создать новую игру Mines с заданными параметрами ставки и количества мин
 *     tags: [Mines]
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
 *               - minesCount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.1
 *                 maximum: 10000
 *                 description: Сумма ставки
 *                 example: 10
 *               minesCount:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 24
 *                 description: Количество мин на поле
 *                 example: 5
 *               clientSeed:
 *                 type: string
 *                 description: Опциональный seed от клиента для честной игры
 *                 example: "my-random-seed"
 *     responses:
 *       201:
 *         description: Игра успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameId:
 *                   type: string
 *                   description: ID созданной игры
 *                 minesCount:
 *                   type: number
 *                 betAmount:
 *                   type: number
 *                 currentMultiplier:
 *                   type: number
 *                 revealedCells:
 *                   type: array
 *                   items:
 *                     type: number
 *       400:
 *         description: Неверные параметры запроса
 *       401:
 *         description: Не авторизован
 */
minesRouter.post(
  "/start",
  authenticate,
  validateBody(startMineSchema),
  minesController.startMine
);

/**
 * @swagger
 * /mines/reveal:
 *   post:
 *     summary: Открыть ячейку на поле
 *     description: Открыть выбранную ячейку в активной игре Mines
 *     tags: [Mines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - position
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: ID активной игры
 *                 example: "507f1f77bcf86cd799439011"
 *               position:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 24
 *                 description: Позиция ячейки (0-24)
 *                 example: 12
 *     responses:
 *       200:
 *         description: Ячейка успешно открыта
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isMine:
 *                   type: boolean
 *                   description: Является ли ячейка миной
 *                 currentMultiplier:
 *                   type: number
 *                   description: Текущий множитель
 *                 gameOver:
 *                   type: boolean
 *                   description: Завершена ли игра
 *                 revealedCells:
 *                   type: array
 *                   items:
 *                     type: number
 *                 balance:
 *                   type: number
 *                   description: Баланс (если игра проиграна)
 *       400:
 *         description: Неверные параметры или игра уже завершена
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Игра не найдена
 */
minesRouter.post(
  "/reveal",
  authenticate,
  validateBody(revealMineSchema),
  minesController.revealMine
);

/**
 * @swagger
 * /mines/cashout:
 *   post:
 *     summary: Забрать выигрыш
 *     description: Завершить игру и забрать текущий выигрыш
 *     tags: [Mines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *             properties:
 *               gameId:
 *                 type: string
 *                 description: ID активной игры
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Выигрыш успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 winAmount:
 *                   type: number
 *                   description: Сумма выигрыша
 *                 balance:
 *                   type: number
 *                   description: Новый баланс
 *                 multiplier:
 *                   type: number
 *                   description: Финальный множитель
 *       400:
 *         description: Игра уже завершена или нет открытых ячеек
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Игра не найдена
 */
minesRouter.post(
  "/cashout",
  authenticate,
  validateBody(cashoutMineSchema),
  minesController.cashoutMine
);

/**
 * @swagger
 * /mines/active:
 *   get:
 *     summary: Получить активную игру
 *     description: Получить информацию о текущей активной игре пользователя
 *     tags: [Mines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Активная игра найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 gameId:
 *                   type: string
 *                 minesCount:
 *                   type: number
 *                 betAmount:
 *                   type: number
 *                 currentMultiplier:
 *                   type: number
 *                 revealedCells:
 *                   type: array
 *                   items:
 *                     type: number
 *                 status:
 *                   type: string
 *                   enum: [active, won, lost]
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Активная игра не найдена
 */
minesRouter.get("/active", authenticate, minesController.activateMine);

/**
 * @swagger
 * /mines/history:
 *   get:
 *     summary: Получить историю игр
 *     description: Получить список завершенных игр пользователя
 *     tags: [Mines]
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
 *                       betAmount:
 *                         type: number
 *                       minesCount:
 *                         type: number
 *                       winAmount:
 *                         type: number
 *                       multiplier:
 *                         type: number
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Не авторизован
 */
minesRouter.get("/history", authenticate, minesController.historyMine);

export { minesRouter };
