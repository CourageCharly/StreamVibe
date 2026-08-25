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

/** OTP screens: couragelivingstone1@gmail.com → co***@gmail.com */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***${domain}`;
}
