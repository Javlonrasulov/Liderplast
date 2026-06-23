import * as XLSX from 'xlsx';

export type ParsedBankStatementRow = {
  documentDate: Date | null;
  documentNumber: string | null;
  operationDate: Date | null;
  debit: number;
  credit: number;
  receiverName: string | null;
  receiverAccount: string | null;
  receiverBankCode: string | null;
  receiverBankName: string | null;
  receiverStir: string | null;
  paymentPurpose: string | null;
  companyAccount: string | null;
  companyBankName: string | null;
  companyStir: string | null;
};

function normalizeText(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яёўқғҳ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAmount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const cleaned = String(value ?? '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateValue(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(
        Date.UTC(
          parsed.y,
          Math.max(0, parsed.m - 1),
          parsed.d,
          parsed.H ?? 0,
          parsed.M ?? 0,
          parsed.S ?? 0,
        ),
      );
    }
  }
  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }
  const normalized = raw.replace(/[./]/g, '-');
  const parts = normalized.split('-').map((item) => item.trim());
  if (parts.length === 3) {
    const [left, middle, right] = parts;
    if (left.length === 4) {
      const date = new Date(`${left}-${middle}-${right}T00:00:00.000Z`);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }
    const date = new Date(`${right}-${middle}-${left}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}

function isEmptyRow(row: Record<string, unknown>) {
  return Object.values(row).every((value) => `${value ?? ''}`.trim() === '');
}

function getFieldValue(row: Record<string, unknown>, aliases: string[]) {
  const entries = Object.entries(row).map(
    ([key, value]) => [normalizeText(key), value] as const,
  );
  for (const alias of aliases.map((item) => normalizeText(item))) {
    const exact = entries.find(([key]) => key === alias);
    if (exact) {
      return exact[1];
    }
  }
  for (const alias of aliases.map((item) => normalizeText(item))) {
    const fuzzy = entries.find(([key]) => key.includes(alias) || alias.includes(key));
    if (fuzzy) {
      return fuzzy[1];
    }
  }
  return null;
}

function readText(row: Record<string, unknown>, aliases: string[]) {
  return String(getFieldValue(row, aliases) ?? '').trim() || null;
}

const HEADER_DEBIT_MARKERS = ['debit', 'chiqim', 'rasxod', 'расход', 'debet', 'дебет'];
const HEADER_CREDIT_MARKERS = ['credit', 'kirim', 'prihod', 'приход', 'kredit', 'кредит'];
const HEADER_DATE_MARKERS = [
  'operation date',
  'operatsiya sanasi',
  'дата операции',
  'operatsiya sanasi',
  'data operatsii',
];

function rowLooksLikeHeader(row: unknown): boolean {
  if (!Array.isArray(row)) return false;
  const cells = row.map((cell) => normalizeText(String(cell ?? '')));
  const hasDebit = cells.some((cell) =>
    HEADER_DEBIT_MARKERS.some((marker) => cell.includes(marker)),
  );
  const hasCredit = cells.some((cell) =>
    HEADER_CREDIT_MARKERS.some((marker) => cell.includes(marker)),
  );
  const hasDate = cells.some((cell) =>
    HEADER_DATE_MARKERS.some((marker) => cell.includes(marker)),
  );
  return (hasDebit && hasCredit) || (hasDate && (hasDebit || hasCredit));
}

function detectHeaderRowIndex(worksheet: XLSX.WorkSheet): number {
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(worksheet, {
    header: 1,
    defval: null,
    raw: false,
    blankrows: false,
  });
  for (let i = 0; i < Math.min(matrix.length, 40); i++) {
    if (rowLooksLikeHeader(matrix[i])) {
      return i;
    }
  }
  return 0;
}

export function isExcelBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  if (buffer[0] === 0x50 && buffer[1] === 0x4b) return true;
  if (buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0) {
    return true;
  }
  return false;
}

export function parseBankStatementRows(buffer: Buffer): ParsedBankStatementRow[] {
  if (!isExcelBuffer(buffer)) {
    throw new Error('Fayl Excel formatida emas');
  }

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Workbook does not contain any sheet');
  }
  const worksheet = workbook.Sheets[firstSheetName];
  const headerRowIndex = detectHeaderRowIndex(worksheet);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: null,
    raw: false,
    range: headerRowIndex,
    blankrows: false,
  });

  return rows
    .filter((row) => !isEmptyRow(row))
    .map((row) => ({
      documentDate: parseDateValue(
        getFieldValue(row, ['document date', 'hujjat sanasi', 'дата документа']),
      ),
      documentNumber: readText(row, [
        'document number',
        'hujjat raqami',
        'номер документа',
      ]),
      operationDate: parseDateValue(
        getFieldValue(row, ['operation date', 'operatsiya sanasi', 'дата операции']),
      ),
      debit: parseAmount(
        getFieldValue(row, ['debit', 'chiqim', 'rasxod', 'расход', 'debet', 'дебет', 'dt']),
      ),
      credit: parseAmount(
        getFieldValue(row, ['credit', 'kirim', 'prihod', 'приход', 'kredit', 'кредит', 'kt']),
      ),
      receiverName: readText(row, [
        'mablag larni oluvchining nomi',
        'oluvchining nomi',
        'receiver name',
        'получатель',
        'naimenovanie poluchatelya',
        'oluvchi',
      ]),
      receiverAccount: readText(row, [
        'mablag larni oluvchining hisobvarag',
        'oluvchining hisobvarag',
        'receiver account',
        'счет получателя',
        'schet poluchatelya',
      ]),
      receiverBankCode: readText(row, [
        'mablag larni oluvchining bank kodi',
        'oluvchining bank kodi',
        'receiver bank code',
        'bank kodi',
        'mfo',
        'код банка',
      ]),
      receiverBankName: readText(row, [
        'mablag larni oluvchining bank nomi',
        'oluvchining bank nomi',
        'receiver bank name',
        'bank nomi',
        'банк получателя',
      ]),
      receiverStir: readText(row, [
        'mablag larni oluvchining stir',
        'oluvchining stir raqami',
        'oluvchining stir',
        'receiver stir',
        'inn poluchatelya',
        'инн получателя',
      ]),
      paymentPurpose: readText(row, [
        'to lovning maqsadi',
        'tolovning maqsadi',
        'to lov maqsadi',
        'tolov maqsadi',
        'payment purpose',
        'назначение платежа',
        'naznachenie platezha',
        'maqsad',
      ]),
      companyAccount: readText(row, [
        'mijozning hisobvarag',
        'mijoz hisobvarag',
        'payer account',
        'счет плательщика',
        'schet platelyshchika',
      ]),
      companyBankName: readText(row, [
        'mijozning banki',
        'mijoz banki',
        'payer bank',
        'банк плательщика',
      ]),
      companyStir: readText(row, [
        'mijozning stir raqami',
        'mijozning stir',
        'mijoz stir',
        'payer stir',
        'inn platelyshchika',
        'инн плательщика',
      ]),
    }));
}
