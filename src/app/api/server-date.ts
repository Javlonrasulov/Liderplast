import { API_BASE_URL } from './config';
import { localTodayYmd, setServerTodayYmd } from '../utils/format';

export interface HealthResponse {
  service: string;
  status: string;
  timestamp: string;
  timeZone?: string;
  today?: string;
}

const YMD_RE = /^\d{4}-\d{2}-\d{2}$/;

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeServerToday(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyServerToday() {
  listeners.forEach((fn) => fn());
}

/** Fetch today's date from backend (public health). Falls back to local calculation. */
export async function refreshServerToday(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}`, { method: 'GET' });
    if (!response.ok) throw new Error(`health ${response.status}`);
    const payload = (await response.json()) as HealthResponse;
    const today = payload.today?.trim();
    if (today && YMD_RE.test(today)) {
      setServerTodayYmd(today);
      notifyServerToday();
      return today;
    }
  } catch {
    // offline or old backend — use local fallback below
  }
  setServerTodayYmd(null);
  notifyServerToday();
  return localTodayYmd();
}

const REFRESH_MS = 5 * 60 * 1000;

/** Start periodic sync (call once from AppProvider). */
export function startServerTodaySync(): () => void {
  const run = () => {
    void refreshServerToday();
  };
  run();
  const intervalId = window.setInterval(run, REFRESH_MS);
  const onVisible = () => {
    if (document.visibilityState === 'visible') run();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    window.clearInterval(intervalId);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
