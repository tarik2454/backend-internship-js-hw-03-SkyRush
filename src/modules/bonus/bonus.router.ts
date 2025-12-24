import express from "express";
import { authenticate } from "../../middlewares/index";
import claimBonusController from "./bonus.controller";

const claimBonusRouter = express.Router();

/**
 * @swagger
 * /bonus/status:
 *   get:
 *     summary: Получить статус бонуса
 *     tags: [Bonus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статус бонуса успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BonusStatusResponse'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
claimBonusRouter.get("/status", authenticate, claimBonusController.getStatus);

/**
 * @swagger
 * /bonus/claim:
 *   post:
 *     summary: Забрать бонус
 *     tags: [Bonus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Бонус успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClaimBonusResponse'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Слишком рано для получения следующего бонуса
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
claimBonusRouter.post("/claim", authenticate, claimBonusController.claimBonus);

export { claimBonusRouter };
