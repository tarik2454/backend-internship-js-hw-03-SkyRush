import "dotenv/config";
import mongoose from "mongoose";
import { Rarity } from "../modules/cases/rarities/rarities.model";
import { Item } from "../modules/cases/items/items.model";
import { Case } from "../modules/cases/cases.model";
import { CaseItem } from "../modules/cases/case-items/case-items.model";

const RARITIES = [
  { name: "Common", chance: 55, color: "#9E9E9E", baseChance: 55 },
  { name: "Uncommon", chance: 25, color: "#4CAF50", baseChance: 25 },
  { name: "Rare", chance: 12, color: "#2196F3", baseChance: 12 },
  { name: "Epic", chance: 5, color: "#9C27B0", baseChance: 5 },
  { name: "Legendary", chance: 2.5, color: "#F44336", baseChance: 2.5 },
  { name: "Gold", chance: 0.5, color: "#FFD700", baseChance: 0.5 },
];

const ITEMS_DATA = [
  { name: "P250 | Sand Dune", rarityName: "Common", value: 0.5 },
  { name: "MAG-7 | Storm", rarityName: "Common", value: 0.4 },
  { name: "SG 553 | Army Sheen", rarityName: "Common", value: 0.6 },

  { name: "Glock-18 | Wraiths", rarityName: "Uncommon", value: 2.5 },
  { name: "USP-S | Lead Conduit", rarityName: "Uncommon", value: 3.0 },

  { name: "M4A4 | Evil Daimyo", rarityName: "Rare", value: 8.0 },
  { name: "AK-47 | Elite Build", rarityName: "Rare", value: 10.0 },

  { name: "AWP | Atheris", rarityName: "Epic", value: 25.0 },
  { name: "Desert Eagle | Mecha Industries", rarityName: "Epic", value: 30.0 },

  { name: "AK-47 | Asiimov", rarityName: "Legendary", value: 150.0 },
  { name: "M4A1-S | Hyper Beast", rarityName: "Legendary", value: 120.0 },

  { name: "Karambit | Fade", rarityName: "Gold", value: 1200.0 },
];

const CASES_DATA = [
  {
    name: "Standard Case",
    slug: "standard-case",
    price: 5,
    imageUrl: "https://example.com/case-standard.png",
  },
  {
    name: "Premium Case",
    slug: "premium-case",
    price: 50,
    imageUrl: "https://example.com/case-premium.png",
  },
];

const seed = async () => {
  try {
    if (!process.env.DB_HOST) {
      throw new Error("DB_HOST is not defined in .env");
    }
    await mongoose.connect(process.env.DB_HOST);
    console.log("Connected to MongoDB for seeding...");

    // 1. Clean up
    console.log("Cleaning existing data...");
    await CaseItem.deleteMany({});
    await Case.deleteMany({});
    await Item.deleteMany({});
    await Rarity.deleteMany({});

    // 2. Seed Rarities
    console.log("Seeding Rarities...");
    const rarityMap: Record<string, any> = {};
    for (const r of RARITIES) {
      const doc = await Rarity.create({
        name: r.name,
        color: r.color,
        baseChance: r.baseChance,
      });
      rarityMap[r.name] = doc;
    }

    // 3. Seed Items
    console.log("Seeding Items...");
    const itemsList: any[] = [];
    for (const i of ITEMS_DATA) {
      const rarity = rarityMap[i.rarityName];
      if (!rarity) {
        console.warn(`Rarity ${i.rarityName} not found for item ${i.name}`);
        continue;
      }
      const doc = await Item.create({
        name: i.name,
        rarityId: rarity._id,
        imageUrl: `https://example.com/item-${i.name
          .replace(/\s+/g, "-")
          .toLowerCase()}.png`,
        value: i.value,
      });
      itemsList.push(doc);
    }

    // 4. Seed Cases and CaseItems
    console.log("Seeding Cases...");

    // -- Case 1: Standard Case (Mainly Commons/Uncommons)
    const standardCase = await Case.create(CASES_DATA[0]);
    console.log(`[SEED] Created Standard Case - ID: ${standardCase._id}`);
    // Distribution for Standard Case:
    // Common: 50%, Uncommon: 30%, Rare: 15%, Epic: 4%, Legendary: 1%
    // We'll pick some items randomly or statically. For simplicity, static:

    const standardItems = [
      { itemName: "P250 | Sand Dune", chance: 30 },
      { itemName: "MAG-7 | Storm", chance: 20 },
      { itemName: "Glock-18 | Wraiths", chance: 30 },
      { itemName: "M4A4 | Evil Daimyo", chance: 15 },
      { itemName: "AWP | Atheris", chance: 5 },
    ];

    for (const link of standardItems) {
      const item = itemsList.find((i) => i.name === link.itemName);
      if (item) {
        await CaseItem.create({
          caseId: standardCase._id,
          itemId: item._id,
          chance: link.chance,
        });
      }
    }

    // -- Case 2: Premium Case (High tier items)
    const premiumCase = await Case.create(CASES_DATA[1]);
    console.log(`[SEED] Created Premium Case - ID: ${premiumCase._id}`);
    const premiumItems = [
      { itemName: "AK-47 | Elite Build", chance: 40 },
      { itemName: "Desert Eagle | Mecha Industries", chance: 30 },
      { itemName: "M4A1-S | Hyper Beast", chance: 20 },
      { itemName: "AK-47 | Asiimov", chance: 9.5 },
      { itemName: "Karambit | Fade", chance: 0.5 },
    ];

    for (const link of premiumItems) {
      const item = itemsList.find((i) => i.name === link.itemName);
      if (item) {
        await CaseItem.create({
          caseId: premiumCase._id,
          itemId: item._id,
          chance: link.chance,
        });
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seed();
