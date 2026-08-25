import {
  randomBytes,
  randomInt,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "crypto";
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
  resetId?: string;
  resetCode?: string;
  googleId?: string;
};

type PendingReset = {
  email: string;
  resetId: string;
  resetCode: string;
};

type StoreFile = { users: LocalUser[]; pendingResets?: PendingReset[] };

const STORE_PATH = join(process.cwd(), ".data", "users.json");

let memory: LocalUser[] | null = null;
let memoryResets: PendingReset[] | null = null;

function loadFile(): StoreFile {
  try {
    const raw = readFileSync(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreFile;
  } catch {
    return { users: [], pendingResets: [] };
  }
}

function persist() {
  try {
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
    writeFileSync(
      STORE_PATH,
      JSON.stringify(
        { users: memory ?? [], pendingResets: memoryResets ?? [] },
        null,
        2,
      ),
      "utf8",
    );
  } catch {
    /* read-only filesystem (serverless) — keep in-memory */
  }
}

function load(): LocalUser[] {
  if (memory) return memory;
  const file = loadFile();
  memory = Array.isArray(file.users) ? file.users : [];
  memoryResets = Array.isArray(file.pendingResets) ? file.pendingResets : [];
  return memory;
}

function loadResets(): PendingReset[] {
  load();
  return memoryResets ?? [];
}

function save(users: LocalUser[]) {
  memory = users;
  persist();
}

function saveResets(resets: PendingReset[]) {
  load();
  memoryResets = resets;
  persist();
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
  opts?: { skipVerification?: boolean },
) {
  const users = load();
  const email = input.email.trim().toLowerCase();
  const existing = users.find((u) => u.email === email);
  if (existing?.verified) {
    throw new Error("EMAIL_EXISTS");
  }

  const skipVerification = Boolean(opts?.skipVerification);
  const verificationId = skipVerification
    ? undefined
    : randomBytes(24).toString("base64url");
  const verificationCode = skipVerification ? undefined : sixDigit();
  const row: LocalUser = {
    id: existing?.id ?? userId,
    email,
    passwordHash: hashPassword(input.password),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    verified: skipVerification,
    applicationId: fusionAuthApplicationId(),
    verificationId,
    verificationCode,
  };

  const next = existing
    ? users.map((u) => (u.email === email ? row : u))
    : [...users, row];
  save(next);

  return {
    user: toUser(row),
    registration: {
      applicationId: row.applicationId,
      verified: row.verified,
    },
    requiresVerification: !skipVerification,
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

/** Make sure a signed-in email exists in the user store so password reset works. */
export function localEnsureRegisteredUser(input: {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
}): AuthUser {
  const email = input.email.trim().toLowerCase();
  const existing = localFindByEmail(email);
  if (existing) return toUser(existing);
  const row: LocalUser = {
    id: input.id || randomUUID(),
    email,
    passwordHash: hashPassword(randomBytes(32).toString("hex")),
    firstName: input.firstName?.trim() || "Member",
    lastName: input.lastName?.trim() || "",
    verified: true,
    applicationId: fusionAuthApplicationId(),
  };
  save([...load(), row]);
  return toUser(row);
}

export function localUpsertGoogleUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  googleId: string;
}): AuthUser {
  const users = load();
  const email = input.email.trim().toLowerCase();
  const index = users.findIndex(
    (u) => u.email === email || (input.googleId && u.googleId === input.googleId),
  );

  if (index >= 0) {
    users[index] = {
      ...users[index],
      email,
      googleId: input.googleId,
      firstName: users[index].firstName || input.firstName,
      lastName: users[index].lastName || input.lastName,
      imageUrl: input.imageUrl ?? users[index].imageUrl,
      verified: true,
      verificationCode: undefined,
      verificationId: undefined,
    };
    save(users);
    return toUser(users[index]);
  }

  const row: LocalUser = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(randomBytes(32).toString("hex")),
    firstName: input.firstName.trim() || "Google",
    lastName: input.lastName.trim(),
    imageUrl: input.imageUrl ?? null,
    verified: true,
    applicationId: fusionAuthApplicationId(),
    googleId: input.googleId,
  };
  save([...users, row]);
  return toUser(row);
}

export function localStartPasswordReset(email: string) {
  const users = load();
  const index = users.findIndex((u) => u.email === email.trim().toLowerCase());
  if (index < 0) {
    return { started: false as const };
  }
  const resetId = randomBytes(24).toString("base64url");
  const resetCode = sixDigit();
  users[index] = { ...users[index], resetId, resetCode };
  save(users);
  saveResets(loadResets().filter((r) => r.email !== users[index].email));
  return {
    started: true as const,
    email: users[index].email,
    resetId,
    developmentCode: resetCode,
  };
}

export function localVerifyResetOtp(email: string, code: string) {
  const row = localFindByEmail(email);
  if (!row?.resetCode || row.resetCode !== code.trim()) return false;
  return true;
}

export function localMarkEmailVerified(email: string): AuthUser | null {
  const users = load();
  const index = users.findIndex(
    (u) => u.email === email.trim().toLowerCase(),
  );
  if (index < 0) {
    return localEnsureRegisteredUser({ email });
  }
  users[index] = {
    ...users[index],
    verified: true,
    verificationCode: undefined,
    verificationId: undefined,
  };
  save(users);
  return toUser(users[index]);
}

export function localSetPassword(email: string, password: string): boolean {
  const users = load();
  const normalized = email.trim().toLowerCase();
  let index = users.findIndex((u) => u.email === normalized);
  if (index < 0) {
    localEnsureRegisteredUser({ email: normalized });
    index = load().findIndex((u) => u.email === normalized);
  }
  const list = load();
  if (index < 0) return false;
  list[index] = {
    ...list[index],
    passwordHash: hashPassword(password),
    verified: true,
    resetCode: undefined,
    resetId: undefined,
  };
  save(list);
  return true;
}

export function localResetPassword(
  email: string,
  code: string,
  password: string,
) {
  const users = load();
  const normalized = email.trim().toLowerCase();
  const trimmed = code.trim();
  const index = users.findIndex((u) => u.email === normalized);
  if (index >= 0) {
    if (!users[index].resetCode || users[index].resetCode !== trimmed) {
      return false;
    }
    users[index] = {
      ...users[index],
      passwordHash: hashPassword(password),
      resetCode: undefined,
      resetId: undefined,
    };
    save(users);
    saveResets(loadResets().filter((r) => r.email !== normalized));
    return true;
  }
  return false;
}
