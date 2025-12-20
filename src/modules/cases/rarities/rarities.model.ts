import { Schema, model } from "mongoose";
import { IRarity } from "./rarities.types";

/**
 * Mongoose схема для модели Rarity (Редкость)
 * 
 * Rarity определяет уровень редкости предметов в системе.
 * Обычно используются уровни: Common (Обычный), Uncommon (Необычный),
 * Rare (Редкий), Epic (Эпический), Legendary (Легендарный), Gold (Золотой).
 * 
 * Каждая редкость имеет:
 * - Уникальное название
 * - Цвет (HEX код) для отображения на фронтенде
 * - Базовый шанс выпадения (в процентах)
 */
const raritySchema = new Schema<IRarity>(
  {
    // Название редкости (например, "Common", "Rare", "Legendary")
    // Должно быть уникальным в системе
    name: { type: String, required: true, unique: true },
    
    // HEX-код цвета для отображения редкости на фронтенде
    // Например, "#9d9d9d" для Common, "#ffd700" для Gold
    color: { type: String, required: true },
    
    // Базовый шанс выпадения предметов этой редкости (в процентах)
    // Используется как ориентир, но конкретный шанс для каждого предмета
    // в каждом кейсе задается в модели CaseItem
    baseChance: { type: Number, required: true },
  },
  {
    versionKey: false, // Отключаем поле __v
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
  }
);

/**
 * Модель Rarity для работы с коллекцией "rarities" в MongoDB
 * Экспортируется для использования в других частях приложения
 */
export const Rarity = model<IRarity>("Rarity", raritySchema);

