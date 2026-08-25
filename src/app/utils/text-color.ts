/** Matn rangi — nav-glass uslubi, faqat standart + qora */

export type TextColorId = 'default' | 'black';

export const DEFAULT_TEXT_COLOR: TextColorId = 'default';

export const TEXT_COLOR_OPTIONS: {
  id: TextColorId;
  light: string | null;
  dark: string | null;
  swatch: string;
}[] = [
  {
    id: 'default',
    light: null,
    dark: null,
    swatch: 'linear-gradient(135deg, #64748b 0%, #0f172a 100%)',
  },
  {
    id: 'black',
    light: '#000000',
    dark: '#ffffff',
    swatch: '#000000',
  },
];

const TEXT_COLOR_STORAGE = 'erp_text_color';
const TEXT_COLOR_BY_LOGIN_STORAGE = 'erp_text_color_by_login';
const BLACK_TEXT_STORAGE = 'erp_black_text';

export function normalizeTextColor(id: string | null | undefined): TextColorId {
  return id === 'black' ? 'black' : DEFAULT_TEXT_COLOR;
}

export function getTextColorOption(id: TextColorId) {
  return TEXT_COLOR_OPTIONS.find((o) => o.id === id) ?? TEXT_COLOR_OPTIONS[0];
}

function readMap(): Record<string, TextColorId> {
  try {
    const raw = localStorage.getItem(TEXT_COLOR_BY_LOGIN_STORAGE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    const out: Record<string, TextColorId> = {};
    for (const [k, v] of Object.entries(parsed)) {
      out[k] = normalizeTextColor(v);
    }
    return out;
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, TextColorId>) {
  try {
    localStorage.setItem(TEXT_COLOR_BY_LOGIN_STORAGE, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/** Global fallback (eski nav-glass kaliti). */
export function readStoredTextColor(): TextColorId {
  try {
    const stored = localStorage.getItem(TEXT_COLOR_STORAGE);
    if (stored) return normalizeTextColor(stored);
    if (localStorage.getItem(BLACK_TEXT_STORAGE) === 'true') return 'black';
  } catch {
    // ignore
  }
  return DEFAULT_TEXT_COLOR;
}

/** Login/user uchun saqlangan rang; yo‘q bo‘lsa global yoki default. */
export function readTextColorForLogin(loginKey: string | null | undefined): TextColorId {
  if (loginKey) {
    const map = readMap();
    if (map[loginKey]) return map[loginKey];
  }
  return readStoredTextColor();
}

export function saveTextColor(id: TextColorId, loginKey?: string | null) {
  const normalized = normalizeTextColor(id);
  try {
    localStorage.setItem(TEXT_COLOR_STORAGE, normalized);
  } catch {
    // ignore
  }
  if (loginKey) {
    const map = readMap();
    map[loginKey] = normalized;
    writeMap(map);
  }
}

/** CSS o‘zgaruvchilari + `text-color-override` klassi (Tailwind slate matnlari uchun). */
export function applyTextColor(id: TextColorId, isDark = false) {
  const colorId = normalizeTextColor(id);
  const option = getTextColorOption(colorId);
  const root = document.documentElement;

  root.dataset.textColor = colorId;
  root.classList.toggle('text-color-override', colorId !== DEFAULT_TEXT_COLOR);

  if (colorId === DEFAULT_TEXT_COLOR || !option.light) {
    root.style.removeProperty('--app-text-color');
    root.style.removeProperty('--foreground');
    root.style.removeProperty('--card-foreground');
    root.style.removeProperty('--popover-foreground');
    root.style.removeProperty('--secondary-foreground');
    root.style.removeProperty('--accent-foreground');
    root.style.removeProperty('--muted-foreground');
    root.style.removeProperty('--sidebar-foreground');
    root.style.removeProperty('--sidebar-accent-foreground');
    return;
  }

  const color = isDark ? option.dark! : option.light!;
  root.style.setProperty('--app-text-color', color);
  root.style.setProperty('--foreground', color);
  root.style.setProperty('--card-foreground', color);
  root.style.setProperty('--popover-foreground', color);
  root.style.setProperty('--secondary-foreground', color);
  root.style.setProperty('--accent-foreground', color);
  root.style.setProperty('--muted-foreground', color);
  root.style.setProperty('--sidebar-foreground', color);
  root.style.setProperty('--sidebar-accent-foreground', color);
}
