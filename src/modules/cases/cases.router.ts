import express from "express";
import casesController from "./cases.controller";
import { authenticate, isValidId } from "../../middlewares/index";

/**
 * Роутер для маршрутов, связанных с кейсами
 * Определяет все доступные HTTP endpoints для работы с кейсами
 */

const caseRouter = express.Router();

/**
 * GET /api/cases
 * Получает список всех доступных кейсов
 *
 * Middleware:
 * - authenticate - проверяет, что пользователь авторизован (токен валиден)
 *
 * Контроллер: casesController.getAllCases
 */
caseRouter.get("/", authenticate, casesController.getAllCases);

/**
 * GET /api/cases/:id
 * Получает детальную информацию о конкретном кейсе
 *
 * Middleware:
 * - authenticate - проверяет авторизацию пользователя
 * - isValidId - проверяет, что переданный ID является валидным MongoDB ObjectId
 *
 * Параметры:
 * - :id - ID кейса в базе данных
 *
 * Контроллер: casesController.getCaseById
 */
caseRouter.get("/:id", authenticate, isValidId, casesController.getCaseById);

/**
 * POST /api/cases/:id/open
 * Открывает кейс для текущего авторизованного пользователя
 *
 * Middleware:
 * - authenticate - проверяет авторизацию пользователя (добавляет req.user)
 * - isValidId - проверяет валидность ID кейса
 *
 * Параметры:
 * - :id - ID кейса, который нужно открыть
 *
 * Тело запроса (опционально):
 * {
 *   "clientSeed": "string" // Опциональный clientSeed для Provably Fair
 * }
 *
 * Контроллер: casesController.openCase
 */
caseRouter.post("/:id/open", authenticate, isValidId, casesController.openCase);

export { caseRouter };
