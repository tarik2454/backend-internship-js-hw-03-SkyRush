import "dotenv/config";
import mongoose from "mongoose";
import { Rarity } from "../modules/cases/rarities/rarities.model";

const RARITIES = [
  { name: "Common", chance: 55, color: "#9E9E9E" }, // Gray
  { name: "Uncommon", chance: 25, color: "#4CAF50" }, // Green
  { name: "Rare", chance: 12, color: "#2196F3" }, // Blue
  { name: "Epic", chance: 5, color: "#9C27B0" }, // Purple
  { name: "Legendary", chance: 2.5, color: "#F44336" }, // Red
  { name: "Gold", chance: 0.5, color: "#FFD700" }, // Gold
];

const seedRarities = async () => {
  try {
    await mongoose.connect(process.env.DB_HOST as string);
    console.log("Database connection successful");

    for (const data of RARITIES) {
      const existing = await Rarity.findOne({ name: data.name });
      if (existing) {
        await Rarity.updateOne(
          { _id: existing._id },
          { chance: data.chance, color: data.color }
        );
        console.log(`Updated rarity: ${data.name}`);
      } else {
        await Rarity.create({
          name: data.name,
          chance: data.chance,
          color: data.color,
        });
        console.log(`Created rarity: ${data.name}`);
      }
    }

    console.log("Rarities seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding rarities:", error);
    process.exit(1);
  }
};

seedRarities();

