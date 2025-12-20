import { Document, Types } from "mongoose";

/**
 * Интерфейс для модели CaseOpening в базе данных
 * 
 * CaseOpening хранит историю всех открытий кейсов в системе.
 * Каждая запись содержит полную информацию о конкретном открытии кейса:
 * - Кто открыл (userId)
 * - Какой кейс был открыт (caseId)
 * - Какой предмет выпал (itemId)
 * - Все данные для проверки честности результата (Provably Fair)
 */
export interface ICaseOpening extends Document {
  // ID кейса, который был открыт
  caseId: Types.ObjectId;
  
  // ID пользователя, который открыл кейс
  userId: Types.ObjectId;
  
  // ID предмета, который выпал при открытии
  itemId: Types.ObjectId;
  
  // Сгенерированное значение roll (от 0 до 1), которое определило выигрышный предмет
  // Это значение было вычислено функцией generateRoll() на основе serverSeed, clientSeed и nonce
  rollValue: number;
  
  // Server seed, который использовался для генерации rollValue
  // Хранится для возможности проверки честности результата пользователем
  serverSeed: string;
  
  // Client seed, который использовался для генерации rollValue
  // Может быть установлен пользователем или сгенерирован автоматически
  clientSeed: string;
  
  // Номер игры пользователя (nonce)
  // Уникален для каждой игры конкретного пользователя
  nonce: number;
  
  // Дата и время открытия кейса
  createdAt: Date;
}

