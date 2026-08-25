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
