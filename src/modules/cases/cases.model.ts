import { Schema, model } from "mongoose";
import { ICase } from "./cases.types";

/**
 * Mongoose схема для модели Case (Кейс)
 * Кейс - это контейнер, который можно открыть за определенную плату,
 * чтобы получить случайный предмет из набора доступных предметов
 */
const caseSchema = new Schema<ICase>(
  {
    // Название кейса (например, "Starter Case", "Premium Case")
    name: { type: String, required: true },

    // Уникальный URL-friendly идентификатор кейса (например, "starter-case")
    // Используется для SEO и создания красивых URL
    slug: { type: String, required: true, unique: true },

    // Цена открытия кейса (в игровой валюте или реальных деньгах)
    price: { type: Number, required: true },

    // URL изображения кейса (для отображения на фронтенде)
    imageUrl: { type: String, required: true },

    // Флаг, указывающий, активен ли кейс (можно ли его открывать)
    // Если isActive = false, кейс скрыт из списка доступных
    isActive: { type: Boolean, default: true },

    // Дата и время создания кейса
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false, // Отключаем поле __v (версия документа)
    timestamps: true, // Автоматически добавляет поля createdAt и updatedAt
  }
);

/**
 * Модель Case для работы с коллекцией "cases" в MongoDB
 * Экспортируется для использования в других частях приложения
 */
export const Case = model<ICase>("Case", caseSchema);
