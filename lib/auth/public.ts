/** Public application id for resend/query strings only — never a secret. */
export function fusionAuthApplicationIdSafe(): string {
  return (
    process.env.NEXT_PUBLIC_FUSIONAUTH_APPLICATION_ID?.trim() ||
    "00000000-0000-0000-0000-000000000001"
  );
}

export const applicationIdClient = fusionAuthApplicationIdSafe;
