import {
  fusionAuthApiKey,
  fusionAuthApplicationId,
  fusionAuthTenantId,
  fusionAuthUrl,
  isFusionAuthConfigured,
} from "./config";
import type { AuthUser, RegistrationInput } from "./types";

type FaResponse<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  raw: unknown;
};

async function faFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<FaResponse<T>> {
  const url = `${fusionAuthUrl()}${path}`;
  const headers = new Headers(init.headers);
  headers.set("Authorization", fusionAuthApiKey());
  headers.set("Content-Type", "application/json");
  const tenantId = fusionAuthTenantId();
  if (tenantId) headers.set("X-FusionAuth-TenantId", tenantId);

  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  let raw: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      raw = JSON.parse(text);
    } catch {
      raw = { message: text };
    }
  }
  return {
    ok: res.ok,
    status: res.status,
    data: res.ok ? (raw as T) : null,
    raw,
  };
}

type FaUser = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  verified?: boolean;
};

type FaRegistration = {
  applicationId?: string;
  verified?: boolean;
};

function toUser(user: FaUser | null | undefined): AuthUser | null {
  if (!user?.id || !user.email) return null;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    imageUrl: user.imageUrl ?? null,
    verified: Boolean(user.verified),
  };
}

export { isFusionAuthConfigured };

export async function faCreateRegistration(
  userId: string,
  input: RegistrationInput,
) {
  return faFetch<{
    user?: FaUser;
    registration?: FaRegistration;
    verificationIds?: Array<{ id?: string; oneTimeCode?: string }>;
    token?: string;
  }>(`/api/user/registration/${userId}`, {
    method: "POST",
    body: JSON.stringify({
      skipVerification: false,
      skipRegistrationVerification: false,
      sendSetPasswordEmail: false,
      registration: {
        applicationId: fusionAuthApplicationId(),
      },
      user: {
        email: input.email.trim().toLowerCase(),
        password: input.password,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
      },
    }),
  });
}

export async function faGetRegistration(
  userId: string,
  applicationId: string,
) {
  return faFetch<{ user?: FaUser; registration?: FaRegistration }>(
    `/api/user/registration/${userId}/${applicationId}`,
    { method: "GET" },
  );
}

export async function faUpdateRegistration(
  userId: string,
  applicationId: string,
  body: unknown,
) {
  return faFetch<{ user?: FaUser; registration?: FaRegistration }>(
    `/api/user/registration/${userId}/${applicationId}`,
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function faDeleteRegistration(
  userId: string,
  applicationId: string,
) {
  return faFetch<unknown>(
    `/api/user/registration/${userId}/${applicationId}`,
    { method: "DELETE" },
  );
}

export async function faVerifyRegistration(body: {
  verificationId?: string;
  oneTimeCode?: string;
}) {
  return faFetch<{ user?: FaUser; registration?: FaRegistration }>(
    "/api/user/verify-registration",
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function faVerifyRegistrationById(verificationId: string) {
  return faFetch<{ user?: FaUser; registration?: FaRegistration }>(
    `/api/user/verify-registration/${verificationId}`,
    { method: "POST" },
  );
}

export async function faResendVerification(email: string) {
  const applicationId = fusionAuthApplicationId();
  const qs = new URLSearchParams({
    applicationId,
    email,
  });
  return faFetch<unknown>(`/api/user/verify-registration?${qs.toString()}`, {
    method: "PUT",
  });
}

export async function faLogin(email: string, password: string) {
  return faFetch<{
    user?: FaUser;
    token?: string;
    refreshToken?: string;
  }>("/api/login", {
    method: "POST",
    body: JSON.stringify({
      loginId: email.trim().toLowerCase(),
      password,
      applicationId: fusionAuthApplicationId(),
    }),
  });
}

export function mapFaUser(user: FaUser | null | undefined): AuthUser | null {
  return toUser(user);
}
