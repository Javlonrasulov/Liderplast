import type { CompanyAssetActivityLog } from './types';

const ACTIVITY_ACTOR_SUFFIX = / · Kim: .+$/;

export function stripActivityActorSuffix(details?: string | null): string {
  if (!details?.trim()) return '';
  return details.replace(ACTIVITY_ACTOR_SUFFIX, '').trim();
}

export function activityLogActorName(log: CompanyAssetActivityLog, fallback: string): string {
  if (log.performedBy?.fullName?.trim()) return log.performedBy.fullName;
  const match = log.details?.match(/ · Kim: (.+)$/);
  return match?.[1]?.trim() || fallback;
}

/** Qo'shimcha kontekst (masalan, mulk yoki xodim nomi) — lotin matnni yashirmaydi */
export function activityLogSubtitle(log: CompanyAssetActivityLog): string | null {
  const msg = stripActivityActorSuffix(log.details);
  if (!msg) return null;

  const named = msg.match(
    /^(?:Mulk qo'shildi|O'chirildi|Hisobdan chiqarildi): (.+)$/i,
  );
  if (named?.[1]) return named[1];

  const assigned = msg.match(/^Xodimga biriktirildi: (.+)$/);
  if (assigned?.[1]) return assigned[1];

  const returned = msg.match(/^Qaytarib olindi · (.+)$/);
  if (returned?.[1]) return returned[1];

  if (/^[A-Za-z'`]/.test(msg)) return null;
  return msg;
}
