import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Users, Plus, Trash2, CheckCircle2, Clock, Zap,
  AlertTriangle, BarChart3, UserPlus, ChevronDown, Cpu, Power, PowerOff,
  Pencil, Layers, X, Maximize2, Minimize2,
} from 'lucide-react';
import {
  useERP,
  type Employee,
  type RawMaterialProduct,
  type ShiftRecord,
} from '../store/erp-store';
import { apiRequest } from '../api/http';
import { useApp } from '../i18n/app-context';
import { formatNumber, formatDate, formatKgAmount, TODAY } from '../utils/format';
import { Link } from 'react-router';
import { translateShiftInventoryApiError } from '../utils/shift-api-errors';
import { SingleDatePicker } from '../components/SingleDatePicker';

const SHIFT_DEFS_KEY = 'liderplast_shift_definitions_v1';

export type ShiftDefinition = {
  id: string;
  number: number;
  name: string;
  timeFrom: string;
  timeTo: string;
};

/** Тоза тизим: сменалар фақат «Сменалар» вкладкасида қўшилгандан кейин мавжуд */
function loadShiftDefinitions(): ShiftDefinition[] {
  try {
    const raw = localStorage.getItem(SHIFT_DEFS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShiftDefinition[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    return parsed;
  } catch {
    return [];
  }
}

/** Bugungi smena kartochkalarida dastlab ko‘rinadigan yozuvlar soni */
const TIMELINE_CARD_VISIBLE = 3;

/** Фаол қопда сиро «йўқ» деб ҳисоблаш чегараси (кг) */
const SIRO_BAG_KG_EPS = 1e-5;

const SHIFT_STYLE_PRESETS = [
  { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-700', dot: 'bg-amber-500' },
  { badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700', dot: 'bg-indigo-500' },
  { badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700', dot: 'bg-emerald-500' },
  { badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-700', dot: 'bg-rose-500' },
  { badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700', dot: 'bg-cyan-500' },
  { badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-700', dot: 'bg-violet-500' },
];

function shiftStyleFor(shiftNumber: number) {
  const idx = Math.max(0, shiftNumber - 1) % SHIFT_STYLE_PRESETS.length;
  return SHIFT_STYLE_PRESETS[idx];
}

const PRODUCT_COLORS: Record<string, string> = {
  '18g': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  '20g': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  '0.5L': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  '1L':  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  '5L':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

// ── Translations ──────────────────────────────────────────────────────────────
const TR = {
  uz_cyrillic: {
    title: 'Смена Ҳисоби',
    subtitle: 'Иккита смена — ишчилар иши назорати',
    kpiWorkers: 'Бугунги ишчилар',
    kpiProduced: 'Жами ишлаб чиқарилди',
    kpiBrak: 'Жами брак',
    kpiKwh: 'Жами ток (кВт·с)',
    tab1: 'Смена Киритиш',
    tab2: 'Смена Тарихи',
    tab3: 'Ишчилар',
    formTitle: 'Янги Смена Ёзуви',
    labelDate: 'Сана',
    labelShift: 'Смена',
    labelWorker: 'Ишчи исми',
    labelMachine: 'Аппарат',
    labelHours: 'Ишлаган соат',
    labelProduct: 'Маҳсулот тури',
    labelReading: 'Аппарат кўрсатгичи',
    labelProduced: 'Тайёр маҳсулот (дона)',
    labelDefect: 'Брак сони (дона)',
    labelNotes: 'Изоҳ',
    autoKwh: '⚡ Автоматик ток ҳисоби:',
    btn: 'Смена ёзувини сақлаш',
    formAddRow: '+ қатор',
    colNum: '№',
    colDate: 'Сана',
    colShift: 'Смена',
    colWorker: 'Ишчи',
    colProduct: 'Маҳсулот',
    colMachine: 'Аппарат',
    colHours: 'Соат',
    colReading: 'Аппарат кўрсатгичи',
    colDefect: 'Брак',
    colProduced: 'Тайёр маҳсулот',
    colKwh: 'Ток (кВт·с)',
    addWorker: 'Янги ишчи қўшиш',
    workerName: 'Ишчи исми',
    workerList: 'Ишчилар рўйхати',
    total: 'Жами',
    records: 'ёзув',
    noData: 'Маълумот йўқ',
    placeholderWorker: 'Ишчи танланг ёки киритинг...',
    placeholderReading: 'м: 43,069 / 41,203',
    placeholderNotes: 'Ихтиёрий изоҳ...',
    shiftTime1: '06:00 – 18:00',
    shiftTime2: '18:00 – 06:00',
    brakPercent: '% брак',
    tab4: 'Апаратлар',
    machineAddTitle: 'Янги Апарат Қўшиш',
    machineName: 'Апарат номи',
    machineDesc: 'Нима иш қилади',
    machinePower: 'Соатига кВт (ток сарфи)',
    machineCapacity: 'Соатига макс. иш (дона)',
    machineType: 'Тури',
    machineTypeSemi: 'Қолип (Ярим тайёр)',
    machineTypeFinal: 'Баклашка (Тайёр)',
    machineAddBtn: 'Апарат қўшиш',
    machineList: 'Мавжуд Апаратлар',
    machineActive: 'Фаол',
    machineInactive: 'Ночор',
    machineUsedInShift: 'смена ёзуви',
    machineKwPerHour: 'кВт/соат',
    machinePlaceholderName: 'м: Қолип Масхинаси #1',
    machinePlaceholderDesc: 'м: PET преформ (қолип) ишлаб чиқаради',
    tab5: 'Сменалар',
    shiftDefsTitle: 'Сменалар рўйхати',
    shiftDefsSubtitle: 'Ном ва вақтни белгиланг; янги смена қўшиш, таҳрирлаш ёки ўчириш',
    shiftDefName: 'Смена номи',
    shiftDefTimeFrom: 'Бошланиш',
    shiftDefTimeTo: 'Тугаш',
    shiftDefAdd: 'Смена қўшиш',
    shiftDefSave: 'Сақлаш',
    shiftDefCancel: 'Бекор',
    shiftDefDelete: 'Ўчириш',
    shiftDefEdit: 'Таҳрир',
    shiftDefDeleteBlocked: 'Бу рақамда смена ёзувлари бор — аввал ўчириш ёки ёзувларни бошқа сменага ўтказинг',
    shiftNoDefsHint: 'Сменалар ҳали белгиланмаган. Аввал «Сменалар» бўлимида камида битта смена қўшинг.',
    shiftNoDefsGoToTab: '«Сменалар»га ўтиш',
    productTypesEmptyHint:
      'Маҳсулот турлари ҳали йўқ. «Омбор»да ярим тайёр ёки тайёр маҳсулот номларини қўшинг (ёки кутинг — каталог юклансин).',
    machinePowerKwZeroHint:
      'Танланган аппаратда қувват (кВт) 0 — ток ва «Харажатлар»даги электр харажати ҳисобланмайди. «Апаратлар» ёндаги қувватни тўғри киритинг.',
    shiftDefInUseRecords: 'Ёзувларда қўлланилган',
    shiftGenericName: '{n}-смена',
    kpiUnitPieces: 'дона',
    kpiUnitKwh: 'кВт·с',
    shiftNoDefect: 'Брак йўқ',
    shiftDefectWarn: 'Брак: {count} ({pct}%)',
    unitPiecesAbbr: 'д',
    machinePerHour: 'дона/соат',
    workerStatLine: '{n} ёзув · {h} соат жами',
    workerReady: 'тайёр',
    workerBrakLabel: 'брак',
    todayPreviewTitle: 'Бугун',
    todayPreviewFullscreen: 'Тўлиқ экран',
    todayPreviewExitFullscreen: 'Экрандан чиқиш',
    timelineShowMore: 'Яна {n} та',
    timelineCollapse: 'Қисқартириш',
    editShiftRecord: 'Ёзувни таҳрирлаш',
    saveChanges: 'Ўзгаришларни сақлаш',
    close: 'Ёпиш',
    hoursShort: 'соат',
    confirmDelete: 'Ўчиришни тасдиқланг',
    colActions: 'Амаллар',
    workerPreferredShift: 'Қайси сменада ишлайди',
    workerShiftUnset: 'Белгиланмаган',
    workerPhone: 'Телефон',
    workerPositionShort: 'Лавозим',
    workerCardShort: 'Карта №',
    workerEditTitle: 'Ишчи маълумотларини таҳрирлаш',
    workerOrphansTitle: 'Фақат смена ёзувларида (базада алоҳида ёзув йўқ)',
    workerDuplicate: 'Бу исмда ишчи аллақачон мавжуд',
    workerOptional: 'ихтиёрий',
    shiftPaintQuestion: 'Краска/бўёқ ишлатилдими? (қолип)',
    shiftPaintMaterial: 'Краска / хомашё',
    shiftPaintQty: 'Миқдор',
    shiftPaintUnitKg: 'кг',
    shiftPaintUnitG: 'г',
    shiftPaintUnitLabel: 'Ўлчов',
    shiftPaintError: 'Краска белгиланса — тур ва миқдор тўғри киритилсин',
    shiftPaintNoMaterials:
      'Краска тури мавжуд эмас. «Хомашё (сиро)» саҳифасида янги хомашёни «краска» тури билан қўшинг.',
    shiftSemiNeedActiveBagBanner:
      'Қолип (ярим тайёр) учун сменада фаол сиро қопи аппаратга уланган бўлиши керак. «Хомашё (сиро / краска)» саҳифасида қопни уланг.',
    shiftSemiNeedActiveBagSubmit:
      'Қолип аппарати учун сиро қопи уланмаган ёки сиро йўқ — смена сақланмайди.',
    shiftSemiAddLineBlocked:
      'Фақат қолип аппаратлари қолганда сиро қописиз янги қатор қўшиб бўлмайди.',
    shiftSiroGoRawMaterial: '«Хомашё»га ўтиш',
    shiftSiroBagLow: 'Фаол қопда сиро оз қолди: {kg} кг · {name}',
    shiftSiroBagEmpty: 'Фаол қопда сиро тугади — янги қопни уланг · {name}',
  },
  uz_latin: {
    title: 'Smena Hisobi',
    subtitle: 'Ikkita smena — ishchilar ishi nazorati',
    kpiWorkers: 'Bugungi ishchilar',
    kpiProduced: 'Jami ishlab chiqarildi',
    kpiBrak: 'Jami brak',
    kpiKwh: 'Jami tok (kWh)',
    tab1: 'Smena Kiritish',
    tab2: 'Smena Tarixi',
    tab3: 'Ishchilar',
    formTitle: 'Yangi Smena Yozuvi',
    labelDate: 'Sana',
    labelShift: 'Smena',
    labelWorker: 'Ishchi ismi',
    labelMachine: 'Apparat',
    labelHours: 'Ishlagan soat',
    labelProduct: 'Mahsulot turi',
    labelReading: 'Apparat ko\'rsatgichi',
    labelProduced: 'Tayyor mahsulot (dona)',
    labelDefect: 'Brak soni (dona)',
    labelNotes: 'Izoh',
    autoKwh: "⚡ Avtomatik tok hisobi:",
    btn: 'Smena yozuvini saqlash',
    formAddRow: '+ qator',
    colNum: '№',
    colDate: 'Sana',
    colShift: 'Smena',
    colWorker: 'Ishchi',
    colProduct: 'Mahsulot',
    colMachine: 'Apparat',
    colHours: 'Soat',
    colReading: 'Apparat ko\'rsatgichi',
    colDefect: 'Brak',
    colProduced: 'Tayyor mahsulot',
    colKwh: 'Tok (kWh)',
    addWorker: 'Yangi ishchi qo\'shish',
    workerName: 'Ishchi ismi',
    workerList: 'Ishchilar ro\'yxati',
    total: 'Jami',
    records: 'yozuv',
    noData: 'Ma\'lumot yo\'q',
    placeholderWorker: 'Ishchi tanlang yoki kiriting...',
    placeholderReading: 'm: 43,069 / 41,203',
    placeholderNotes: 'Ixtiyoriy izoh...',
    shiftTime1: '06:00 – 18:00',
    shiftTime2: '18:00 – 06:00',
    brakPercent: '% brak',
    tab4: 'Aparatlar',
    machineAddTitle: "Yangi Aparat Qo'shish",
    machineName: 'Aparat nomi',
    machineDesc: 'Nima ish qiladi',
    machinePower: 'Soatiga kVt (tok sarfi)',
    machineCapacity: 'Soatiga maks. ish (dona)',
    machineType: 'Turi',
    machineTypeSemi: "Qolip (Yarim tayyor)",
    machineTypeFinal: 'Baklashka (Tayyor)',
    machineAddBtn: "Aparat qo'shish",
    machineList: "Mavjud Aparatlar",
    machineActive: 'Faol',
    machineInactive: 'Nofaol',
    machineUsedInShift: 'smena yozuvi',
    machineKwPerHour: 'kVt/soat',
    machinePlaceholderName: 'm: Qolip Mashinasi #1',
    machinePlaceholderDesc: 'm: PET preform (qolip) ishlab chiqaradi',
    tab5: 'Smenalar',
    shiftDefsTitle: 'Smenalar ro\'yxati',
    shiftDefsSubtitle: 'Nom va vaqtni belgilang; yangi smena qo\'shish, tahrirlash yoki o\'chirish',
    shiftDefName: 'Smena nomi',
    shiftDefTimeFrom: 'Boshlanish',
    shiftDefTimeTo: 'Tugash',
    shiftDefAdd: 'Smena qo\'shish',
    shiftDefSave: 'Saqlash',
    shiftDefCancel: 'Bekor',
    shiftDefDelete: 'O\'chirish',
    shiftDefEdit: 'Tahrir',
    shiftDefDeleteBlocked: 'Bu raqamda smena yozuvlari bor — avval o\'chiring yoki yozuvlarni boshqa smenaga o\'tkazing',
    shiftNoDefsHint: 'Smenalar hali belgilanmagan. Avval «Smenalar» bo‘limida kamida bitta smena qo‘shing.',
    shiftNoDefsGoToTab: '«Smenalar»ga o‘tish',
    productTypesEmptyHint:
      "Mahsulot turlari hali yo'q. «Ombor»da yarim tayyor yoki tayyor mahsulot nomlarini qo'shing (yoki kuting — katalog yuklansin).",
    machinePowerKwZeroHint:
      "Tanlangan apparatda quvvat (kVt) 0 — tok va «Xarajatlar»dagi elektr xarajati hisoblanmaydi. «Aparatlar» yorlig'ida quvvatni kiriting.",
    shiftDefInUseRecords: 'Yozuvlarda qo\'llanilgan',
    shiftGenericName: '{n}-smena',
    kpiUnitPieces: 'dona',
    kpiUnitKwh: 'kWh',
    shiftNoDefect: 'Brak yo\'q',
    shiftDefectWarn: 'Brak: {count} ({pct}%)',
    unitPiecesAbbr: 'd',
    machinePerHour: 'dona/soat',
    workerStatLine: '{n} yozuv · {h} soat jami',
    workerReady: 'tayyor',
    workerBrakLabel: 'brak',
    todayPreviewTitle: 'Bugun',
    todayPreviewFullscreen: 'To\'liq ekran',
    todayPreviewExitFullscreen: 'Ekrandan chiqish',
    timelineShowMore: 'Yana {n} ta',
    timelineCollapse: 'Qisqartirish',
    editShiftRecord: 'Yozuvni tahrirlash',
    saveChanges: 'O\'zgarishlarni saqlash',
    close: 'Yopish',
    hoursShort: 'soat',
    confirmDelete: 'O\'chirishni tasdiqlang',
    colActions: 'Amallar',
    workerPreferredShift: 'Qaysi smenada ishlaydi',
    workerShiftUnset: 'Belgilanmagan',
    workerPhone: 'Telefon',
    workerPositionShort: 'Lavozim',
    workerCardShort: 'Karta №',
    workerEditTitle: 'Ishchi ma\'lumotlarini tahrirlash',
    workerOrphansTitle: 'Faqat smena yozuvlarida (bazada alohida yozuv yo\'q)',
    workerDuplicate: 'Bu ismda ishchi allaqachon mavjud',
    workerOptional: 'ixtiyoriy',
    shiftPaintQuestion: 'Kraska/bo\'yoq ishlatildimi? (qolip)',
    shiftPaintMaterial: 'Kraska / xomashyo',
    shiftPaintQty: 'Miqdor',
    shiftPaintUnitKg: 'kg',
    shiftPaintUnitG: 'g',
    shiftPaintUnitLabel: 'O\'lchov',
    shiftPaintError: 'Kraska belgilansa — tur va miqdor to\'g\'ri kirilsin',
    shiftPaintNoMaterials:
      'Kraska turi yo\'q. «Xomashyo (siro)» sahifasida yangi xomashyoni «kraska» turi bilan qo\'shing.',
    shiftSemiNeedActiveBagBanner:
      'Qolip (yarim tayyor) uchun smenada faol siro qopi apparatga ulangan bo\'lishi kerak. «Xomashyo (siro / kraska)» sahifasida qopni ulang.',
    shiftSemiNeedActiveBagSubmit:
      'Qolip apparati uchun siro qopi ulanmagan yoki siro yo\'q — smena saqlanmaydi.',
    shiftSemiAddLineBlocked:
      'Faqat qolip apparatlari qolganda siro qopsisiz yangi qator qo\'shib bo\'lmaydi.',
    shiftSiroGoRawMaterial: '«Xomashyo»ga o\'tish',
    shiftSiroBagLow: 'Faol qopda siro oz qoldi: {kg} kg · {name}',
    shiftSiroBagEmpty: 'Faol qopda siro tugadi — yangi qopni ulang · {name}',
  },
  ru: {
    title: 'Учёт смен',
    subtitle: 'Две смены — контроль работы сотрудников',
    kpiWorkers: 'Рабочих сегодня',
    kpiProduced: 'Всего произведено',
    kpiBrak: 'Всего брака',
    kpiKwh: 'Всего эл. (кВт·ч)',
    tab1: 'Добавить смену',
    tab2: 'История смен',
    tab3: 'Сотрудники',
    formTitle: 'Новая запись смены',
    labelDate: 'Дата',
    labelShift: 'Смена',
    labelWorker: 'Имя рабочего',
    labelMachine: 'Аппарат',
    labelHours: 'Часов работы',
    labelProduct: 'Вид продукта',
    labelReading: 'Показатель аппарата',
    labelProduced: 'Готовой продукции (шт)',
    labelDefect: 'Кол-во брака (шт)',
    labelNotes: 'Примечание',
    autoKwh: '⚡ Автоматический расчёт тока:',
    btn: 'Сохранить запись смены',
    formAddRow: '+ строка',
    colNum: '№',
    colDate: 'Дата',
    colShift: 'Смена',
    colWorker: 'Рабочий',
    colProduct: 'Продукт',
    colMachine: 'Аппарат',
    colHours: 'Часы',
    colReading: 'Показатель',
    colDefect: 'Брак',
    colProduced: 'Готово',
    colKwh: 'эл. (кВт·ч)',
    addWorker: 'Добавить сотрудника',
    workerName: 'Имя сотрудника',
    workerList: 'Список сотрудников',
    total: 'Итого',
    records: 'записей',
    noData: 'Нет данных',
    placeholderWorker: 'Выберите или введите имя...',
    placeholderReading: 'пр: 43,069 / 41,203',
    placeholderNotes: 'Примечание (необязательно)...',
    shiftTime1: '06:00 – 18:00',
    shiftTime2: '18:00 – 06:00',
    brakPercent: '% брак',
    tab4: 'Оборудование',
    machineAddTitle: 'Добавить новое оборудование',
    machineName: 'Название аппарата',
    machineDesc: 'Что делает',
    machinePower: 'кВт/час (расход тока)',
    machineCapacity: 'Макс. произв./час (шт)',
    machineType: 'Тип',
    machineTypeSemi: 'Преформа (полуфабрикат)',
    machineTypeFinal: 'Бутылка (готовое)',
    machineAddBtn: 'Добавить аппарат',
    machineList: 'Существующее оборудование',
    machineActive: 'Активен',
    machineInactive: 'Неактивен',
    machineUsedInShift: 'записей смены',
    machineKwPerHour: 'кВт/час',
    machinePlaceholderName: 'пр: Машина для преформ #1',
    machinePlaceholderDesc: 'пр: Производит PET преформы (заготовки)',
    tab5: 'Смены',
    shiftDefsTitle: 'Настройка смен',
    shiftDefsSubtitle: 'Задайте название и время; добавление, редактирование или удаление смены',
    shiftDefName: 'Название смены',
    shiftDefTimeFrom: 'Начало',
    shiftDefTimeTo: 'Окончание',
    shiftDefAdd: 'Добавить смену',
    shiftDefSave: 'Сохранить',
    shiftDefCancel: 'Отмена',
    shiftDefDelete: 'Удалить',
    shiftDefEdit: 'Изменить',
    shiftDefDeleteBlocked: 'Есть записи смены с этим номером — удалите записи или перенесите их',
    shiftNoDefsHint: 'Смены ещё не настроены. Сначала добавьте хотя бы одну смену во вкладке «Смены».',
    shiftNoDefsGoToTab: 'Перейти к «Смены»',
    productTypesEmptyHint:
      'Типы продукции ещё не заданы. Добавьте полуфабрикаты или готовую продукцию на складе (или дождитесь загрузки каталога).',
    machinePowerKwZeroHint:
      'У аппарата мощность (кВт) = 0 — не считается электроэнергия и расход в «Расходах». Укажите мощность во вкладке «Аппараты».',
    shiftDefInUseRecords: 'Используется в записях',
    shiftGenericName: 'Смена {n}',
    kpiUnitPieces: 'шт',
    kpiUnitKwh: 'кВт·ч',
    shiftNoDefect: 'Брака нет',
    shiftDefectWarn: 'Брак: {count} ({pct}%)',
    unitPiecesAbbr: 'шт',
    machinePerHour: 'шт/час',
    workerStatLine: '{n} записей · всего {h} ч',
    workerReady: 'готово',
    workerBrakLabel: 'брак',
    todayPreviewTitle: 'Сегодня',
    todayPreviewFullscreen: 'На весь экран',
    todayPreviewExitFullscreen: 'Выйти из полноэкранного режима',
    timelineShowMore: 'Ещё {n}',
    timelineCollapse: 'Свернуть',
    editShiftRecord: 'Редактировать запись',
    saveChanges: 'Сохранить изменения',
    close: 'Закрыть',
    hoursShort: 'ч',
    confirmDelete: 'Подтвердите удаление',
    colActions: 'Действия',
    workerPreferredShift: 'Основная смена',
    workerShiftUnset: 'Не указана',
    workerPhone: 'Телефон',
    workerPositionShort: 'Должность',
    workerCardShort: '№ карты',
    workerEditTitle: 'Изменить данные сотрудника',
    workerOrphansTitle: 'Только в записях смены (нет записи в базе)',
    workerDuplicate: 'Сотрудник с таким именем уже есть',
    workerOptional: 'необязательно',
    shiftPaintQuestion: 'Использовалась краска/краситель? (преформа)',
    shiftPaintMaterial: 'Краска / сырьё',
    shiftPaintQty: 'Количество',
    shiftPaintUnitKg: 'кг',
    shiftPaintUnitG: 'г',
    shiftPaintUnitLabel: 'Единица',
    shiftPaintError: 'Если краска — укажите тип и количество',
    shiftPaintNoMaterials:
      'Нет позиций типа «краска». Добавьте сырьё на странице сырья с типом «краска».',
    shiftSemiNeedActiveBagBanner:
      'Для полуфабрикатов в смене должен быть подключён активный мешок сиропа. Подключите мешок на странице сырья.',
    shiftSemiNeedActiveBagSubmit:
      'Для аппарата преформ не подключён мешок или сироп израсходован — запись не сохранится.',
    shiftSemiAddLineBlocked:
      'Нельзя добавить строку: в списке только преформы, а мешок с сиропом не готов.',
    shiftSiroGoRawMaterial: 'К сырью',
    shiftSiroBagLow: 'В активном мешке мало сиропа: {kg} кг · {name}',
    shiftSiroBagEmpty: 'В активном мешке сироп закончился — подключите новый · {name}',
  },
};

function getShiftLabel(defs: ShiftDefinition[], number: number, t: (typeof TR)['ru']) {
  const d = defs.find((x) => x.number === number);
  const name = d?.name?.trim();
  if (name) return name;
  return t.shiftGenericName.replace('{n}', String(number));
}

function getShiftTimeDisplay(defs: ShiftDefinition[], number: number, t: (typeof TR)['ru']) {
  const d = defs.find((x) => x.number === number);
  if (d?.timeFrom && d?.timeTo) return `${d.timeFrom} – ${d.timeTo}`;
  if (number === 1) return t.shiftTime1;
  if (number === 2) return t.shiftTime2;
  return '';
}

type UiDropdownOption = { value: string; label: string };

/** Brauzer <select> o‘rniga — rounded panel, tizim dizayniga mos */
function UiDropdown({
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  options: UiDropdownOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? placeholder;

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-400 min-w-0"
      >
        <span className="truncate">{display}</span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute z-[100] left-0 right-0 mt-1.5 py-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value === '' ? '__empty' : opt.value} role="presentation" className="px-1">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-colors min-w-0 ${
                    active
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/90'
                  }`}
                >
                  <span className="block truncate">{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Soat: vergul yoki nuqta; `type="number"` vergulda qiymatni yo‘qotmasligi uchun */
function parseDecimalInput(raw: string): number {
  const normalized = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (normalized === '' || normalized === '.') return 0;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

function isValidPartialDecimalHours(raw: string): boolean {
  const v = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (v === '') return true;
  return /^[0-9]*\.?[0-9]*$/.test(v);
}

/** Tayyor mahsulot / brak: bo‘shliq bilan (5 000) va faqat raqam */
function parseNonNegativeInt(raw: string): number {
  const digits = String(raw).trim().replace(/\s/g, '').replace(/[^\d]/g, '');
  if (digits === '') return NaN;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : NaN;
}

function isValidPartialNonNegativeInt(raw: string): boolean {
  const v = String(raw).trim().replace(/\s/g, '').replace(/[^\d]/g, '');
  return v === '' || /^\d+$/.test(v);
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ShiftWork() {
  const { state, dispatch, refresh } = useERP();
  const { lang, filterData, t: appT } = useApp();
  const t = TR[lang];

  const todayPreviewPanelRef = useRef<HTMLDivElement>(null);
  const [todayPreviewFullscreen, setTodayPreviewFullscreen] = useState(false);

  const historyPanelRef = useRef<HTMLDivElement>(null);
  const [historyFullscreen, setHistoryFullscreen] = useState(false);

  const [catalogSemiNames, setCatalogSemiNames] = useState<string[]>([]);
  const [catalogFinishedNames, setCatalogFinishedNames] = useState<string[]>([]);

  useEffect(() => {
    if (state.warehouseProducts.length > 0) return;
    let isMounted = true;
    apiRequest<{
      semiProducts: Array<{ name: string }>;
      finishedProducts: Array<{ name: string }>;
    }>('/warehouse/catalog')
      .then((catalog) => {
        if (!isMounted) return;
        const semis = catalog.semiProducts
          .map((p) => p.name?.trim?.() ?? '')
          .filter(Boolean);
        const fins = catalog.finishedProducts
          .map((p) => p.name?.trim?.() ?? '')
          .filter(Boolean);
        setCatalogSemiNames(Array.from(new Set(semis)));
        setCatalogFinishedNames(Array.from(new Set(fins)));
      })
      .catch(() => {
        // ignore (permissions/offline)
      });
    return () => {
      isMounted = false;
    };
  }, [state.warehouseProducts.length]);

  useEffect(() => {
    const sync = () => {
      setTodayPreviewFullscreen(
        document.fullscreenElement === todayPreviewPanelRef.current,
      );
      setHistoryFullscreen(
        document.fullscreenElement === historyPanelRef.current,
      );
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggleTodayPreviewFullscreen = useCallback(async () => {
    const el = todayPreviewPanelRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else {
          const wk = (
            el as HTMLElement & { webkitRequestFullscreen?: () => void }
          ).webkitRequestFullscreen;
          if (wk) wk.call(el);
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => void;
        };
        doc.webkitExitFullscreen?.();
      }
    } catch {
      /* fullscreen declined or unsupported */
    }
  }, []);

  const toggleHistoryFullscreen = useCallback(async () => {
    const el = historyPanelRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else {
          const wk = (
            el as HTMLElement & { webkitRequestFullscreen?: () => void }
          ).webkitRequestFullscreen;
          if (wk) wk.call(el);
        }
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => void;
        };
        doc.webkitExitFullscreen?.();
      }
    } catch {
      /* fullscreen declined or unsupported */
    }
  }, []);

  const semiProductTypes = useMemo(() => {
    const fromStore = state.warehouseProducts
      .filter((p) => p.itemType === 'SEMI_PRODUCT')
      .map((p) => p.name?.trim?.() ?? '')
      .filter(Boolean);
    const uniq = Array.from(new Set([...fromStore, ...catalogSemiNames]));
    return uniq.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [state.warehouseProducts, catalogSemiNames]);

  const finishedProductTypes = useMemo(() => {
    const fromStore = state.warehouseProducts
      .filter((p) => p.itemType === 'FINISHED_PRODUCT')
      .map((p) => p.name?.trim?.() ?? '')
      .filter(Boolean);
    const uniq = Array.from(new Set([...fromStore, ...catalogFinishedNames]));
    return uniq.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }, [state.warehouseProducts, catalogFinishedNames]);

  /** Ombor / katalog: ярим тайёр + тайёр номлари (қатъий fallback йўқ) */
  const shiftLineProductOptions = useMemo(() => {
    const uniq = Array.from(new Set([...semiProductTypes, ...finishedProductTypes]));
    return uniq.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );
  }, [semiProductTypes, finishedProductTypes]);

  const productTypes = shiftLineProductOptions;

  const [activeTab, setActiveTab] = useState<'form' | 'history' | 'workers' | 'machines' | 'shiftDefs'>('form');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newWorker, setNewWorker] = useState('');
  const [newWorkerShift, setNewWorkerShift] = useState(1);
  const [newWorkerPhone, setNewWorkerPhone] = useState('+998');
  const [workerFormError, setWorkerFormError] = useState('');
  const [workerInputOpen, setWorkerInputOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteWorkerConfirm, setDeleteWorkerConfirm] = useState<string | null>(null);
  const [workerEditor, setWorkerEditor] = useState<{
    id: string;
    fullName: string;
    phone: string;
    position: string;
    cardNumber: string;
    preferredShiftNumber: number | null;
  } | null>(null);
  const [workerEditorError, setWorkerEditorError] = useState('');
  const [deleteMachineConfirm, setDeleteMachineConfirm] = useState<string | null>(null);
  const [machineForm, setMachineForm] = useState({
    name: '', description: '', powerKw: '', maxCapacityPerHour: '', type: 'semi' as 'semi' | 'final',
  });
  const [machineError, setMachineError] = useState('');
  const [machineSuccess, setMachineSuccess] = useState('');

  const [shiftDefinitions, setShiftDefinitions] = useState<ShiftDefinition[]>(() => loadShiftDefinitions());
  const [shiftDefForm, setShiftDefForm] = useState({ name: '', timeFrom: '08:00', timeTo: '16:00' });
  const [editingShiftDefId, setEditingShiftDefId] = useState<string | null>(null);
  const [shiftDefError, setShiftDefError] = useState('');

  const [recordEditId, setRecordEditId] = useState<string | null>(null);
  const [recordEditForm, setRecordEditForm] = useState({
    date: TODAY,
    shift: 1,
    workerName: '',
    machineId: '',
    hoursWorked: '',
    productType: '18g',
    machineReading: '',
    producedQty: '',
    defectCount: '0',
    notes: '',
  });
  const [recordEditError, setRecordEditError] = useState('');

  const [timelineShiftExpanded, setTimelineShiftExpanded] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    try {
      localStorage.setItem(SHIFT_DEFS_KEY, JSON.stringify(shiftDefinitions));
    } catch {
      /* ignore */
    }
  }, [shiftDefinitions]);

  const sortedShiftDefs = useMemo(
    () => [...shiftDefinitions].sort((a, b) => a.number - b.number),
    [shiftDefinitions],
  );

  const timelineShiftNumbers = useMemo(() => {
    const set = new Set(sortedShiftDefs.map((d) => d.number));
    state.shiftRecords.filter((r) => r.date === TODAY).forEach((r) => set.add(r.shift));
    return [...set].sort((a, b) => a - b);
  }, [sortedShiftDefs, state.shiftRecords]);

  const sortedEmployees = useMemo(
    () => [...state.employees].sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' })),
    [state.employees],
  );

  const orphanWorkerNames = useMemo(
    () =>
      state.workers.filter(
        (w) => Boolean(w?.trim()) && !state.employees.some((e) => e.fullName === w),
      ),
    [state.workers, state.employees],
  );

  useEffect(() => {
    if (sortedShiftDefs.length === 0) return;
    if (!sortedShiftDefs.some((d) => d.number === newWorkerShift)) {
      setNewWorkerShift(sortedShiftDefs[0].number);
    }
  }, [sortedShiftDefs, newWorkerShift]);

  const [form, setForm] = useState({
    date: TODAY,
    shift: 1,
    workerName: '',
  });

  type ShiftLine = {
    id: string;
    machineId: string;
    hoursWorked: string;
    productType: string;
    machineReading: string;
    producedQty: string;
    defectCount: string;
    notes: string;
    paintUsed: boolean;
    paintRawMaterialId: string;
    paintQuantity: string;
    paintUnit: 'kg' | 'g';
  };

  const hasSemiMachines = useMemo(
    () => state.machines.some((m) => m.type === 'semi'),
    [state.machines],
  );
  const hasFinalMachines = useMemo(
    () => state.machines.some((m) => m.type === 'final'),
    [state.machines],
  );

  const siroBagReady = useMemo(() => {
    const b = state.activeRawMaterialBag;
    if (!b || b.status !== 'CONNECTED') return false;
    if (!Number.isFinite(b.currentQuantityKg) || b.currentQuantityKg <= SIRO_BAG_KG_EPS) {
      return false;
    }
    return true;
  }, [state.activeRawMaterialBag]);

  const semiShiftBlocked = hasSemiMachines && !siroBagReady;

  const shiftFormMachineOptions = useMemo(() => {
    if (!semiShiftBlocked) return state.machines;
    return state.machines.filter((m) => m.type !== 'semi');
  }, [state.machines, semiShiftBlocked]);

  const addLineBlockedBySiro = semiShiftBlocked && !hasFinalMachines;

  const siroBagActive = state.activeRawMaterialBag;
  const siroConnectedButEmpty = Boolean(
    siroBagActive &&
      siroBagActive.status === 'CONNECTED' &&
      Number.isFinite(siroBagActive.currentQuantityKg) &&
      siroBagActive.currentQuantityKg <= SIRO_BAG_KG_EPS,
  );

  const siroLowWarning = useMemo(() => {
    const b = state.activeRawMaterialBag;
    if (!b || b.status !== 'CONNECTED') return null;
    if (!Number.isFinite(b.currentQuantityKg) || b.currentQuantityKg <= SIRO_BAG_KG_EPS) return null;
    if (!Number.isFinite(b.initialQuantityKg) || b.initialQuantityKg <= SIRO_BAG_KG_EPS) return null;
    if (b.currentQuantityKg / b.initialQuantityKg > 0.12) return null;
    const name = [b.rawMaterialName, b.name].filter(Boolean).join(' · ') || b.name || b.rawMaterialName || '—';
    return { kgLabel: formatKgAmount(b.currentQuantityKg), name };
  }, [state.activeRawMaterialBag]);

  const createEmptyLine = useCallback((): ShiftLine => {
    const defaultMachineId = shiftFormMachineOptions[0]?.id || '';
    const defaultProductType = shiftLineProductOptions[0] || '';
    return {
      id: `line-${Math.random().toString(16).slice(2)}`,
      machineId: defaultMachineId,
      hoursWorked: '',
      productType: defaultProductType,
      machineReading: '',
      producedQty: '',
      defectCount: '0',
      notes: '',
      paintUsed: false,
      paintRawMaterialId: '',
      paintQuantity: '',
      paintUnit: 'kg',
    };
  }, [shiftFormMachineOptions, shiftLineProductOptions]);

  const [lines, setLines] = useState<ShiftLine[]>(() => []);

  useEffect(() => {
    if (lines.length > 0) return;
    setLines([createEmptyLine()]);
  }, [lines.length, createEmptyLine]);

  const workerSuggestions = useMemo(() => {
    const query = form.workerName.trim().toLowerCase();
    return state.workers.filter((w) =>
      !query ? true : w.toLowerCase().includes(query),
    );
  }, [state.workers, form.workerName]);

  const rawMaterialOptions = useMemo(() => {
    const paints = state.warehouseProducts.filter(
      (p): p is RawMaterialProduct =>
        p.itemType === 'RAW_MATERIAL' && p.rawMaterialKind === 'PAINT',
    );
    return paints.map((p) => ({ value: p.id, label: `${p.name} (${p.unit})` }));
  }, [state.warehouseProducts]);

  useEffect(() => {
    setLines((prev) => {
      let changed = false;
      const next = prev.map((ln) => {
        const allowed = shiftLineProductOptions;
        if (allowed.length === 0) {
          if (ln.productType) {
            changed = true;
            return { ...ln, productType: '' };
          }
          return ln;
        }
        const fallback = allowed[0];
        if (allowed.includes(ln.productType)) return ln;
        changed = true;
        return { ...ln, productType: fallback };
      });
      return changed ? next : prev;
    });
  }, [state.machines, shiftLineProductOptions]);

  useEffect(() => {
    const defaultId = shiftFormMachineOptions[0]?.id;
    if (!defaultId) return;
    setLines((prev) => {
      let changed = false;
      const next = prev.map((ln) => {
        if (ln.machineId) return ln;
        changed = true;
        return { ...ln, machineId: defaultId };
      });
      return changed ? next : prev;
    });
  }, [shiftFormMachineOptions]);

  useEffect(() => {
    if (!semiShiftBlocked) return;
    const allowed = shiftFormMachineOptions;
    const fallback = allowed[0]?.id;
    if (!fallback) return;
    const allowedIds = new Set(allowed.map((m) => m.id));
    setLines((prev) => {
      let changed = false;
      const next = prev.map((ln) => {
        if (allowedIds.has(ln.machineId)) return ln;
        changed = true;
        const prevMachine = state.machines.find((x) => x.id === ln.machineId);
        const nextLine: ShiftLine = { ...ln, machineId: fallback };
        if (prevMachine?.type === 'semi') {
          nextLine.paintUsed = false;
          nextLine.paintRawMaterialId = '';
          nextLine.paintQuantity = '';
          nextLine.paintUnit = 'kg';
        }
        return nextLine;
      });
      return changed ? next : prev;
    });
  }, [semiShiftBlocked, shiftFormMachineOptions, state.machines]);

  useEffect(() => {
    if (sortedShiftDefs.length === 0) return;
    if (!sortedShiftDefs.some((d) => d.number === form.shift)) {
      setForm((prev) => ({ ...prev, shift: sortedShiftDefs[0].number }));
    }
  }, [sortedShiftDefs, form.shift]);

  const openRecordEditor = useCallback(
    (r: ShiftRecord) => {
      setRecordEditId(r.id);
      setRecordEditError('');
      const allowedMachines = semiShiftBlocked
        ? state.machines.filter((m) => m.type !== 'semi')
        : state.machines;
      const fallbackMid = allowedMachines[0]?.id || state.machines[0]?.id || '';
      const mid =
        r.machineId && allowedMachines.some((m) => m.id === r.machineId)
          ? r.machineId
          : fallbackMid;
      setRecordEditForm({
        date: r.date,
        shift: r.shift,
        workerName: r.workerName,
        machineId: mid,
        hoursWorked: String(r.hoursWorked),
        productType: r.productType || '',
        machineReading: r.machineReading,
        producedQty: String(r.producedQty),
        defectCount: String(r.defectCount),
        notes: r.notes,
      });
    },
    [state.machines, semiShiftBlocked],
  );

  const closeRecordEditor = useCallback(() => {
    setRecordEditId(null);
    setRecordEditError('');
  }, []);

  const saveRecordEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordEditId) return;
    setRecordEditError('');
    const hours = parseDecimalInput(recordEditForm.hoursWorked);
    if (!hours || hours <= 0) {
      setRecordEditError(t.labelHours + '!');
      return;
    }
    const produced = parseNonNegativeInt(recordEditForm.producedQty);
    if (Number.isNaN(produced) || produced < 0) {
      setRecordEditError(t.labelProduced + '!');
      return;
    }
    if (!recordEditForm.productType.trim()) {
      setRecordEditError(t.labelProduct + '!');
      return;
    }
    const sel = state.machines.find((m) => m.id === recordEditForm.machineId);
    if (sel?.type === 'semi' && !siroBagReady) {
      setRecordEditError(t.shiftSemiNeedActiveBagSubmit);
      return;
    }
    if (sel && (!Number.isFinite(sel.powerKw) || sel.powerKw <= 0)) {
      setRecordEditError(t.machinePowerKwZeroHint);
      return;
    }
    const kwhEdit = hours * (sel?.powerKw || 0);
    try {
      await dispatch({
        type: 'UPDATE_SHIFT_RECORD',
        payload: {
          id: recordEditId,
          date: recordEditForm.date,
          shift: recordEditForm.shift,
          machineId: recordEditForm.machineId,
          hoursWorked: hours,
          productType: recordEditForm.productType,
          machineReading: recordEditForm.machineReading,
          producedQty: produced,
          defectCount: Math.max(0, parseNonNegativeInt(recordEditForm.defectCount) || 0),
          electricityKwh: parseFloat(kwhEdit.toFixed(1)),
          notes: recordEditForm.notes,
        },
      });
      // Elektr xarajati (Expense) backendda sync qilinadi; ro‘yxatni yangilab olamiz.
      await refresh();
      closeRecordEditor();
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error';
      setRecordEditError(translateShiftInventoryApiError(raw, appT));
    }
  };

  const updateLine = useCallback((id: string, patch: Partial<ShiftLine>) => {
    setLines((prev) =>
      prev.map((ln) => {
        if (ln.id !== id) return ln;
        const next = { ...ln, ...patch };
        if (patch.machineId !== undefined) {
          const machine = state.machines.find((m) => m.id === next.machineId);
          const allowed = shiftLineProductOptions;
          const fallback = allowed[0];
          if (fallback && !allowed.includes(next.productType)) {
            next.productType = fallback;
          }
          if (!fallback && next.productType) {
            next.productType = '';
          }
          if (machine?.type !== 'semi') {
            next.paintUsed = false;
            next.paintRawMaterialId = '';
            next.paintQuantity = '';
            next.paintUnit = 'kg';
          }
        }
        return next;
      }),
    );
  }, [state.machines, shiftLineProductOptions]);

  const addLine = useCallback(() => {
    if (addLineBlockedBySiro) return;
    setLines((prev) => [...prev, createEmptyLine()]);
  }, [createEmptyLine, addLineBlockedBySiro]);

  const removeLine = useCallback((id: string) => {
    setLines((prev) => {
      const next = prev.filter((ln) => ln.id !== id);
      return next.length > 0 ? next : [createEmptyLine()];
    });
  }, [createEmptyLine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (sortedShiftDefs.length === 0 || !sortedShiftDefs.some((d) => d.number === form.shift)) {
      setError(t.shiftNoDefsHint);
      return;
    }
    if (shiftLineProductOptions.length === 0) {
      setError(t.productTypesEmptyHint);
      return;
    }
    if (!form.workerName.trim()) { setError(t.labelWorker + '!'); return; }

    const meaningfulLines = lines.filter((ln) => {
      const any =
        Boolean(ln.machineId) ||
        Boolean(ln.hoursWorked.trim()) ||
        Boolean(ln.producedQty.trim()) ||
        Boolean(ln.machineReading.trim()) ||
        Boolean(ln.notes.trim());
      return any;
    });

    if (meaningfulLines.length === 0) {
      setError(t.labelMachine + ' / ' + t.labelHours + '!');
      return;
    }

    for (const ln of meaningfulLines) {
      const hours = parseDecimalInput(ln.hoursWorked);
      if (!hours || hours <= 0) { setError(t.labelHours + '!'); return; }
      const produced = parseNonNegativeInt(ln.producedQty);
      if (Number.isNaN(produced) || produced < 0) { setError(t.labelProduced + '!'); return; }
      if (!ln.machineId) { setError(t.labelMachine + '!'); return; }
      if (!ln.productType) { setError(t.labelProduct + '!'); return; }
      const machine = state.machines.find((m) => m.id === ln.machineId);
      if (machine?.type === 'semi' && !siroBagReady) {
        setError(t.shiftSemiNeedActiveBagSubmit);
        return;
      }
      if (machine?.type === 'semi' && ln.paintUsed) {
        if (!ln.paintRawMaterialId) {
          setError(t.shiftPaintError);
          return;
        }
        const pq = parseDecimalInput(ln.paintQuantity);
        if (!pq || pq <= 0) {
          setError(t.shiftPaintError);
          return;
        }
      }
    }

    for (const ln of meaningfulLines) {
      const hours = parseDecimalInput(ln.hoursWorked);
      const sel = state.machines.find((m) => m.id === ln.machineId);
      if (hours > 0 && sel && (!Number.isFinite(sel.powerKw) || sel.powerKw <= 0)) {
        setError(t.machinePowerKwZeroHint);
        return;
      }
    }

    try {
      if (!state.workers.some((w) => w === form.workerName.trim())) {
        await dispatch({
          type: 'ADD_WORKER',
          payload: { fullName: form.workerName.trim(), preferredShiftNumber: form.shift },
        });
        await refresh();
      }

      for (const ln of meaningfulLines) {
        const hours = parseDecimalInput(ln.hoursWorked);
        const sel = state.machines.find((m) => m.id === ln.machineId);
        const kwh = hours * (sel?.powerKw || 0);
        const paintPayload: Partial<
          Pick<ShiftRecord, 'paintUsed' | 'paintRawMaterialId' | 'paintQuantityKg'>
        > = {};
        if (sel?.type === 'semi' && ln.paintUsed) {
          const pq = parseDecimalInput(ln.paintQuantity);
          const paintQuantityKg = ln.paintUnit === 'g' ? pq / 1000 : pq;
          paintPayload.paintUsed = true;
          paintPayload.paintRawMaterialId = ln.paintRawMaterialId;
          paintPayload.paintQuantityKg = paintQuantityKg;
        } else {
          paintPayload.paintUsed = false;
        }
        await dispatch({
          type: 'ADD_SHIFT_RECORD',
          payload: {
            date: form.date,
            shift: form.shift,
            workerName: form.workerName.trim(),
            machineId: ln.machineId,
            hoursWorked: hours,
            productType: ln.productType,
            machineReading: ln.machineReading,
            producedQty: Math.max(0, parseNonNegativeInt(ln.producedQty) || 0),
            defectCount: Math.max(0, parseNonNegativeInt(ln.defectCount) || 0),
            electricityKwh: parseFloat(kwh.toFixed(1)),
            notes: ln.notes,
            ...paintPayload,
          }
        });
      }
      // Elektr xarajati (Expense) backendda sync qilinadi; sahifalarda ko‘rish uchun yangilash kerak.
      await refresh();
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error';
      setError(translateShiftInventoryApiError(raw, appT));
      return;
    }

    setSuccess(`${form.workerName} — ${getShiftLabel(shiftDefinitions, form.shift, t)} ✓`);
    setTimeout(() => setSuccess(''), 4000);
    setForm(prev => ({
      ...prev,
      workerName: '',
    }));
    setLines([createEmptyLine()]);
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerFormError('');
    const name = newWorker.trim();
    if (!name) return;
    if (state.employees.some((emp) => emp.fullName.toLowerCase() === name.toLowerCase())) {
      setWorkerFormError(t.workerDuplicate);
      return;
    }
    try {
      await dispatch({
        type: 'ADD_WORKER',
        payload: {
          fullName: name,
          preferredShiftNumber: sortedShiftDefs.some((d) => d.number === newWorkerShift)
            ? newWorkerShift
            : undefined,
          phone: newWorkerPhone.trim().length > 4 ? newWorkerPhone.trim() : undefined,
        },
      });
      setNewWorker('');
      setNewWorkerPhone('+998');
    } catch (err) {
      setWorkerFormError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_SHIFT_RECORD', payload: id });
    setDeleteConfirm(null);
  };

  const handleDeleteWorker = (userId: string) => {
    dispatch({ type: 'DELETE_WORKER', payload: userId });
    setDeleteWorkerConfirm(null);
  };

  const openWorkerEditor = (emp: Employee) => {
    setWorkerEditorError('');
    setWorkerEditor({
      id: emp.id,
      fullName: emp.fullName,
      phone: emp.phone ?? '',
      position: emp.position ?? '',
      cardNumber: emp.cardNumber ?? '',
      preferredShiftNumber: emp.preferredShiftNumber ?? null,
    });
  };

  const saveWorkerEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerEditor) return;
    setWorkerEditorError('');
    if (!workerEditor.fullName.trim()) {
      setWorkerEditorError(t.workerName + '!');
      return;
    }
    try {
      await dispatch({
        type: 'UPDATE_WORKER',
        payload: {
          id: workerEditor.id,
          fullName: workerEditor.fullName.trim(),
          phone: workerEditor.phone.trim() || undefined,
          position: workerEditor.position.trim() || undefined,
          cardNumber: workerEditor.cardNumber.trim() || undefined,
          preferredShiftNumber: workerEditor.preferredShiftNumber,
        },
      });
      setWorkerEditor(null);
    } catch (err) {
      setWorkerEditorError(err instanceof Error ? err.message : 'Error');
    }
  };

  // Filter by date
  const filteredRecords = useMemo(() => {
    const arr = filterData([...state.shiftRecords]);
    return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.shiftRecords, filterData]);

  const recordEditShiftOptions = useMemo((): UiDropdownOption[] => {
    if (!recordEditId) return [];
    const n = recordEditForm.shift;
    const fromDefs = sortedShiftDefs.map((d) => ({
      value: String(d.number),
      label: `${d.number} — ${getShiftLabel(shiftDefinitions, d.number, t)}`,
    }));
    if (fromDefs.some((o) => Number(o.value) === n)) return fromDefs;
    return [
      ...fromDefs,
      {
        value: String(n),
        label: `${n} — ${getShiftLabel(shiftDefinitions, n, t)}`,
      },
    ];
  }, [recordEditId, recordEditForm.shift, sortedShiftDefs, shiftDefinitions, t]);

  // Today's stats (always from full state)
  const todayRecords = state.shiftRecords.filter(r => r.date === TODAY);
  const todayWorkers = new Set(todayRecords.map(r => r.workerName)).size;
  const todayProduced = todayRecords.reduce((s, r) => s + r.producedQty, 0);
  const todayBrak = todayRecords.reduce((s, r) => s + r.defectCount, 0);
  const todayKwh = todayRecords.reduce((s, r) => s + r.electricityKwh, 0);
  const brakPercent = todayProduced > 0 ? ((todayBrak / (todayProduced + todayBrak)) * 100).toFixed(1) : '0';

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    setMachineError('');
    if (!machineForm.name.trim()) { setMachineError(t.machineName + '!'); return; }
    if (!machineForm.description.trim()) { setMachineError(t.machineDesc + '!'); return; }
    const power = parseFloat(machineForm.powerKw);
    if (!machineForm.powerKw || isNaN(power) || power <= 0) { setMachineError(t.machinePower + '!'); return; }
    dispatch({
      type: 'ADD_MACHINE',
      payload: {
        name: machineForm.name.trim(),
        description: machineForm.description.trim(),
        powerKw: power,
        maxCapacityPerHour: parseInt(machineForm.maxCapacityPerHour) || 5000,
        type: machineForm.type,
      }
    });
    setMachineSuccess(machineForm.name + ' ✓');
    setTimeout(() => setMachineSuccess(''), 3000);
    setMachineForm({ name: '', description: '', powerKw: '', maxCapacityPerHour: '', type: 'semi' });
  };

  const handleDeleteMachine = (id: string) => {
    dispatch({ type: 'DELETE_MACHINE', payload: id });
    setDeleteMachineConfirm(null);
  };

  const tabs = [
    { key: 'form', label: t.tab1, icon: Plus },
    { key: 'history', label: t.tab2, icon: Clock },
    { key: 'shiftDefs', label: t.tab5, icon: Layers },
    { key: 'workers', label: t.tab3, icon: Users },
    { key: 'machines', label: t.tab4, icon: Cpu },
  ];

  const addOrUpdateShiftDef = (e: React.FormEvent) => {
    e.preventDefault();
    setShiftDefError('');
    if (!shiftDefForm.timeFrom.trim() || !shiftDefForm.timeTo.trim()) {
      setShiftDefError(t.shiftDefTimeFrom + ' / ' + t.shiftDefTimeTo + '!');
      return;
    }
    if (editingShiftDefId) {
      setShiftDefinitions((prev) =>
        prev.map((d) =>
          d.id === editingShiftDefId
            ? { ...d, name: shiftDefForm.name.trim(), timeFrom: shiftDefForm.timeFrom.trim(), timeTo: shiftDefForm.timeTo.trim() }
            : d,
        ),
      );
      setEditingShiftDefId(null);
    } else {
      const nextNum = Math.max(0, ...shiftDefinitions.map((d) => d.number)) + 1;
      setShiftDefinitions((prev) => [
        ...prev,
        {
          id: `def-${Date.now()}`,
          number: nextNum,
          name: shiftDefForm.name.trim(),
          timeFrom: shiftDefForm.timeFrom.trim(),
          timeTo: shiftDefForm.timeTo.trim(),
        },
      ]);
    }
    setShiftDefForm({ name: '', timeFrom: '08:00', timeTo: '16:00' });
  };

  const deleteShiftDef = (id: string) => {
    const d = shiftDefinitions.find((x) => x.id === id);
    if (!d) return;
    if (state.shiftRecords.some((r) => r.shift === d.number)) {
      setShiftDefError(t.shiftDefDeleteBlocked);
      setTimeout(() => setShiftDefError(''), 5000);
      return;
    }
    setShiftDefinitions((prev) => prev.filter((x) => x.id !== id));
    setShiftDefError('');
    if (editingShiftDefId === id) {
      setEditingShiftDefId(null);
      setShiftDefForm({ name: '', timeFrom: '08:00', timeTo: '16:00' });
    }
  };

  const startEditShiftDef = (d: ShiftDefinition) => {
    setEditingShiftDefId(d.id);
    setShiftDefForm({ name: d.name, timeFrom: d.timeFrom, timeTo: d.timeTo });
    setShiftDefError('');
  };

  const cancelEditShiftDef = () => {
    setEditingShiftDefId(null);
    setShiftDefForm({ name: '', timeFrom: '08:00', timeTo: '16:00' });
    setShiftDefError('');
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden p-3 min-[400px]:p-4 lg:p-6 space-y-4 min-[400px]:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 dark:text-white text-lg min-[400px]:text-xl font-bold leading-tight">{t.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs min-[400px]:text-sm mt-0.5">{t.subtitle}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 xl:grid-cols-4 gap-2 min-[400px]:gap-4">
        {[
          { icon: Users,      label: t.kpiWorkers,  val: String(todayWorkers),             sub: `${t.tab3}`,        color: 'bg-indigo-500',  shadow: 'shadow-indigo-200 dark:shadow-indigo-900/30' },
          { icon: BarChart3,  label: t.kpiProduced, val: formatNumber(todayProduced),       sub: t.kpiUnitPieces,             color: 'bg-emerald-500', shadow: 'shadow-emerald-200 dark:shadow-emerald-900/30' },
          { icon: AlertTriangle, label: t.kpiBrak,  val: formatNumber(todayBrak),           sub: `${brakPercent}${t.brakPercent}`, color: todayBrak > 0 ? 'bg-red-500' : 'bg-slate-500', shadow: 'shadow-red-200 dark:shadow-red-900/30' },
          { icon: Zap,        label: t.kpiKwh,      val: formatNumber(todayKwh),            sub: t.kpiUnitKwh,              color: 'bg-yellow-500',  shadow: 'shadow-yellow-200 dark:shadow-yellow-900/30' },
        ].map(card => (
          <div key={card.label} className={`bg-gradient-to-br ${card.color} to-opacity-90 rounded-xl min-[400px]:rounded-2xl p-3 min-[400px]:p-4 text-white shadow-lg ${card.shadow}`}>
            <card.icon size={18} className="mb-2 min-[400px]:mb-3 opacity-80" />
            <p className="text-white/80 text-[11px] min-[400px]:text-xs mb-1">{card.label}</p>
            <p className="text-xl min-[400px]:text-2xl font-bold leading-none">{card.val}</p>
            <p className="text-white/70 text-[11px] min-[400px]:text-xs mt-1.5 break-words">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Shift timeline — today */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 min-[400px]:gap-4">
        {timelineShiftNumbers.map((s) => {
          const sRecs = state.shiftRecords.filter(r => r.date === TODAY && r.shift === s);
          const sc = shiftStyleFor(s);
          const label = getShiftLabel(shiftDefinitions, s, t);
          const timeDisp = getShiftTimeDisplay(shiftDefinitions, s, t);
          const expanded = timelineShiftExpanded[s] === true;
          const hiddenCount = Math.max(0, sRecs.length - TIMELINE_CARD_VISIBLE);
          const displayRecs =
            expanded || sRecs.length <= TIMELINE_CARD_VISIBLE
              ? sRecs
              : sRecs.slice(0, TIMELINE_CARD_VISIBLE);
          return (
            <div key={s} className="bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 p-3 min-[400px]:p-4 shadow-sm min-w-0">
              <div className="flex flex-wrap items-center gap-2 min-[400px]:gap-3 mb-3">
                <span title={label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold max-w-full min-w-0 ${sc.badge}`}>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${sc.dot}`} />
                  <span className="truncate">{label}</span>
                </span>
                {timeDisp ? (
                  <span className="text-slate-400 dark:text-slate-500 text-[11px] min-[400px]:text-xs whitespace-nowrap">{timeDisp}</span>
                ) : null}
                <span className="ml-auto text-slate-400 text-[11px] min-[400px]:text-xs shrink-0">{sRecs.length} {t.records}</span>
              </div>
              {sRecs.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">{t.noData}</p>
              ) : (
                <div className="space-y-2">
                  {displayRecs.map(r => {
                    const machine = state.machines.find(m => m.id === r.machineId);
                    const brakPct = r.producedQty + r.defectCount > 0 ? ((r.defectCount / (r.producedQty + r.defectCount)) * 100).toFixed(1) : '0';
                    return (
                      <div key={r.id} className="flex items-center gap-2 min-[400px]:gap-3 p-2 min-[400px]:p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 dark:text-white text-sm font-medium truncate">{r.workerName}</p>
                          <p className="text-slate-400 text-[11px] min-[400px]:text-xs truncate">{machine?.name} · {r.hoursWorked}{t.hoursShort} · {r.productType}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">{formatNumber(r.producedQty)}</p>
                          <p className={`text-[11px] min-[400px]:text-xs ${r.defectCount > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {r.defectCount > 0
                              ? t.shiftDefectWarn.replace('{count}', String(r.defectCount)).replace('{pct}', brakPct)
                              : `✓ ${t.shiftNoDefect}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {hiddenCount > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setTimelineShiftExpanded((prev) => ({
                          ...prev,
                          [s]: !prev[s],
                        }))
                      }
                      className="w-full mt-1 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      {expanded
                        ? t.timelineCollapse
                        : t.timelineShowMore.replace('{n}', String(hiddenCount))}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700 -mx-1 px-1 min-[400px]:mx-0 min-[400px]:px-0">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 min-[400px]:px-3 sm:px-4 py-2 min-[400px]:py-3 text-xs min-[400px]:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
            <Icon size={14} className="shrink-0" /> <span className="truncate max-w-[9rem] min-[360px]:max-w-none">{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: Form ── */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-[400px]:gap-6 min-w-0">
          {/* Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 min-[400px]:p-5 shadow-sm min-w-0">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Plus size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.formTitle}</h3>
            </div>

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">{success}</p>
              </div>
            )}

            {semiShiftBlocked && (
              <div
                className={`mb-4 p-3 rounded-xl border space-y-2 text-sm ${
                  siroConnectedButEmpty && siroBagActive
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                    : 'bg-amber-50/90 dark:bg-amber-950/35 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100/90'
                }`}
              >
                <p className="font-semibold leading-snug">
                  {siroConnectedButEmpty && siroBagActive
                    ? t.shiftSiroBagEmpty.replace(
                        '{name}',
                        [siroBagActive.rawMaterialName, siroBagActive.name].filter(Boolean).join(' · ') ||
                          siroBagActive.name ||
                          siroBagActive.rawMaterialName ||
                          '—',
                      )
                    : t.shiftSemiNeedActiveBagBanner}
                </p>
                <Link
                  to="/raw-material"
                  className="inline-flex w-fit items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  {t.shiftSiroGoRawMaterial}
                </Link>
              </div>
            )}

            {!semiShiftBlocked && siroLowWarning && (
              <div className="mb-4 p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/35 text-amber-950 dark:text-amber-100/90 text-sm font-medium leading-snug flex gap-2">
                <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p>
                  {t.shiftSiroBagLow
                    .replace('{kg}', siroLowWarning.kgLabel)
                    .replace('{name}', siroLowWarning.name)}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Date + Shift */}
              <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelDate}</label>
                  <SingleDatePicker
                    value={form.date}
                    onChange={(iso) => setForm({ ...form, date: iso || TODAY })}
                  />
                </div>
                <div className="min-w-0">
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelShift}</label>
                  {sortedShiftDefs.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-3 text-xs text-amber-950 dark:border-amber-800/70 dark:bg-amber-950/35 dark:text-amber-100/90 space-y-2">
                      <p>{t.shiftNoDefsHint}</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('shiftDefs')}
                        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        {t.shiftNoDefsGoToTab}
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {sortedShiftDefs.map((def) => (
                        <button
                          key={def.id}
                          type="button"
                          title={getShiftLabel(shiftDefinitions, def.number, t)}
                          onClick={() => setForm({ ...form, shift: def.number })}
                          className={`py-2 min-[400px]:py-2.5 rounded-xl text-xs min-[400px]:text-sm font-bold transition-all border truncate px-1 ${form.shift === def.number ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                        >
                          {def.number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Worker */}
              <div className="relative">
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelWorker}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.workerName}
                    onChange={e => { setForm({ ...form, workerName: e.target.value }); setWorkerInputOpen(true); }}
                    onFocus={() => setWorkerInputOpen(true)}
                    onBlur={() => {
                      // allow click on suggestion before closing
                      window.setTimeout(() => setWorkerInputOpen(false), 120);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && workerSuggestions.length > 0) {
                        e.preventDefault();
                        setForm({ ...form, workerName: workerSuggestions[0] });
                        setWorkerInputOpen(false);
                      }
                      if (e.key === 'Escape') {
                        setWorkerInputOpen(false);
                      }
                    }}
                    placeholder={t.placeholderWorker}
                    autoComplete="off"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
                  />
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400" />
                </div>
                {workerInputOpen && state.workers.length > 0 && (
                  <div className="absolute z-10 top-full mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden">
                    {workerSuggestions.map(w => (
                      <button key={w} type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setForm({ ...form, workerName: w }); setWorkerInputOpen(false); }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{w[0]}</span>
                        </div>
                        {w}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi lines: Machine + Hours + Product + ... */}
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {t.labelMachine} · {t.labelHours} · {t.labelProduct}
                </div>
                <button
                  type="button"
                  onClick={addLine}
                  disabled={addLineBlockedBySiro}
                  title={addLineBlockedBySiro ? t.shiftSemiAddLineBlocked : undefined}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 transition-colors ${
                    addLineBlockedBySiro
                      ? 'cursor-not-allowed opacity-45 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  <Plus size={14} /> {t.formAddRow}
                </button>
              </div>

              <div className="space-y-3">
                {lines.map((ln, idx) => {
                  const selectedMachine = state.machines.find((m) => m.id === ln.machineId);
                  const hours = parseDecimalInput(ln.hoursWorked);
                  const kwh = hours * (selectedMachine?.powerKw || 0);
                  return (
                    <div
                      key={ln.id}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50/60 dark:bg-slate-900/20 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          #{idx + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(ln.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                          title={t.shiftDefDelete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Machine + Hours */}
                      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelMachine}</label>
                          <UiDropdown
                            value={ln.machineId}
                            onChange={(machineId) => updateLine(ln.id, { machineId })}
                            options={shiftFormMachineOptions.map((m) => ({ value: m.id, label: m.name }))}
                            placeholder={t.labelMachine}
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelHours}</label>
                          <input
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            value={ln.hoursWorked}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (isValidPartialDecimalHours(v)) {
                                updateLine(ln.id, { hoursWorked: v });
                              }
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                      </div>

                      {/* Electricity calc */}
                      {hours > 0 && selectedMachine && (
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                          <p className="text-yellow-800 dark:text-yellow-400 text-xs font-semibold mb-1.5">{t.autoKwh}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">{selectedMachine.powerKw} kW × {hours}h =</span>
                            <span className="font-bold text-yellow-700 dark:text-yellow-400">{kwh.toFixed(1)} kWh</span>
                          </div>
                        </div>
                      )}

                      {/* Product type */}
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelProduct}</label>
                        {shiftLineProductOptions.length === 0 ? (
                          <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100/90">
                            {t.productTypesEmptyHint}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {shiftLineProductOptions.map((pt) => (
                              <button
                                key={pt}
                                type="button"
                                onClick={() => updateLine(ln.id, { productType: pt })}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                  ln.productType === pt
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : `${PRODUCT_COLORS[pt] ?? 'bg-white/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`
                                }`}
                              >
                                {pt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {selectedMachine?.type === 'semi' && (
                        <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/40 p-3 dark:border-indigo-800 dark:bg-indigo-950/20 space-y-3">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ln.paintUsed}
                              onChange={(e) =>
                                updateLine(ln.id, {
                                  paintUsed: e.target.checked,
                                  ...(e.target.checked
                                    ? {}
                                    : {
                                        paintRawMaterialId: '',
                                        paintQuantity: '',
                                        paintUnit: 'kg' as const,
                                      }),
                                })
                              }
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                            />
                            {t.shiftPaintQuestion}
                          </label>
                          {ln.paintUsed && (
                            <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-3">
                              <div className="min-[380px]:col-span-1">
                                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                                  {t.shiftPaintMaterial}
                                </label>
                                <UiDropdown
                                  value={ln.paintRawMaterialId}
                                  onChange={(paintRawMaterialId) =>
                                    updateLine(ln.id, { paintRawMaterialId })
                                  }
                                  options={rawMaterialOptions}
                                  placeholder={t.shiftPaintMaterial}
                                />
                                {rawMaterialOptions.length === 0 ? (
                                  <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-300">
                                    {t.shiftPaintNoMaterials}
                                  </p>
                                ) : null}
                              </div>
                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                                  {t.shiftPaintQty}
                                </label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  autoComplete="off"
                                  value={ln.paintQuantity}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (isValidPartialDecimalHours(v)) {
                                      updateLine(ln.id, { paintQuantity: v });
                                    }
                                  }}
                                  placeholder="0"
                                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                                  {t.shiftPaintUnitLabel}
                                </label>
                                <div className="flex rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => updateLine(ln.id, { paintUnit: 'kg' })}
                                    className={`flex-1 py-2.5 text-xs font-semibold ${ln.paintUnit === 'kg' ? 'bg-indigo-600 text-white' : 'bg-white/80 dark:bg-slate-700 text-slate-600'}`}
                                  >
                                    {t.shiftPaintUnitKg}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateLine(ln.id, { paintUnit: 'g' })}
                                    className={`flex-1 py-2.5 text-xs font-semibold ${ln.paintUnit === 'g' ? 'bg-indigo-600 text-white' : 'bg-white/80 dark:bg-slate-700 text-slate-600'}`}
                                  >
                                    {t.shiftPaintUnitG}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Machine reading */}
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelReading}</label>
                        <input
                          type="text"
                          value={ln.machineReading}
                          onChange={(e) => updateLine(ln.id, { machineReading: e.target.value })}
                          placeholder={t.placeholderReading}
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                        />
                      </div>

                      {/* Produced + Defect */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelProduced}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={ln.producedQty}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (isValidPartialNonNegativeInt(v)) {
                                updateLine(ln.id, { producedQty: v });
                              }
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="block text-red-500 text-xs font-medium mb-1.5">{t.labelDefect}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={ln.defectCount}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (isValidPartialNonNegativeInt(v)) {
                                updateLine(ln.id, { defectCount: v });
                              }
                            }}
                            placeholder="0"
                            className="w-full px-3 py-2.5 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.labelNotes}</label>
                        <input
                          type="text"
                          value={ln.notes}
                          onChange={(e) => updateLine(ln.id, { notes: e.target.value })}
                          placeholder={t.placeholderNotes}
                          className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/80 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={sortedShiftDefs.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
              >
                <CheckCircle2 size={16} /> {t.btn}
              </button>
            </form>
          </div>

          {/* Today's table preview */}
          <div
            ref={todayPreviewPanelRef}
            className={`lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-w-0 flex flex-col min-h-0 ${
              todayPreviewFullscreen
                ? '!rounded-none h-screen max-h-screen border-0 shadow-none'
                : ''
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 min-[400px]:px-5 py-3 min-[400px]:py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h3 className="text-slate-800 dark:text-white font-semibold text-xs min-[400px]:text-sm break-all">{t.todayPreviewTitle}: {TODAY}</h3>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs text-slate-400">{todayRecords.length} {t.records}</span>
                <button
                  type="button"
                  onClick={() => void toggleTodayPreviewFullscreen()}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                  title={todayPreviewFullscreen ? t.todayPreviewExitFullscreen : t.todayPreviewFullscreen}
                  aria-label={todayPreviewFullscreen ? t.todayPreviewExitFullscreen : t.todayPreviewFullscreen}
                >
                  {todayPreviewFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>
            {todayRecords.length === 0 ? (
              <div
                className={`flex flex-col items-center justify-center text-slate-400 gap-2 ${
                  todayPreviewFullscreen ? 'flex-1 min-h-[12rem]' : 'h-48'
                }`}
              >
                <Clock size={32} className="opacity-30" />
                <p className="text-sm">{t.noData}</p>
              </div>
            ) : (
              <div
                className={`overflow-x-auto ${
                  todayPreviewFullscreen ? 'flex-1 min-h-0 overflow-y-auto' : ''
                }`}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50">
                      {[t.colShift, t.colWorker, t.colProduct, t.colMachine, t.colHours, t.colReading, t.colDefect, t.colProduced, t.colKwh].map(h => (
                        <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {todayRecords.map((r, idx) => {
                      const machine = state.machines.find(m => m.id === r.machineId);
                      const sc = shiftStyleFor(r.shift);
                      const shiftLab = getShiftLabel(shiftDefinitions, r.shift, t);
                      const brakPct = r.producedQty + r.defectCount > 0 ? ((r.defectCount / (r.producedQty + r.defectCount)) * 100).toFixed(1) : '0';
                      return (
                        <tr key={r.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${idx % 2 !== 0 ? 'bg-slate-50/40 dark:bg-slate-800/40' : ''}`}>
                          <td className="px-3 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold max-w-[8rem] min-w-0 ${sc.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
                              <span className="truncate">{shiftLab}</span>
                            </span>
                          </td>
                          <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.workerName}</td>
                          <td className="px-3 py-3"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${PRODUCT_COLORS[r.productType] || 'bg-slate-100 text-slate-700'}`}>{r.productType}</span></td>
                          <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{machine?.name?.split(' ').slice(-1)[0] || '—'}</td>
                          <td className="px-3 py-3 text-center font-medium text-slate-700 dark:text-slate-300">{r.hoursWorked}{t.hoursShort}</td>
                          <td className="px-3 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">{r.machineReading || '—'}</td>
                          <td className="px-3 py-3 text-center">
                            {r.defectCount > 0 ? (
                              <span className="text-red-600 dark:text-red-400 font-bold text-xs">{r.defectCount} <span className="text-red-400 font-normal">({brakPct}%)</span></span>
                            ) : (
                              <span className="text-emerald-500 text-xs">✓</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(r.producedQty)}</td>
                          <td className="px-3 py-3 text-right text-xs text-yellow-600 dark:text-yellow-400 font-medium">{r.electricityKwh}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                      <td colSpan={6} className="px-3 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{t.total}</td>
                      <td className="px-3 py-3 text-center text-xs font-bold text-red-600">{todayBrak}</td>
                      <td className="px-3 py-3 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(todayProduced)}</td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-yellow-600">{todayKwh.toFixed(1)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: History ── */}
      {activeTab === 'history' && (
        <div
          ref={historyPanelRef}
          className={`bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-w-0 flex flex-col min-h-0 ${
            historyFullscreen
              ? '!rounded-none h-screen max-h-screen border-0 shadow-none'
              : ''
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 min-[400px]:px-5 py-3 min-[400px]:py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <h3 className="text-slate-800 dark:text-white font-semibold text-xs min-[400px]:text-sm">{t.tab2}</h3>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-slate-400">{filteredRecords.length} {t.records}</span>
              <button
                type="button"
                onClick={() => void toggleHistoryFullscreen()}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/80 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                title={historyFullscreen ? t.todayPreviewExitFullscreen : t.todayPreviewFullscreen}
                aria-label={historyFullscreen ? t.todayPreviewExitFullscreen : t.todayPreviewFullscreen}
              >
                {historyFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
          {filteredRecords.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center text-slate-400 gap-2 ${
                historyFullscreen ? 'flex-1 min-h-[12rem]' : 'h-48'
              }`}
            >
              <Clock size={32} className="opacity-30" />
              <p className="text-sm">{t.noData}</p>
            </div>
          ) : (
            <div
              className={`overflow-x-auto ${
                historyFullscreen ? 'flex-1 min-h-0 overflow-y-auto' : ''
              }`}
            >
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    {[t.colNum, t.colDate, t.colShift, t.colWorker, t.colProduct, t.colMachine, t.colHours, t.colReading, t.colDefect, t.colProduced, t.colKwh, t.colActions].map((h, i) => (
                      <th key={i} className="text-left px-2 min-[400px]:px-3 py-2 min-[400px]:py-3 text-[11px] min-[400px]:text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r, idx) => {
                    const machine = state.machines.find(m => m.id === r.machineId);
                    const sc = shiftStyleFor(r.shift);
                    const shiftLab = getShiftLabel(shiftDefinitions, r.shift, t);
                    const brakPct = r.producedQty + r.defectCount > 0 ? ((r.defectCount / (r.producedQty + r.defectCount)) * 100).toFixed(1) : '0';
                    return (
                      <tr key={r.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${idx % 2 !== 0 ? 'bg-slate-50/30 dark:bg-slate-800/30' : ''}`}>
                        <td className="px-2 min-[400px]:px-3 py-2 min-[400px]:py-3 text-xs text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-2 min-[400px]:px-3 py-2 min-[400px]:py-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(r.date)}</td>
                        <td className="px-2 min-[400px]:px-3 py-2 min-[400px]:py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] min-[400px]:text-xs font-semibold max-w-[7rem] min-[400px]:max-w-[10rem] min-w-0 ${sc.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
                            <span className="truncate">{shiftLab}</span>
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                              <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">{r.workerName[0]}</span>
                            </div>
                            {r.workerName}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${PRODUCT_COLORS[r.productType] || 'bg-slate-100 text-slate-700'}`}>{r.productType}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-500">{machine?.name?.split('#')[0]?.trim() || '—'}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <Clock size={10} className="text-slate-400" />{r.hoursWorked}{t.hoursShort}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400 font-mono">{r.machineReading || '—'}</td>
                        <td className="px-3 py-3 text-center">
                          {r.defectCount > 0 ? (
                            <div>
                              <span className="text-red-600 dark:text-red-400 font-bold text-xs">{r.defectCount}</span>
                              <span className="text-red-400 text-xs ml-0.5">({brakPct}%)</span>
                            </div>
                          ) : (
                            <span className="text-emerald-500 text-xs font-medium">✓ {t.shiftNoDefect}</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {formatNumber(r.producedQty)} <span className="text-xs font-normal text-slate-400">{t.unitPiecesAbbr}</span>
                        </td>
                        <td className="px-3 py-3 text-right text-xs">
                          <span className="flex items-center justify-end gap-1 text-yellow-600 dark:text-yellow-400">
                            <Zap size={10} />{r.electricityKwh}
                          </span>
                        </td>
                        <td className="px-2 min-[400px]:px-3 py-2 min-[400px]:py-3">
                          {deleteConfirm === r.id ? (
                            <div className="flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center gap-1">
                              <span className="text-[10px] text-slate-500 min-[400px]:sr-only">{t.confirmDelete}</span>
                              <button type="button" onClick={() => handleDelete(r.id)} className="text-xs text-red-600 hover:text-red-700 font-medium px-1">✓</button>
                              <button type="button" onClick={() => setDeleteConfirm(null)} className="text-xs text-slate-400 hover:text-slate-600 px-1">✕</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5">
                              <button type="button" title={t.editShiftRecord} onClick={() => openRecordEditor(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                <Pencil size={13} />
                              </button>
                              <button type="button" title={t.shiftDefDelete} onClick={() => setDeleteConfirm(r.id)} className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700">
                    <td colSpan={8} className="px-3 py-3 text-xs font-bold text-slate-700 dark:text-slate-200">{t.total} ({filteredRecords.length} {t.records})</td>
                    <td className="px-3 py-3 text-center text-xs font-bold text-red-600">
                      {filteredRecords.reduce((s, r) => s + r.defectCount, 0)}
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(filteredRecords.reduce((s, r) => s + r.producedQty, 0))}
                    </td>
                    <td className="px-3 py-3 text-right text-xs font-bold text-yellow-600">
                      {filteredRecords.reduce((s, r) => s + r.electricityKwh, 0).toFixed(1)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Shift definitions ── */}
      {activeTab === 'shiftDefs' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-[400px]:gap-6 min-w-0">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 min-[400px]:p-5 shadow-sm min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
                <Layers size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.shiftDefsTitle}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{t.shiftDefsSubtitle}</p>
              </div>
            </div>
            <form onSubmit={addOrUpdateShiftDef} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.shiftDefName}</label>
                <input
                  type="text"
                  value={shiftDefForm.name}
                  onChange={(e) => setShiftDefForm({ ...shiftDefForm, name: e.target.value })}
                  placeholder={t.shiftGenericName.replace('{n}', String(sortedShiftDefs.length ? Math.max(...sortedShiftDefs.map((d) => d.number)) + 1 : 1))}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.shiftDefTimeFrom}</label>
                  <input
                    type="time"
                    value={shiftDefForm.timeFrom}
                    onChange={(e) => setShiftDefForm({ ...shiftDefForm, timeFrom: e.target.value })}
                    className="w-full px-2 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-w-0"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.shiftDefTimeTo}</label>
                  <input
                    type="time"
                    value={shiftDefForm.timeTo}
                    onChange={(e) => setShiftDefForm({ ...shiftDefForm, timeTo: e.target.value })}
                    className="w-full px-2 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-w-0"
                  />
                </div>
              </div>
              {shiftDefError ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">{shiftDefError}</div>
              ) : null}
              <div className="flex flex-col min-[400px]:flex-row gap-2">
                {editingShiftDefId ? (
                  <>
                    <button type="submit" className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors">
                      {t.shiftDefSave}
                    </button>
                    <button type="button" onClick={cancelEditShiftDef} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700">
                      {t.shiftDefCancel}
                    </button>
                  </>
                ) : (
                  <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Plus size={16} /> {t.shiftDefAdd}
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-w-0">
            <div className="px-3 min-[400px]:px-5 py-3 min-[400px]:py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.tab5} ({sortedShiftDefs.length})</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {sortedShiftDefs.map((d) => {
                const st = shiftStyleFor(d.number);
                const inUse = state.shiftRecords.some((r) => r.shift === d.number);
                return (
                  <div key={d.id} className="flex flex-col min-[480px]:flex-row min-[480px]:items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold shrink-0 ${st.badge}`}>{d.number}</span>
                      <div className="min-w-0">
                        <p className="text-slate-800 dark:text-white font-medium text-sm truncate">{getShiftLabel(shiftDefinitions, d.number, t)}</p>
                        <p className="text-slate-500 text-xs">{d.timeFrom} – {d.timeTo}</p>
                        {inUse ? <p className="text-amber-600 dark:text-amber-400 text-[11px] mt-1">{t.shiftDefInUseRecords}</p> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end min-[480px]:self-auto">
                      <button type="button" onClick={() => startEditShiftDef(d)} className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        {t.shiftDefEdit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteShiftDef(d.id)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {t.shiftDefDelete}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Workers ── */}
      {activeTab === 'workers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-[400px]:gap-6 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 p-4 min-[400px]:p-5 shadow-sm min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-indigo-500 shrink-0" />
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.addWorker}</h3>
            </div>
            <form onSubmit={handleAddWorker} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerName}</label>
                <input type="text" value={newWorker} onChange={e => setNewWorker(e.target.value)} placeholder={t.workerName}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerPreferredShift}</label>
                {sortedShiftDefs.length === 0 ? (
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400">
                    {t.shiftNoDefsHint}
                  </p>
                ) : (
                  <UiDropdown
                    value={String(newWorkerShift)}
                    onChange={(v) => setNewWorkerShift(Number(v))}
                    options={sortedShiftDefs.map((d) => ({
                      value: String(d.number),
                      label: `${d.number} — ${getShiftLabel(shiftDefinitions, d.number, t)}`,
                    }))}
                    placeholder={t.workerPreferredShift}
                  />
                )}
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerPhone} ({t.workerOptional})</label>
                <input
                  type="tel"
                  value={newWorkerPhone}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!raw || raw === '+') {
                      setNewWorkerPhone('+998');
                      return;
                    }
                    if (raw.startsWith('+998')) {
                      setNewWorkerPhone(raw);
                      return;
                    }
                    setNewWorkerPhone(`+998${raw.replace(/^\+/, '')}`);
                  }}
                  placeholder="+998"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                />
              </div>
              {workerFormError ? (
                <div className="p-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">{workerFormError}</div>
              ) : null}
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> {t.addWorker}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl min-[400px]:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-w-0">
            <div className="px-3 min-[400px]:px-5 py-3 min-[400px]:py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">
                {t.workerList} ({sortedEmployees.length}{orphanWorkerNames.length ? ` +${orphanWorkerNames.length}` : ''})
              </h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {sortedEmployees.map((emp) => {
                const workerRecs = state.shiftRecords.filter(r => r.workerName === emp.fullName);
                const totalProd = workerRecs.reduce((s, r) => s + r.producedQty, 0);
                const totalBrak = workerRecs.reduce((s, r) => s + r.defectCount, 0);
                const totalHours = workerRecs.reduce((s, r) => s + r.hoursWorked, 0);
                const brakPctW = totalProd + totalBrak > 0 ? ((totalBrak / (totalProd + totalBrak)) * 100).toFixed(1) : '0';
                const shiftLabel = emp.preferredShiftNumber != null
                  ? getShiftLabel(shiftDefinitions, emp.preferredShiftNumber, t)
                  : t.workerShiftUnset;
                const st = emp.preferredShiftNumber != null ? shiftStyleFor(emp.preferredShiftNumber) : null;
                return (
                  <div key={emp.id} className="flex flex-col min-[520px]:flex-row min-[520px]:items-center gap-3 px-3 min-[400px]:px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold">{emp.fullName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 dark:text-white font-semibold text-sm truncate">{emp.fullName}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {t.workerStatLine.replace('{n}', String(workerRecs.length)).replace('{h}', String(totalHours))}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {st ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold max-w-full ${st.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                            <span className="truncate">{shiftLabel}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">{shiftLabel}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex min-[520px]:flex-col gap-2 min-[520px]:text-right shrink-0 flex-row flex-wrap justify-between min-[520px]:justify-end w-full min-[520px]:w-auto">
                      <div className="text-left min-[520px]:text-right">
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{formatNumber(totalProd)}</p>
                        <p className="text-xs text-slate-400">{t.workerReady}</p>
                      </div>
                      <div className="text-left min-[520px]:text-right">
                        <p className={`font-bold text-sm ${totalBrak > 0 ? 'text-red-500' : 'text-slate-400'}`}>{totalBrak}</p>
                        <p className="text-xs text-slate-400">{brakPctW}% {t.workerBrakLabel}</p>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <button type="button" title={t.workerEditTitle} onClick={() => openWorkerEditor(emp)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                          <Pencil size={13} />
                        </button>
                        {deleteWorkerConfirm === emp.id ? (
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => handleDeleteWorker(emp.id)} className="text-xs text-red-600 hover:text-red-700 font-medium px-1">✓</button>
                            <button type="button" onClick={() => setDeleteWorkerConfirm(null)} className="text-xs text-slate-400 hover:text-slate-600 px-1">✕</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setDeleteWorkerConfirm(emp.id)} className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {orphanWorkerNames.map((name) => {
                const workerRecs = state.shiftRecords.filter(r => r.workerName === name);
                const totalHours = workerRecs.reduce((s, r) => s + r.hoursWorked, 0);
                return (
                  <div key={name} className="px-3 min-[400px]:px-5 py-3 bg-slate-50/80 dark:bg-slate-900/30">
                    <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">{name}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{t.workerOrphansTitle} · {workerRecs.length} {t.records} · {totalHours}{t.hoursShort}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Machines ── */}
      {activeTab === 'machines' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Add form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                <Cpu size={16} className="text-white" />
              </div>
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm">{t.machineAddTitle}</h3>
            </div>
            {machineSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">{machineSuccess}</p>
              </div>
            )}
            <form onSubmit={handleAddMachine} className="space-y-3.5">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.machineName}</label>
                <input type="text" value={machineForm.name} onChange={e => setMachineForm({ ...machineForm, name: e.target.value })}
                  placeholder={t.machinePlaceholderName}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.machineDesc}</label>
                <textarea value={machineForm.description} onChange={e => setMachineForm({ ...machineForm, description: e.target.value })}
                  placeholder={t.machinePlaceholderDesc} rows={2}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">
                    <span className="text-yellow-500">⚡</span> {t.machinePower}
                  </label>
                  <div className="relative">
                    <input type="number" value={machineForm.powerKw} onChange={e => setMachineForm({ ...machineForm, powerKw: e.target.value })}
                      placeholder="0" min="0" step="0.5"
                      className="w-full px-3 py-2.5 pr-10 border border-yellow-200 dark:border-yellow-700/50 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    <span className="absolute right-3 top-2.5 text-xs text-yellow-600 dark:text-yellow-400 font-bold">kW</span>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.machineCapacity}</label>
                  <input type="number" value={machineForm.maxCapacityPerHour} onChange={e => setMachineForm({ ...machineForm, maxCapacityPerHour: e.target.value })}
                    placeholder="5000" min="0"
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1.5">{t.machineType}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['semi', 'final'] as const).map(tp => (
                    <button key={tp} type="button" onClick={() => setMachineForm({ ...machineForm, type: tp })}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${machineForm.type === tp ? (tp === 'semi' ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-teal-600 text-white border-teal-600 shadow-sm') : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                      {tp === 'semi' ? t.machineTypeSemi : t.machineTypeFinal}
                    </button>
                  ))}
                </div>
              </div>
              {machineForm.powerKw && parseFloat(machineForm.powerKw) > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                  <p className="text-yellow-800 dark:text-yellow-400 text-xs">
                    ⚡ 1 soat = <strong>{parseFloat(machineForm.powerKw).toFixed(1)} kWh</strong>
                    &nbsp;·&nbsp; 8 soat = <strong>{(parseFloat(machineForm.powerKw) * 8).toFixed(1)} kWh</strong>
                  </p>
                </div>
              )}
              {machineError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-red-600 dark:text-red-400 text-sm">{machineError}</p>
                </div>
              )}
              <button type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-violet-200 dark:shadow-violet-900/30">
                <Plus size={16} /> {t.machineAddBtn}
              </button>
            </form>
          </div>

          {/* Machine list */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-slate-800 dark:text-white font-semibold text-sm flex items-center gap-2">
                <Cpu size={16} className="text-violet-500" /> {t.machineList}
              </h3>
              <span className="text-xs text-slate-400">{state.machines.length} ta</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {state.machines.map(machine => {
                const usedCount = state.shiftRecords.filter(r => r.machineId === machine.id).length;
                const isDeleting = deleteMachineConfirm === machine.id;
                return (
                  <div key={machine.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${machine.type === 'semi' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-teal-100 dark:bg-teal-900/30'}`}>
                        <Cpu size={18} className={machine.type === 'semi' ? 'text-purple-600 dark:text-purple-400' : 'text-teal-600 dark:text-teal-400'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-slate-800 dark:text-white font-semibold text-sm">{machine.name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${machine.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${machine.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {machine.isActive ? t.machineActive : t.machineInactive}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${machine.type === 'semi' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                            {machine.type === 'semi' ? t.machineTypeSemi : t.machineTypeFinal}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">{machine.description}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                            <Zap size={11} /> {machine.powerKw} {t.machineKwPerHour}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <BarChart3 size={11} /> {formatNumber(machine.maxCapacityPerHour)} {t.machinePerHour}
                          </span>
                          <span className="text-xs text-slate-400">{usedCount} {t.machineUsedInShift}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => dispatch({ type: 'TOGGLE_MACHINE', payload: machine.id })}
                          title={machine.isActive ? t.machineInactive : t.machineActive}
                          className={`p-2 rounded-lg transition-colors ${machine.isActive ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                          {machine.isActive ? <Power size={15} /> : <PowerOff size={15} />}
                        </button>
                        {!isDeleting ? (
                          <button onClick={() => setDeleteMachineConfirm(machine.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteMachine(machine.id)}
                              className="px-2.5 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors font-bold">✓</button>
                            <button onClick={() => setDeleteMachineConfirm(null)}
                              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-lg transition-colors">✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {state.machines.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                  <Cpu size={32} className="opacity-30" />
                  <p className="text-sm">{t.noData}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {workerEditor && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="worker-edit-title"
          onClick={(e) => e.target === e.currentTarget && setWorkerEditor(null)}
        >
          <div className="w-full max-w-md my-auto bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 sm:p-5 max-h-[min(95vh,640px)] overflow-visible min-w-0">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 id="worker-edit-title" className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base pr-2">{t.workerEditTitle}</h3>
              <button type="button" onClick={() => setWorkerEditor(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0" aria-label={t.close}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveWorkerEditor} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerName}</label>
                <input
                  type="text"
                  value={workerEditor.fullName}
                  onChange={(e) => setWorkerEditor({ ...workerEditor, fullName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerPreferredShift}</label>
                <UiDropdown
                  value={workerEditor.preferredShiftNumber === null ? '' : String(workerEditor.preferredShiftNumber)}
                  onChange={(v) =>
                    setWorkerEditor({
                      ...workerEditor,
                      preferredShiftNumber: v === '' ? null : Number(v),
                    })
                  }
                  options={[
                    { value: '', label: t.workerShiftUnset },
                    ...sortedShiftDefs.map((d) => ({
                      value: String(d.number),
                      label: `${d.number} — ${getShiftLabel(shiftDefinitions, d.number, t)}`,
                    })),
                  ]}
                  placeholder={t.workerShiftUnset}
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerPhone}</label>
                <input
                  type="tel"
                  value={workerEditor.phone}
                  onChange={(e) => setWorkerEditor({ ...workerEditor, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerPositionShort}</label>
                  <input
                    type="text"
                    value={workerEditor.position}
                    onChange={(e) => setWorkerEditor({ ...workerEditor, position: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.workerCardShort}</label>
                  <input
                    type="text"
                    value={workerEditor.cardNumber}
                    onChange={(e) => setWorkerEditor({ ...workerEditor, cardNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  />
                </div>
              </div>
              {workerEditorError ? (
                <div className="p-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">{workerEditorError}</div>
              ) : null}
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                <button type="button" onClick={() => setWorkerEditor(null)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                  {t.shiftDefCancel}
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {recordEditId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shift-edit-title"
          onClick={(e) => e.target === e.currentTarget && closeRecordEditor()}
        >
          <div className="w-full max-w-lg my-auto bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 sm:p-5 max-h-[min(95vh,720px)] overflow-visible min-w-0">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 id="shift-edit-title" className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base pr-2">{t.editShiftRecord}</h3>
              <button
                type="button"
                onClick={closeRecordEditor}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 shrink-0"
                aria-label={t.close}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveRecordEdit} className="space-y-3">
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelDate}</label>
                  <SingleDatePicker
                    value={recordEditForm.date}
                    onChange={(iso) => setRecordEditForm({ ...recordEditForm, date: iso || TODAY })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelShift}</label>
                  <UiDropdown
                    value={String(recordEditForm.shift)}
                    onChange={(v) => setRecordEditForm({ ...recordEditForm, shift: Number(v) })}
                    options={recordEditShiftOptions}
                    placeholder={t.labelShift}
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelWorker}</label>
                <input
                  readOnly
                  value={recordEditForm.workerName}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-100 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelMachine}</label>
                  <UiDropdown
                    value={recordEditForm.machineId}
                    onChange={(machineId) => setRecordEditForm({ ...recordEditForm, machineId })}
                    options={shiftFormMachineOptions.map((m) => ({ value: m.id, label: m.name }))}
                    placeholder={t.labelMachine}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelHours}</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={recordEditForm.hoursWorked}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isValidPartialDecimalHours(v)) {
                        setRecordEditForm({ ...recordEditForm, hoursWorked: v });
                      }
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelProduct}</label>
                {(() => {
                  const merged = Array.from(
                    new Set([
                      ...(recordEditForm.productType ? [recordEditForm.productType] : []),
                      ...shiftLineProductOptions,
                    ]),
                  ).filter(Boolean);
                  if (merged.length === 0) {
                    return (
                      <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2.5 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100/90">
                        {t.productTypesEmptyHint}
                      </p>
                    );
                  }
                  return (
                    <div className="flex flex-wrap gap-2">
                      {merged.map((pt) => (
                        <button
                          key={pt}
                          type="button"
                          onClick={() => setRecordEditForm({ ...recordEditForm, productType: pt })}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                            recordEditForm.productType === pt
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : `${PRODUCT_COLORS[pt] ?? 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`
                          }`}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelReading}</label>
                <input
                  type="text"
                  value={recordEditForm.machineReading}
                  onChange={(e) => setRecordEditForm({ ...recordEditForm, machineReading: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelProduced}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={recordEditForm.producedQty}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isValidPartialNonNegativeInt(v)) {
                        setRecordEditForm({ ...recordEditForm, producedQty: v });
                      }
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-red-500 text-xs font-medium mb-1">{t.labelDefect}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={recordEditForm.defectCount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (isValidPartialNonNegativeInt(v)) {
                        setRecordEditForm({ ...recordEditForm, defectCount: v });
                      }
                    }}
                    className="w-full px-3 py-2.5 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/10 text-slate-800 dark:text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{t.labelNotes}</label>
                <input
                  type="text"
                  value={recordEditForm.notes}
                  onChange={(e) => setRecordEditForm({ ...recordEditForm, notes: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                />
              </div>
              {recordEditError ? (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-600 dark:text-red-400 text-sm">{recordEditError}</div>
              ) : null}
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                <button type="button" onClick={closeRecordEditor} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                  {t.shiftDefCancel}
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold">
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}