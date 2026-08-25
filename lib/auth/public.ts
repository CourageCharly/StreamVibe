/** Public application id for resend/query strings only — never a secret. */
export function fusionAuthApplicationIdSafe(): string {
  return (
    process.env.NEXT_PUBLIC_FUSIONAUTH_APPLICATION_ID?.trim() ||
    "00000000-0000-0000-0000-000000000001"
  );
}

/** Google OAuth web client ID (safe to expose in the browser). */
export function googleClientId(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    "171091287022-62q9vet2rppagrvf6gp8dvf0j9d2skkb.apps.googleusercontent.com"
  );
}

export const applicationIdClient = fusionAuthApplicationIdSafe;

/**
 * OTP screens: keep this address’s characters and length.
 * jane.doe@gmail.com (8) → ja******@gmail.com
 * abcdefghij@gmail.com (10) → ab********@gmail.com
 */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  if (local.length <= 2) return `${local}${"*".repeat(Math.max(1, 3 - local.length))}${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(local.length - 2)}${domain}`;
}
