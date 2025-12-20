import { Document } from "mongoose";
import { IItem } from "../items/items.types";
import { IRarity } from "../rarities/rarities.types";
import { ICaseItem } from "./case-items.types";

/**
 * Вспомогательный тип для работы с "заполненными" (populated) документами Mongoose
 *
 * Когда мы используем .populate() в Mongoose, поле rarityId в IItem
 * преобразуется из ObjectId в полный объект IRarity.
 *
 * PopulatedItem - это IItem, но вместо rarityId: ObjectId у нас rarityId: IRarity
 */
export interface PopulatedItem extends Omit<IItem, "rarityId"> {
  rarityId: IRarity;
}

/**
 * Вспомогательный тип для работы с заполненными CaseItem документами
 *
 * Когда мы делаем populate для CaseItem:
 * - itemId преобразуется из ObjectId в полный объект Item
 * - Внутри этого Item, rarityId также заполнен (преобразован в IRarity)
 *
 * Используется для типизации результатов запросов с populate в контроллерах и сервисах
 */
export interface PopulatedCaseItem extends Omit<ICaseItem, "itemId"> {
  itemId: PopulatedItem;
}

/**
 * Базовая информация о предмете для API-ответов
 * Используется в различных ответах API, где нужно показать информацию о предмете
 */
export interface CaseItem {
  id: string; // ID предмета
  name: string; // Название предмета
  rarity: string; // Название редкости (например, "Common", "Rare")
  value: number; // Стоимость предмета
  imageUrl: string; // URL изображения предмета
}

/**
 * Расширенная информация о предмете для детального просмотра кейса
 * Расширяет CaseItem, добавляя информацию о шансе выпадения
 */
export interface CaseDetailsItem extends CaseItem {
  chance: number; // Шанс выпадения этого предмета из кейса (в процентах)
}

/**
 * Интерфейс для модели Case в базе данных
 * Наследуется от Document (Mongoose), что добавляет поля _id, методы save(), etc.
 */
export interface ICase extends Document {
  name: string; // Название кейса
  slug: string; // URL-friendly идентификатор (уникальный)
  price: number; // Цена открытия кейса
  imageUrl: string; // URL изображения кейса
  isActive: boolean; // Активен ли кейс (можно ли его открывать)
  createdAt: Date; // Дата создания
}

/**
 * Ответ API для получения списка всех кейсов
 * GET /api/cases
 */
export interface CasesResponse {
  cases: ICase[]; // Массив всех доступных кейсов
}

/**
 * Ответ API для получения детальной информации о кейсе
 * GET /api/cases/:id
 */
export interface CaseDetailsResponse {
  id: string; // ID кейса
  name: string; // Название кейса
  price: number; // Цена открытия кейса
  items: CaseDetailsItem[]; // Список всех предметов, которые могут выпасть из кейса
}

/**
 * Ответ API для открытия кейса
 * POST /api/cases/:id/open
 *
 * Содержит:
 * - Информацию о выпавшем предмете
 * - Данные для проверки честности результата (Provably Fair)
 */
export interface OpenCaseResponse {
  openingId: string; // ID записи об открытии (можно использовать для проверки или истории)
  item: CaseItem; // Информация о выпавшем предмете
  // Данные для Provably Fair проверки:
  serverSeed: string; // Server seed, использованный для генерации результата
  clientSeed: string; // Client seed, использованный для генерации результата
  nonce: number; // Номер игры (использовался как nonce)
  roll: number; // Сгенерированное значение roll (от 0 до 1), определившее выигрыш
}
