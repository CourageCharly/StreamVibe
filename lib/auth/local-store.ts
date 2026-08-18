import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fusionAuthApplicationId } from "./config";
import type { AuthUser, RegistrationInput } from "./types";

type LocalUser = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  verified: boolean;
  applicationId: string;
  verificationId?: string;
  verificationCode?: string;
};

type StoreFile = { users: LocalUser[] };

const STORE_PATH = join(process.cwd(), ".data", "users.json");

let memory: LocalUser[] | null = null;

function load(): LocalUser[] {
  if (memory) return memory;
  try {
    const raw = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreFile;
    memory = Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    memory = [];
  }
  return memory;
}

function save(users: LocalUser[]) {
  memory = users;
  try {
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
    writeFileSync(STORE_PATH, JSON.stringify({ users }, null, 2), "utf8");
  } catch {
    /* read-only filesystem (serverless) — keep in-memory */
  }
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  return next.length === prev.length && timingSafeEqual(next, prev);
}

function toUser(row: LocalUser): AuthUser {
  return {
    id: row.id,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    imageUrl: row.imageUrl ?? null,
    verified: row.verified,
  };
}

function sixDigit(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function localCreateRegistration(
  userId: string,
  input: RegistrationInput,
) {
  const users = load();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    const error = new Error("EMAIL_EXISTS");
    throw error;
  }

  const verificationId = randomBytes(24).toString("base64url");
  const verificationCode = sixDigit();
  const row: LocalUser = {
    id: userId,
    email,
    passwordHash: hashPassword(input.password),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    verified: false,
    applicationId: fusionAuthApplicationId(),
    verificationId,
    verificationCode,
  };
  save([...users, row]);
  return {
    user: toUser(row),
    registration: {
      applicationId: row.applicationId,
      verified: false,
    },
    requiresVerification: true,
    verificationId,
    developmentCode: verificationCode,
  };
}

export function localGetRegistration(userId: string, applicationId: string) {
  const row = load().find(
    (u) => u.id === userId && u.applicationId === applicationId,
  );
  if (!row) return null;
  return {
    user: toUser(row),
    registration: {
      applicationId: row.applicationId,
      verified: row.verified,
    },
  };
}

export function localUpdateRegistration(
  userId: string,
  applicationId: string,
  patch: Partial<Pick<LocalUser, "firstName" | "lastName" | "imageUrl">>,
) {
  const users = load();
  const index = users.findIndex(
    (u) => u.id === userId && u.applicationId === applicationId,
  );
  if (index < 0) return null;
  users[index] = { ...users[index], ...patch };
  save(users);
  return localGetRegistration(userId, applicationId);
}

export function localDeleteRegistration(userId: string, applicationId: string) {
  const users = load();
  const next = users.filter(
    (u) => !(u.id === userId && u.applicationId === applicationId),
  );
  if (next.length === users.length) return false;
  save(next);
  return true;
}

export function localVerify(opts: {
  verificationId?: string;
  oneTimeCode?: string;
  email?: string;
}) {
  const users = load();
  const index = users.findIndex((u) => {
    if (opts.verificationId && u.verificationId === opts.verificationId) {
      if (opts.oneTimeCode) return u.verificationCode === opts.oneTimeCode;
      return true;
    }
    if (opts.oneTimeCode && opts.email) {
      return (
        u.email === opts.email.toLowerCase() &&
        u.verificationCode === opts.oneTimeCode
      );
    }
    if (opts.oneTimeCode) return u.verificationCode === opts.oneTimeCode;
    return false;
  });
  if (index < 0) return null;
  users[index] = {
    ...users[index],
    verified: true,
    verificationCode: undefined,
    verificationId: undefined,
  };
  save(users);
  return toUser(users[index]);
}

export function localResendVerification(email: string) {
  const users = load();
  const index = users.findIndex((u) => u.email === email.toLowerCase());
  if (index < 0) return null;
  const verificationId = randomBytes(24).toString("base64url");
  const verificationCode = sixDigit();
  users[index] = {
    ...users[index],
    verificationId,
    verificationCode,
    verified: false,
  };
  save(users);
  return {
    email: users[index].email,
    verificationId,
    developmentCode: verificationCode,
  };
}

export function localLogin(email: string, password: string) {
  const row = load().find((u) => u.email === email.trim().toLowerCase());
  if (!row || !verifyPassword(password, row.passwordHash)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  if (!row.verified) {
    return {
      ok: false as const,
      reason: "unverified" as const,
      user: toUser(row),
    };
  }
  return { ok: true as const, user: toUser(row) };
}

export function localGetUser(userId: string): AuthUser | null {
  const row = load().find((u) => u.id === userId);
  return row ? toUser(row) : null;
}

export function localFindByEmail(email: string): LocalUser | undefined {
  return load().find((u) => u.email === email.trim().toLowerCase());
}
