import type { T } from '../i18n/translations';

/** Backend / Prisma UTF-8 apostrophe variants → ASCII for stable matching */
function normalizeNote(s: string): string {
  return s.trim().replace(/[\u2019\u2018\u02bc]/g, "'");
}

const PREFIX_DISCONNECTED = 'Bag disconnected: ';
const PREFIX_WRITTEN_OFF = 'Bag written off: ';
const PREFIX_BAG_CREATED = 'Bag created: ';

/**
 * Translates fixed English/Lotin backend `BagAuditLog.note` strings for the UI locale.
 */
export function translateBagLogNote(note: string | null | undefined, t: T): string {
  if (note == null || !String(note).trim()) {
    return '';
  }
  const raw = String(note).trim();
  const n = normalizeNote(raw);

  if (n.startsWith(PREFIX_DISCONNECTED)) {
    const reason = raw.slice(PREFIX_DISCONNECTED.length).trim();
    return t.rmBagLogNoteDisconnectedTpl.replace('{reason}', reason);
  }
  if (n.startsWith(PREFIX_WRITTEN_OFF)) {
    const reason = raw.slice(PREFIX_WRITTEN_OFF.length).trim();
    return t.rmBagLogNoteWrittenOffTpl.replace('{reason}', reason);
  }
  if (n.startsWith(PREFIX_BAG_CREATED)) {
    const name = raw.slice(PREFIX_BAG_CREATED.length).trim();
    return t.rmBagLogNoteBagCreatedTpl.replace('{name}', name);
  }

  const exact: Record<string, () => string> = {
    'Bag connected after automatic switch': () => t.rmBagLogNoteConnectedAfterSwitch,
    'Bag connected to machine': () => t.rmBagLogNoteConnectedToMachine,
    'Bag connected as replacement': () => t.rmBagLogNoteConnectedReplacement,
    'Bag disconnected': () => t.rmBagLogNoteDisconnected,
    'Bag disconnected before writeoff': () => t.rmBagLogNoteDisconnectedBeforeWriteoff,
    'Bag written off': () => t.rmBagLogNoteWrittenOff,
    'Bag written off after disconnect': () => t.rmBagLogNoteWrittenOffAfterDisconnect,
    'Bag returned to warehouse after disconnect': () => t.rmBagLogNoteReturnedToWarehouse,
    'Bag depleted': () => t.rmBagLogNoteDepleted,
    'Quick bag consumption': () => t.rmBagLogNoteQuickConsume,
    'Material consumed from active bag': () => t.rmBagLogNoteMaterialConsumed,
    "Smena: retsept bo'yicha siro sarfi": () => t.rmBagLogNoteShiftRecipeSiro,
    "Smena: retsept bo'yicha siro sarfi (ulangan qop)": () => t.rmBagLogNoteShiftRecipeSiroBag,
    "Smena: retsept bo'yicha xomashyo sarfi": () => t.rmBagLogNoteShiftRecipeSiro,
    "Smena: retsept bo'yicha xomashyo sarfi (ulangan qop)": () => t.rmBagLogNoteShiftRecipeSiroBag,
    "Smena: ishlab chiqarish": () => t.rmBagLogNoteShiftProduction,
    "Smena: tayyor mahsulot uchun yarim tayyor sarfi": () => t.rmBagLogNoteShiftSemiForFinal,
    "Smena: kraska/bo'yoq sarfi": () => t.rmBagLogNoteShiftPaint,
    "Smena: kraska/bo'yoq sarfi (ulangan qop)": () => t.rmBagLogNoteShiftPaintBag,
    'Production consumption': () => t.rmBagLogNoteProductionConsumption,
    'Bag created': () => t.rmBagLogNoteBagCreated,
  };

  const hit = exact[n];
  if (hit) {
    return hit();
  }
  return raw;
}
