import crypto from "crypto";
import { Case } from "./cases.model";
import { CaseOpening } from "./case-openings/case-openings.model";
import { CaseItem as CaseItemModel } from "./case-items/case-items.model";
import "./items/items.model";
import "./rarities/rarities.model";
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
import { IUser } from "../users/users.types";
import { HttpError } from "../../helpers/index";
import { HydratedDocument } from "mongoose";

/**
 * Сервисный класс для работы с кейсами (Cases)
 * Содержит всю бизнес-логику для операций с кейсами: получение списка, деталей и открытие кейсов
 */
class CasesService {
  /**
   * Получает список всех кейсов из базы данных
   * Согласно ТЗ: { cases: [{ id, name, price, image, items: [] }] }
   * @returns Объект с массивом всех кейсов
   */
  async getAllCases(): Promise<CasesResponse> {
    const cases = await Case.find({ isActive: true });
    const caseList: CaseListItem[] = cases.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      price: c.price,
      image: c.imageUrl, // Преобразуем imageUrl в image согласно ТЗ
      items: [], // Пустой массив согласно ТЗ
    }));
    return { cases: caseList };
  }

  /**
   * Получает детальную информацию о конкретном кейсе по его ID
   * Включает в себя список всех предметов, которые могут выпасть из этого кейса,
   * вместе с их редкостью, шансом выпадения и другими характеристиками
   *
   * @param id - ID кейса для получения информации
   * @returns Детальная информация о кейсе со списком предметов
   * @throws HttpError(404) - Если кейс с указанным ID не найден
   */
  async getCaseById(id: string): Promise<CaseDetailsResponse> {
    // Ищем кейс по ID в базе данных
    const result = await Case.findById(id);
    if (!result) {
      throw HttpError(404, "Case not found");
    }

    // Находим все связи между кейсом и предметами (CaseItem - это join-таблица)
    // Используем populate для загрузки связанных данных:
    // - itemId - сам предмет (Item)
    // - rarityId внутри itemId - редкость предмета (Rarity)
    const caseItems = await CaseItemModel.find({ caseId: id }).populate({
      path: "itemId",
      populate: { path: "rarityId" },
    });

    // Преобразуем данные из формата базы данных в формат API-ответа
    // Согласно ТЗ: items: [{ id, name, rarity, chance, value }]
    // НЕ включаем imageUrl в ответ
    const items: CaseDetailsItem[] = caseItems.map((ci) => {
      const item = (ci as unknown as PopulatedCaseItem).itemId;
      return {
        id: item._id.toString(),
        name: item.name,
        rarity: item.rarityId.name, // Название редкости (например, "Common", "Rare", "Epic")
        value: item.value, // Стоимость предмета
        chance: ci.chance, // Шанс выпадения этого предмета из кейса (в процентах)
      };
    });

    return {
      id: result._id as string,
      name: result.name,
      price: result.price, // Цена открытия кейса
      items, // Список всех предметов, которые могут выпасть
    };
  }

  /**
   * Открывает кейс и определяет выпавший предмет на основе Provably Fair алгоритма
   *
   * Provably Fair - это алгоритм, который позволяет пользователю проверить честность
   * результата. Используется комбинация serverSeed (генерируется сервером),
   * clientSeed (может быть предоставлен клиентом) и nonce (номер игры пользователя).
   *
   * Процесс работы:
   * 1. Проверяется наличие кейса и достаточность баланса пользователя
   * 2. Списывается стоимость кейса с баланса пользователя
   * 3. Генерируется случайное число (roll) на основе seeds и nonce
   * 4. По весовой вероятности (chance) определяется выигрышный предмет
   * 5. Обновляется статистика пользователя
   * 6. Сохраняется запись об открытии в базу данных
   * 7. Возвращаются данные для проверки честности результата
   *
   * @param user - Объект пользователя из базы данных (HydratedDocument позволяет сохранять изменения)
   * @param caseId - ID кейса, который нужно открыть
   * @param clientSeed - Семя, предоставленное клиентом (опционально, если не указано - генерируется автоматически)
   * @returns Результат открытия кейса с информацией о выпавшем предмете и данными для проверки честности
   * @throws HttpError(404) - Если кейс не найден
   * @throws HttpError(400) - Если недостаточно баланса или кейс пустой
   */
  async openCase(
    user: HydratedDocument<IUser>,
    caseId: string,
    clientSeed: string = crypto.randomBytes(16).toString("hex")
  ): Promise<OpenCaseResponse> {
    // Проверяем существование кейса
    const caseToOpen = await Case.findById(caseId);
    if (!caseToOpen) {
      throw HttpError(404, "Case not found");
    }

    // Проверяем достаточность баланса для открытия кейса
    if (user.balance < caseToOpen.price) {
      throw HttpError(400, "Insufficient balance");
    }

    // Получаем все предметы, которые могут выпасть из этого кейса
    // Сортируем по убыванию шанса (от более редких к более частым)
    // Это нужно для правильной работы алгоритма взвешенного выбора
    const caseItems = await CaseItemModel.find({ caseId: caseId })
      .populate({
        path: "itemId",
        populate: { path: "rarityId" },
      })
      .sort({ chance: -1 });

    if (!caseItems || caseItems.length === 0) {
      throw HttpError(400, "Case is empty");
    }

    // ============================================
    // ОБНОВЛЕНИЕ БАЛАНСА И СТАТИСТИКИ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    user.balance -= caseToOpen.price; // Списываем стоимость кейса
    user.totalWagered += caseToOpen.price; // Увеличиваем общую сумму ставок
    user.gamesPlayed += 1; // Увеличиваем счетчик сыгранных игр

    // ============================================
    // PROVABLY FAIR: РАБОТА С SEEDS
    // ============================================
    // Используем существующий serverSeed или создаем новый, если его нет
    // serverSeed - секретный ключ, который хранится на сервере и используется для генерации результата
    let serverSeed = user.serverSeed;
    if (!serverSeed) {
      // Если у пользователя еще нет serverSeed, генерируем новый
      serverSeed = crypto.randomBytes(32).toString("hex");
      user.serverSeed = serverSeed;
    }

    // Сохраняем clientSeed, предоставленный пользователем (или сгенерированный автоматически)
    // clientSeed - это значение, которое пользователь может установить самостоятельно для проверки честности
    user.clientSeed = clientSeed;

    // nonce - это номер игры пользователя (уникальный для каждой игры)
    // Используем gamesPlayed как nonce, так как он увеличивается с каждой игрой
    const nonce = user.gamesPlayed;

    // Генерируем случайное число от 0 до 1 на основе комбинации serverSeed, clientSeed и nonce
    // Это число будет использовано для определения выигрышного предмета
    const rollValue = generateRoll(serverSeed, clientSeed, nonce);

    // Важный шаг: ротируем (меняем) serverSeed для следующей игры
    // Это гарантирует, что каждое открытие кейса использует новый seed
    // Старый seed уже использован и сохранен в истории, так что результат можно проверить
    user.serverSeed = crypto.randomBytes(32).toString("hex");

    // ============================================
    // ОПРЕДЕЛЕНИЕ ВЫИГРЫШНОГО ПРЕДМЕТА
    // ============================================
    // Используем алгоритм взвешенного случайного выбора
    // Каждый предмет имеет свой шанс выпадения (chance в процентах)
    // Мы суммируем шансы и выбираем предмет, на который попадает сгенерированное значение rollValue

    let winningCaseItem = caseItems[caseItems.length - 1]; // Fallback - самый последний предмет (на случай ошибки)
    let cumulative = 0; // Накопительная сумма шансов

    // Проходим по всем предметам, отсортированным по убыванию шанса
    for (const item of caseItems) {
      // Добавляем шанс текущего предмета к накопительной сумме
      // Делим на 100, так как chance хранится в процентах (например, 50 = 50%)
      cumulative += item.chance / 100;

      // Если сгенерированное значение rollValue попадает в диапазон текущего предмета - он выиграл
      // Например: если rollValue = 0.3, а cumulative стал 0.35, то предмет с шансом 5% выиграл
      if (rollValue < cumulative) {
        winningCaseItem = item;
        break; // Прерываем цикл, так как выигрышный предмет найден
      }
    }

    // Извлекаем сам предмет из связи CaseItem
    const winningItem = (winningCaseItem as unknown as PopulatedCaseItem)
      .itemId;

    // Обновляем статистику: добавляем стоимость выигранного предмета к общей сумме выигрышей
    user.totalWon += winningItem.value;

    // Сохраняем изменения пользователя в базу данных
    await user.save();

    // ============================================
    // СОХРАНЕНИЕ ИСТОРИИ ОТКРЫТИЯ
    // ============================================
    // Создаем запись об открытии кейса в базе данных
    // Это позволяет:
    // - Верифицировать честность результата (пользователь может проверить seeds и roll)
    // - Восстановить историю открытий
    // - Провести аудит системы
    const opening = await CaseOpening.create({
      userId: user._id,
      caseId: caseToOpen._id,
      itemId: winningItem._id,
      rollValue, // Значение, которое определило выигрыш
      serverSeed, // Server seed, который использовался для генерации
      clientSeed, // Client seed, который использовался для генерации
      nonce, // Номер игры (использовался как nonce)
    });

    // Возвращаем результат открытия с данными для проверки честности
    // Согласно ТЗ: item: { id, name, rarity, value, image }
    const wonItem: WonItem = {
      id: winningItem._id.toString(),
      name: winningItem.name,
      rarity: winningItem.rarityId.name,
      value: winningItem.value,
      image: winningItem.imageUrl, // Преобразуем imageUrl в image согласно ТЗ
    };

    return {
      openingId: opening._id as string, // ID записи об открытии (можно использовать для проверки)
      item: wonItem,
      // Данные для Provably Fair проверки:
      serverSeed, // Server seed (текущий, до ротации)
      clientSeed, // Client seed
      nonce, // Номер игры
      roll: rollValue, // Сгенерированное значение
    };
  }
}

export default new CasesService();
