import { Schema, model } from "mongoose";
import { ICaseItem } from "./case-items.types";

/**
 * Mongoose схема для модели CaseItem
 *
 * CaseItem - это связующая таблица (join table) между Case (кейсом) и Item (предметом)
 * Используется для реализации связи "многие-ко-многим" между кейсами и предметами
 *
 * Один кейс может содержать множество предметов
 * Один предмет может быть в разных кейсах
 *
 * Помимо связи, эта модель хранит шанс выпадения (chance) конкретного предмета
 * из конкретного кейса. Это важно, так как один и тот же предмет может иметь
 * разную вероятность выпадения в разных кейсах.
 */
const caseItemSchema = new Schema<ICaseItem>(
  {
    // ID кейса, в котором может выпасть предмет
    // ref: "Case" указывает, что это ссылка на коллекцию "cases"
    caseId: { type: Schema.Types.ObjectId, ref: "Case", required: true },

    // ID предмета, который может выпасть из кейса
    // ref: "Item" указывает, что это ссылка на коллекцию "items"
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },

    // Шанс выпадения этого предмета из кейса (в процентах)
    // Например, chance: 50 означает 50% вероятность выпадения
    // Сумма всех chance для одного кейса должна равняться 100%
    chance: { type: Number, required: true },
  },
  { versionKey: false }
);

/**
 * Создаем составной уникальный индекс (caseId, itemId) - эквивалент PRIMARY KEY в SQL
 * Это гарантирует, что один и тот же предмет не может быть связан с кейсом дважды
 * Также создает индекс для оптимизации запросов по caseId
 */
caseItemSchema.index({ caseId: 1, itemId: 1 }, { unique: true });

/**
 * Модель CaseItem для работы с коллекцией "caseitems" в MongoDB
 * Используется для хранения связи между кейсами и предметами
 */
export const CaseItem = model<ICaseItem>("CaseItem", caseItemSchema);
