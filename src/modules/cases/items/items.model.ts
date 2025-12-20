import { Schema, model } from "mongoose";
import { IItem } from "./items.types";

/**
 * Mongoose схема для модели Item (Предмет)
 * 
 * Item представляет собой предмет, который может выпасть из кейса.
 * Каждый предмет имеет название, редкость, изображение и стоимость.
 */
const itemSchema = new Schema<IItem>(
  {
    // Название предмета (например, "AK-47 Redline", "Knife Butterfly")
    name: { type: String, required: true },
    
    // ID редкости предмета (ссылка на коллекцию "rarities")
    // Редкость определяет, насколько редко выпадает предмет (Common, Rare, Epic, Legendary и т.д.)
    rarityId: { type: Schema.Types.ObjectId, ref: "Rarity", required: true },
    
    // URL изображения предмета (для отображения на фронтенде)
    imageUrl: { type: String, required: true },
    
    // Стоимость предмета (в игровой валюте или реальных деньгах)
    // Используется для расчета статистики (например, totalWon у пользователя)
    value: { type: Number, required: true },
  },
  {
    versionKey: false, // Отключаем поле __v
    timestamps: true, // Автоматически добавляет createdAt и updatedAt
  }
);

/**
 * Модель Item для работы с коллекцией "items" в MongoDB
 * Экспортируется для использования в других частях приложения
 */
export const Item = model<IItem>("Item", itemSchema);

