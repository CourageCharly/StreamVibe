import { fusionAuthApplicationId, isFusionAuthConfigured } from "./config";
import {
  extractFieldErrors,
  friendlyAuthMessage,
  MESSAGES,
} from "./errors";
import {
  faCreateRegistration,
  faDeleteRegistration,
  faGetRegistration,
  faLogin,
  faResendVerification,
  faUpdateRegistration,
  faVerifyRegistration,
  faVerifyRegistrationById,
  mapFaUser,
} from "./fusionauth";
import {
  localCreateRegistration,
  localDeleteRegistration,
  localGetRegistration,
  localGetUser,
  localLogin,
  localResendVerification,
  localUpdateRegistration,
  localVerify,
} from "./local-store";
import type { AuthUser, RegistrationInput, RegistrationResult } from "./types";

export class AuthServiceError extends Error {
  status: number;
  fieldErrors?: RegistrationResult extends never ? never : import("./types").FieldErrors;
  requiresVerification?: boolean;
  email?: string;

  constructor(
    message: string,
    status = 400,
    extra?: {
      fieldErrors?: import("./types").FieldErrors;
      requiresVerification?: boolean;
      email?: string;
    },
  ) {
    super(message);
    this.status = status;
    this.fieldErrors = extra?.fieldErrors;
    this.requiresVerification = extra?.requiresVerification;
    this.email = extra?.email;
  }
}

export async function registerUser(
  userId: string,
  input: RegistrationInput,
): Promise<RegistrationResult> {
  if (isFusionAuthConfigured()) {
    const res = await faCreateRegistration(userId, input);
    if (!res.ok) {
      throw new AuthServiceError(
        friendlyAuthMessage(res.status, MESSAGES.registerFailed, res.raw),
        res.status === 401 ? 400 : res.status,
        { fieldErrors: extractFieldErrors(res.raw) },
      );
    }
    const user = mapFaUser(res.data?.user) ?? {
      id: userId,
      email: input.email.trim().toLowerCase(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      verified: Boolean(res.data?.user?.verified),
    };
    const verification = res.data?.verificationIds?.[0];
    const requiresVerification = !user.verified;
    return {
      user,
      requiresVerification,
      verificationId: verification?.id,
    };
  }

  try {
    return localCreateRegistration(userId, input, {
      skipVerification: false,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      throw new AuthServiceError(
        "An account with this email already exists.",
        409,
        { fieldErrors: { email: "An account with this email already exists." } },
      );
    }
    throw new AuthServiceError(MESSAGES.registerFailed, 500);
  }
}

export async function getRegistration(userId: string, applicationId: string) {
  if (isFusionAuthConfigured()) {
    const res = await faGetRegistration(userId, applicationId);
    if (!res.ok) {
      throw new AuthServiceError(
        friendlyAuthMessage(res.status, "Unable to load this account.", res.raw),
        res.status,
      );
    }
    return res.data;
  }
  const data = localGetRegistration(userId, applicationId);
  if (!data) throw new AuthServiceError("Account not found.", 404);
  return data;
}

export async function updateRegistration(
  userId: string,
  applicationId: string,
  body: {
    user?: { firstName?: string; lastName?: string; imageUrl?: string };
  },
) {
  if (isFusionAuthConfigured()) {
    const res = await faUpdateRegistration(userId, applicationId, body);
    if (!res.ok) {
      throw new AuthServiceError(
        friendlyAuthMessage(
          res.status,
          "Unable to update your profile. Please try again.",
          res.raw,
        ),
        res.status,
      );
    }
    return res.data;
  }
  const data = localUpdateRegistration(userId, applicationId, {
    firstName: body.user?.firstName,
    lastName: body.user?.lastName,
    imageUrl: body.user?.imageUrl,
  });
  if (!data) throw new AuthServiceError("Account not found.", 404);
  return data;
}

export async function deleteRegistration(
  userId: string,
  applicationId: string,
) {
  if (isFusionAuthConfigured()) {
    const res = await faDeleteRegistration(userId, applicationId);
    if (!res.ok) {
      throw new AuthServiceError(
        friendlyAuthMessage(
          res.status,
          "Unable to delete this registration.",
          res.raw,
        ),
        res.status,
      );
    }
    return true;
  }
  if (!localDeleteRegistration(userId, applicationId)) {
    throw new AuthServiceError("Account not found.", 404);
  }
  return true;
}

export async function verifyRegistration(body: {
  verificationId?: string;
  oneTimeCode?: string;
  email?: string;
}): Promise<AuthUser> {
  if (isFusionAuthConfigured()) {
    const res = body.verificationId && !body.oneTimeCode
      ? await faVerifyRegistrationById(body.verificationId)
      : await faVerifyRegistration({
          verificationId: body.verificationId,
          oneTimeCode: body.oneTimeCode,
        });
    if (!res.ok) {
      throw new AuthServiceError(
        friendlyAuthMessage(res.status, MESSAGES.verifyFailed, res.raw),
        res.status,
      );
    }
    const user = mapFaUser(res.data?.user);
    if (user) return { ...user, verified: true };
    throw new AuthServiceError(MESSAGES.verifyFailed, 400);
  }

  const user = localVerify({
    verificationId: body.verificationId,
    oneTimeCode: body.oneTimeCode,
    email: body.email,
  });
  if (!user) throw new AuthServiceError(MESSAGES.verifyFailed, 400);
  return user;
}

export async function resendVerification(email: string) {
  if (isFusionAuthConfigured()) {
    const res = await faResendVerification(email);
    if (!res.ok) {
      throw new AuthServiceError(
        friendlyAuthMessage(res.status, MESSAGES.resendFailed, res.raw),
        res.status,
      );
    }
    return { email };
  }
  const result = localResendVerification(email);
  if (!result) {
    throw new AuthServiceError(MESSAGES.resendFailed, 404);
  }
  return result;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthUser> {
  if (isFusionAuthConfigured()) {
    const res = await faLogin(email, password);
    if (!res.ok) {
      throw new AuthServiceError(
        friendlyAuthMessage(res.status, MESSAGES.loginFailed, res.raw),
        res.status === 404 ? 401 : res.status,
      );
    }
    const user = mapFaUser(res.data?.user);
    if (!user) {
      throw new AuthServiceError(MESSAGES.loginFailed, 401);
    }
    if (!user.verified) {
      throw new AuthServiceError(
        "Please verify your email before continuing.",
        403,
        { requiresVerification: true, email: user.email },
      );
    }
    return user;
  }

  const result = localLogin(email, password);
  if (!result.ok && result.reason === "unverified") {
    throw new AuthServiceError(
      "Please verify your email before continuing.",
      403,
      { requiresVerification: true, email: result.user.email },
    );
  }
  if (!result.ok) {
    throw new AuthServiceError(MESSAGES.loginFailed, 401);
  }
  return result.user;
}

export function applicationId(): string {
  return fusionAuthApplicationId();
}

export function getLocalUser(userId: string): AuthUser | null {
  return localGetUser(userId);
}
