import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { addDays } from "date-fns";

export const TZ = process.env.TIMEZONE || "Europe/Paris";

export function nowParis(): Date {
  return toZonedTime(new Date(), TZ);
}

export function toParis(date: Date): Date {
  return toZonedTime(date, TZ);
}

function zonedDateStr(ref: Date): string {
  const z = toZonedTime(ref, TZ);
  const y = z.getFullYear();
  const m = String(z.getMonth() + 1).padStart(2, "0");
  const d = String(z.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parisStartOfDay(ref?: Date): Date {
  return fromZonedTime(`${zonedDateStr(ref ?? new Date())}T00:00:00`, TZ);
}

export function parisEndOfDay(ref?: Date): Date {
  return fromZonedTime(`${zonedDateStr(ref ?? new Date())}T23:59:59.999`, TZ);
}

export function parisNextMidnight(ref: Date): Date {
  const next = addDays(ref, 1);
  return parisStartOfDay(next);
}

export function formatInParis(date: Date, fmt: string): string {
  return formatInTimeZone(date, TZ, fmt);
}

export function todayStartParis(): Date {
  return parisStartOfDay();
}

export function todayDateString(): string {
  return zonedDateStr(new Date());
}
