/** Client-side subscription + daily free-watch quota (localStorage). */

import { PLANS } from "@/lib/constants";
import { storageUserId } from "@/lib/user-lists";

export const DAILY_WATCH_LIMIT = 10;
export const SUB_EVENT = "streamvibe:subscription";

export type PlanKey = (typeof PLANS)[number]["key"];
export type BillingCycle = "monthly" | "yearly";

export type SavedSubscription = {
  planKey: PlanKey;
  billing: BillingCycle;
  reference: string;
  paidAt: number;
  expiresAt: number;
};

type DayWatchLog = {
  startedAt: number;
  resetAt: number;
  ids: string[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

const SUB_KEY = "streamvibe:subscription";
const WATCH_DAY_KEY = "streamvibe:watch-day";

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SUB_EVENT));
}

function titleKey(id: number, kind: "movie" | "tv") {
  return `${kind}:${id}`;
}

function scoped(base: string) {
  return `${base}:${storageUserId()}`;
}

export function getPlan(key: string | null | undefined) {
  if (!key) return null;
  return PLANS.find((p) => p.key === key) ?? null;
}

export function planPrice(key: PlanKey, billing: BillingCycle) {
  const plan = getPlan(key);
  if (!plan) return 0;
  return billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
}

export type CheckoutFrom = "pricing" | "subscriptions";

export function checkoutHref(
  planKey: PlanKey,
  billing: BillingCycle,
  from?: CheckoutFrom,
) {
  const path = `/checkout?plan=${planKey}&billing=${billing}`;
  return from ? `${path}&from=${from}` : path;
}

export function checkoutBackHref(from: string | null | undefined) {
  return from === "pricing" ? "/#pricing" : "/subscriptions";
}

export function readSubscription(): SavedSubscription | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(scoped(SUB_KEY));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSubscription;
    if (!parsed?.planKey || !parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasActiveSubscription() {
  const sub = readSubscription();
  return Boolean(sub && sub.expiresAt > Date.now());
}

export function saveSubscription(sub: SavedSubscription) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(scoped(SUB_KEY), JSON.stringify(sub));
    emit();
  } catch {
    /* private mode */
  }
}

function emptyLog(): DayWatchLog {
  return { startedAt: 0, resetAt: 0, ids: [] };
}

function readDayLog(): DayWatchLog {
  const empty = emptyLog();
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(scoped(WATCH_DAY_KEY));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as DayWatchLog & { date?: string };
    const ids = Array.isArray(parsed.ids)
      ? parsed.ids.filter((id) => typeof id === "string")
      : [];
    let startedAt = Number(parsed.startedAt) || 0;
    let resetAt = Number(parsed.resetAt) || 0;
    if (!startedAt && parsed.date) {
      const start = new Date(`${parsed.date}T00:00:00`).getTime();
      if (Number.isFinite(start)) {
        startedAt = start;
        resetAt = start + DAY_MS;
      }
    }
    if (!startedAt || !resetAt) return empty;
    if (Date.now() >= resetAt) return empty;
    return { startedAt, resetAt, ids };
  } catch {
    return empty;
  }
}

function writeDayLog(log: DayWatchLog) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(scoped(WATCH_DAY_KEY), JSON.stringify(log));
  } catch {
    /* private mode */
  }
}

export function todayWatchCount() {
  return readDayLog().ids.length;
}

/** Paid users are unlimited. At 10/10, every watch is blocked until the 24h reset. */
export function canStartWatch(_id: number, _kind: "movie" | "tv") {
  if (hasActiveSubscription()) return true;
  const log = readDayLog();
  if (!log.startedAt) return true;
  return log.ids.length < DAILY_WATCH_LIMIT;
}

export function recordWatchStart(id: number, kind: "movie" | "tv") {
  if (hasActiveSubscription()) return;
  const log = readDayLog();
  const key = titleKey(id, kind);
  if (log.ids.length >= DAILY_WATCH_LIMIT) return;
  if (log.ids.includes(key)) return;
  const now = Date.now();
  const startedAt = log.startedAt || now;
  writeDayLog({
    startedAt,
    resetAt: log.resetAt || startedAt + DAY_MS,
    ids: [...log.ids, key],
  });
}

export function watchLimitResetAt() {
  return readDayLog().resetAt || 0;
}

export function formatResetRemaining(ms: number) {
  if (ms <= 0) return "soon";
  const totalMin = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  const hourLabel = hours === 1 ? "hour" : "hours";
  const minLabel = minutes === 1 ? "minute" : "minutes";
  if (hours > 0 && minutes > 0) return `${hours} ${hourLabel} ${minutes} ${minLabel}`;
  if (hours > 0) return `${hours} ${hourLabel}`;
  return `${minutes} ${minLabel}`;
}

export function subscriptionExpiresInMs(billing: BillingCycle) {
  return Date.now() + (billing === "yearly" ? 365 : 30) * DAY_MS;
}
