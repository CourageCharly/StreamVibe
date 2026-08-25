import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  ACCOUNTS_COOKIE,
  ACCOUNTS_COOKIE_MAX_AGE,
  authSecret,
  PENDING_AUTH_COOKIE,
  PENDING_AUTH_MAX_AGE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "./config";
import type { AuthUser, SessionPayload } from "./types";

export type RegisteredAccount = { id: string; email: string };

function sign(value: string): string {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

function encode(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${body}.${sign(body)}`;
}

function decode<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createSessionToken(user: AuthUser): string {
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl ?? null,
    verified: user.verified,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  return encode(payload);
}

export function readSessionToken(
  token: string | undefined | null,
): SessionPayload | null {
  const payload = decode<SessionPayload>(token);
  if (!payload?.userId || !payload.email || !payload.exp) return null;
  if (payload.exp < Date.now()) return null;
  return payload;
}

export function sessionToUser(session: SessionPayload): AuthUser {
  return {
    id: session.userId,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    imageUrl: session.imageUrl ?? null,
    verified: session.verified,
  };
}

export function issueAccountProof(user: AuthUser): string {
  return encode({
    userId: user.id,
    email: user.email.trim().toLowerCase(),
    exp: Date.now() + ACCOUNTS_COOKIE_MAX_AGE * 1000,
  });
}

export function readAccountProof(
  token: string | undefined | null,
): { userId: string; email: string } | null {
  const payload = decode<{ userId: string; email: string; exp: number }>(
    token,
  );
  if (!payload?.userId || !payload.email || payload.exp < Date.now()) {
    return null;
  }
  return {
    userId: payload.userId,
    email: payload.email.trim().toLowerCase(),
  };
}

export function readRegisteredAccounts(
  request?: NextRequest,
): RegisteredAccount[] {
  const raw = request?.cookies.get(ACCOUNTS_COOKIE)?.value;
  const payload = decode<{ accounts: RegisteredAccount[] }>(raw);
  if (!Array.isArray(payload?.accounts)) return [];
  return payload.accounts.filter(
    (row) => row && typeof row.id === "string" && typeof row.email === "string",
  );
}

export function applyRegisteredAccountCookie(
  response: NextResponse,
  user: AuthUser,
  request?: NextRequest,
): NextResponse {
  const email = user.email.trim().toLowerCase();
  const next = readRegisteredAccounts(request).filter((row) => row.email !== email);
  next.push({ id: user.id, email });
  response.cookies.set(
    ACCOUNTS_COOKIE,
    encode({ accounts: next.slice(-80) }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ACCOUNTS_COOKIE_MAX_AGE,
    },
  );
  return response;
}

export function applySessionCookie(
  response: NextResponse,
  user: AuthUser,
  request?: NextRequest,
): NextResponse {
  response.cookies.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  response.cookies.set(PENDING_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  applyRegisteredAccountCookie(response, user, request);
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(PENDING_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export function applyPendingAuthCookie(
  response: NextResponse,
  userId: string,
  email: string,
): NextResponse {
  response.cookies.set(
    PENDING_AUTH_COOKIE,
    encode({ userId, email, exp: Date.now() + PENDING_AUTH_MAX_AGE * 1000 }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: PENDING_AUTH_MAX_AGE,
    },
  );
  return response;
}

export function readPendingAuth(
  token: string | undefined | null,
): { userId: string; email: string } | null {
  const payload = decode<{ userId: string; email: string; exp: number }>(
    token,
  );
  if (!payload?.userId || !payload.email || payload.exp < Date.now()) {
    return null;
  }
  return { userId: payload.userId, email: payload.email };
}
