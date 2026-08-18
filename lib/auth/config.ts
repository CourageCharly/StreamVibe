const DEFAULT_APP_ID = "00000000-0000-0000-0000-000000000001";

export function fusionAuthUrl(): string {
  return (process.env.FUSIONAUTH_URL ?? "").trim().replace(/\/+$/, "");
}

export function fusionAuthApiKey(): string {
  return (process.env.FUSIONAUTH_API_KEY ?? "").trim();
}

export function fusionAuthApplicationId(): string {
  return (
    process.env.FUSIONAUTH_APPLICATION_ID?.trim() || DEFAULT_APP_ID
  );
}

export function fusionAuthTenantId(): string {
  return (process.env.FUSIONAUTH_TENANT_ID ?? "").trim();
}

export function isFusionAuthConfigured(): boolean {
  return Boolean(fusionAuthUrl() && fusionAuthApiKey());
}

export function authSecret(): string {
  return process.env.AUTH_SECRET?.trim() || "streamvibe-dev-auth-secret";
}

export const SESSION_COOKIE = "sv_session";
export const PENDING_AUTH_COOKIE = "sv_pending_auth";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
export const PENDING_AUTH_MAX_AGE = 60 * 30;
