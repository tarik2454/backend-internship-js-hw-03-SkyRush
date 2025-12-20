import "dotenv/config";
import mongoose from "mongoose";
import { CaseOpening } from "../modules/cases/case-openings/case-openings.model";

/**
 * Скрипт для удаления поля __v из всех документов в коллекции caseopenings
 * Запуск: npm run ts-node src/scripts/remove-version-field.ts
 */
const removeVersionField = async () => {
  try {
    // Подключаемся к MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Удаляем поле __v из всех документов
    const result = await CaseOpening.updateMany({}, { $unset: { __v: "" } });

    console.log(
      `Updated ${result.modifiedCount} documents in caseopenings collection`
    );
    console.log("Field __v removed successfully!");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error removing __v field:", error);
    process.exit(1);
  }
};

removeVersionField();
