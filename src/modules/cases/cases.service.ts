import crypto from "crypto";
import { Case } from "./models/cases/cases.model";
import { CaseOpening } from "./models/case-openings/case-openings.model";
import { CaseItem as CaseItemModel } from "./models/case-items/case-items.model";
import "./models/items/items.model";
import "./models/rarities/rarities.model";
import {
  CaseDetailsItem,
  PopulatedCaseItem,
  OpenCaseResponse,
  CaseDetailsResponse,
  CasesResponse,
  CaseListItem,
  WonItem,
} from "./cases.types";
import { generateRoll } from "./cases.utils";
import { IUser } from "../users/models/users.types";
import { HttpError } from "../../helpers/index";
import { HydratedDocument } from "mongoose";

class CasesService {
  async getAllCases(): Promise<CasesResponse> {
    const cases = await Case.find({ isActive: true });
    const caseList: CaseListItem[] = cases.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      price: c.price,
      image: c.imageUrl,
      items: [],
    }));
    return { cases: caseList };
  }

  async getCaseById(id: string): Promise<CaseDetailsResponse> {
    const result = await Case.findById(id);
    if (!result) {
      throw HttpError(404, "Case not found");
    }

    const caseItems = await CaseItemModel.find({ caseId: id }).populate({
      path: "itemId",
      populate: { path: "rarityId" },
    });

    const items: CaseDetailsItem[] = caseItems.map((ci) => {
      const item = (ci as unknown as PopulatedCaseItem).itemId;
      return {
        id: item._id.toString(),
        name: item.name,
        rarity: item.rarityId.name,
        value: item.value,
        chance: ci.chance,
      };
    });

    return {
      id: result._id as string,
      name: result.name,
      price: result.price,
      items,
    };
  }

  async openCase(
    user: HydratedDocument<IUser>,
    caseId: string,
    clientSeed: string = crypto.randomBytes(16).toString("hex")
  ): Promise<OpenCaseResponse> {
    const caseToOpen = await Case.findById(caseId);
    if (!caseToOpen) {
      throw HttpError(404, "Case not found");
    }

    if (user.balance < caseToOpen.price) {
      throw HttpError(400, "Insufficient balance");
    }

    const caseItems = await CaseItemModel.find({ caseId: caseId })
      .populate({
        path: "itemId",
        populate: { path: "rarityId" },
      })
      .sort({ chance: -1 });

    if (!caseItems || caseItems.length === 0) {
      throw HttpError(400, "Case is empty");
    }

    user.balance -= caseToOpen.price;
    user.totalWagered += caseToOpen.price;
    user.gamesPlayed += 1;

    let serverSeed = user.serverSeed;
    if (!serverSeed) {
      serverSeed = crypto.randomBytes(32).toString("hex");
      user.serverSeed = serverSeed;
    }

    user.clientSeed = clientSeed;

    const nonce = user.gamesPlayed;

    const rollValue = generateRoll(serverSeed, clientSeed, nonce);

    user.serverSeed = crypto.randomBytes(32).toString("hex");

    let winningCaseItem = caseItems[caseItems.length - 1];
    let cumulative = 0;

    for (const item of caseItems) {
      cumulative += item.chance / 100;

      if (rollValue < cumulative) {
        winningCaseItem = item;
        break;
      }
    }

    const winningItem = (winningCaseItem as unknown as PopulatedCaseItem)
      .itemId;

    user.balance += winningItem.value;
    
    user.totalWon += winningItem.value;

    await user.save();

    const opening = await CaseOpening.create({
      userId: user._id,
      caseId: caseToOpen._id,
      itemId: winningItem._id,
      rollValue,
      serverSeed,
      clientSeed,
      nonce,
    });

    const wonItem: WonItem = {
      id: winningItem._id.toString(),
      name: winningItem.name,
      rarity: winningItem.rarityId.name,
      value: winningItem.value,
      image: winningItem.imageUrl,
    };

    return {
      openingId: opening._id as string,
      item: wonItem,
      serverSeed,
      clientSeed,
      nonce,
      roll: rollValue,
      newBalance: user.balance,
      casePrice: caseToOpen.price,
      itemValue: winningItem.value,
    };
  }
}

export default new CasesService();
