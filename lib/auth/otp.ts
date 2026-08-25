import { randomInt } from "crypto";

/** OTP lifetime — 10 minutes. */
export const OTP_TTL_SECONDS = 10 * 60;
export const OTP_TTL_MS = OTP_TTL_SECONDS * 1000;

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function otpExpiresAt(from = Date.now()): number {
  return from + OTP_TTL_MS;
}

export function otpIsExpired(expiresAt?: number | null): boolean {
  if (!expiresAt || !Number.isFinite(expiresAt)) return true;
  return expiresAt <= Date.now();
}
