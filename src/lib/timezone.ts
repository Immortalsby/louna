import { toZonedTime } from "date-fns-tz";

export const TZ = process.env.TIMEZONE || "Europe/Paris";

export function nowParis(): Date {
  return toZonedTime(new Date(), TZ);
}

export function toParis(date: Date): Date {
  return toZonedTime(date, TZ);
}

export function todayStartParis(): Date {
  const now = nowParis();
  now.setHours(0, 0, 0, 0);
  return now;
}

export function todayDateString(): string {
  const now = nowParis();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
