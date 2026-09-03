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
  date: string;
  ids: string[];
};

const SUB_KEY = "streamvibe:subscription";
const WATCH_DAY_KEY = "streamvibe:watch-day";

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SUB_EVENT));
}

function todayStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

function readDayLog(): DayWatchLog {
  const empty: DayWatchLog = { date: todayStamp(), ids: [] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(scoped(WATCH_DAY_KEY));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as DayWatchLog;
    if (!parsed?.date || !Array.isArray(parsed.ids)) return empty;
    if (parsed.date !== todayStamp()) return empty;
    return {
      date: parsed.date,
      ids: parsed.ids.filter((id) => typeof id === "string"),
    };
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

/** Paid users are unlimited. Free users may start a title already counted today, or a new one under the cap. */
export function canStartWatch(id: number, kind: "movie" | "tv") {
  if (hasActiveSubscription()) return true;
  const log = readDayLog();
  const key = titleKey(id, kind);
  if (log.ids.includes(key)) return true;
  return log.ids.length < DAILY_WATCH_LIMIT;
}

export function recordWatchStart(id: number, kind: "movie" | "tv") {
  if (hasActiveSubscription()) return;
  const log = readDayLog();
  const key = titleKey(id, kind);
  if (log.ids.includes(key)) return;
  if (log.ids.length >= DAILY_WATCH_LIMIT) return;
  writeDayLog({ date: todayStamp(), ids: [...log.ids, key] });
}

export function subscriptionExpiresInMs(billing: BillingCycle) {
  const day = 24 * 60 * 60 * 1000;
  return Date.now() + (billing === "yearly" ? 365 : 30) * day;
}
