import { Request, Response } from "express";
import {
  CasesResponse,
  CaseDetailsResponse,
  OpenCaseResponse,
} from "./cases.types";
import { HydratedDocument } from "mongoose";
import { IUser } from "../users/users.types";
import casesService from "./cases.service";
import { ctrlWrapper } from "../../decorators/index";
import { AuthenticatedRequest } from "../../types";
import { OpenCaseDTO } from "./cases.schema";

/**
 * Контроллер для обработки HTTP-запросов, связанных с кейсами
 * Контроллеры отвечают только за прием запросов и отправку ответов,
 * вся бизнес-логика вынесена в сервисный слой (casesService)
 */

/**
 * Получает список всех доступных кейсов
 * GET /api/cases
 *
 * @param _req - Express Request объект (не используется, поэтому префикс _)
 * @param res - Express Response объект для отправки ответа
 */
const getAllCases = async (
  _req: Request,
  res: Response<CasesResponse>
): Promise<void> => {
  // Вызываем метод сервиса для получения списка кейсов
  const result = await casesService.getAllCases();
  // Отправляем результат клиенту в формате JSON
  res.json(result);
};

/**
 * Получает детальную информацию о конкретном кейсе по его ID
 * GET /api/cases/:id
 *
 * @param req - Express Request объект (содержит параметр id в req.params)
 * @param res - Express Response объект для отправки ответа
 */
const getCaseById = async (
  req: Request,
  res: Response<CaseDetailsResponse>
): Promise<void> => {
  // Извлекаем ID кейса из параметров URL
  const { id } = req.params;
  // Вызываем метод сервиса для получения детальной информации о кейсе
  const result = await casesService.getCaseById(id);
  // Отправляем результат клиенту
  res.json(result);
};

/**
 * Открывает кейс для текущего пользователя
 * POST /api/cases/:id/open
 *
 * Требует аутентификации (middleware authenticate добавляет req.user)
 *
 * @param req - Express Request объект с добавленным полем user (тип RequestWithUser)
 *              req.params.id - ID кейса для открытия
 *              req.body.clientSeed - Опциональный clientSeed для Provably Fair (если не указан, генерируется автоматически)
 * @param res - Express Response объект для отправки ответа
 */
const openCase = async (
  req: AuthenticatedRequest<{ id: string }, Record<string, never>, OpenCaseDTO>,
  res: Response<OpenCaseResponse>
): Promise<void> => {
  // Извлекаем ID кейса из параметров URL
  const { id } = req.params;
  // Извлекаем clientSeed из тела запроса (если клиент хочет использовать свой seed)
  // Если clientSeed не указан, в сервисе будет сгенерирован автоматически
  const { clientSeed } = req.body;
  // Получаем объект пользователя из middleware authenticate
  // Используем ! так как мы уверены, что user существует (middleware authenticate гарантирует это)
  // Приводим к типу HydratedDocument, чтобы можно было сохранять изменения
  const user = req.user as HydratedDocument<IUser>;

  // Вызываем метод сервиса для открытия кейса
  // Сервис вернет информацию о выпавшем предмете и данные для проверки честности
  const result = await casesService.openCase(user, id, clientSeed);
  // Отправляем результат клиенту
  res.json(result);
};

/**
 * Экспортируем контроллеры, обернутые в ctrlWrapper
 * ctrlWrapper автоматически обрабатывает ошибки и асинхронность
 */
export default {
  getAllCases: ctrlWrapper(getAllCases),
  getCaseById: ctrlWrapper(getCaseById),
  openCase: ctrlWrapper(openCase),
};
