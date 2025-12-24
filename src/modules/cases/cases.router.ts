import express from "express";
import casesController from "./cases.controller";
import { authenticate, isValidId } from "../../middlewares/index";
import { validateBody } from "../../decorators/index";
import { openCaseSchema } from "./cases.schema";

const caseRouter = express.Router();

/**
 * @swagger
 * /cases:
 *   get:
 *     summary: Получить список всех кейсов
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список доступных кейсов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       image:
 *                         type: string
 *       401:
 *         description: Не авторизован
 */
caseRouter.get("/", authenticate, casesController.getAllCases);

/**
 * @swagger
 * /cases/{id}:
 *   get:
 *     summary: Получить детальную информацию о кейсе
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID кейса
 *     responses:
 *       200:
 *         description: Детальная информация о кейсе
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       rarity:
 *                         type: string
 *                       value:
 *                         type: number
 *                       chance:
 *                         type: number
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Кейс не найден
 */
caseRouter.get("/:id", authenticate, isValidId, casesController.getCaseById);

/**
 * @swagger
 * /cases/{id}/open:
 *   post:
 *     summary: Открыть кейс
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID кейса для открытия
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientSeed:
 *                 type: string
 *                 description: Опциональный client seed для Provably Fair
 *     responses:
 *       200:
 *         description: Кейс успешно открыт
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 openingId:
 *                   type: string
 *                 item:
 *                   type: object
 *                 serverSeed:
 *                   type: string
 *                 clientSeed:
 *                   type: string
 *                 nonce:
 *                   type: number
 *                 roll:
 *                   type: number
 *                 newBalance:
 *                   type: number
 *                 casePrice:
 *                   type: number
 *                 itemValue:
 *                   type: number
 *       400:
 *         description: Недостаточно баланса или кейс пустой
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Кейс не найден
 */
caseRouter.post(
  "/:id/open",
  authenticate,
  isValidId,
  validateBody(openCaseSchema),
  casesController.openCase
);

export { caseRouter };
