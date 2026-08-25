import type { FieldErrors } from "./types";

export function friendlyAuthMessage(
  status: number,
  fallback: string,
  raw?: unknown,
): string {
  const fieldHint = extractFieldMessage(raw);
  if (fieldHint) return fieldHint;

  if (status === 400) {
    return fallback;
  }
  if (status === 401 || status === 404) {
    return "Incorrect email or password. Please try again.";
  }
  if (status === 403) {
    return "Please verify your email before continuing.";
  }
  if (status === 409) {
    return "An account with this email already exists.";
  }
  if (status === 429) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (status >= 500) {
    return "Something went wrong on our side. Please try again.";
  }
  return fallback;
}

export function extractFieldErrors(raw: unknown): FieldErrors | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const body = raw as {
    fieldErrors?: Record<string, Array<{ message?: string; code?: string }>>;
    errors?: { fieldErrors?: Record<string, Array<{ message?: string }>> };
  };
  const source = body.fieldErrors ?? body.errors?.fieldErrors;
  if (!source) return undefined;

  const mapped: FieldErrors = {};
  for (const [key, messages] of Object.entries(source)) {
    const text = messages?.[0]?.message;
    if (!text) continue;
    if (key.includes("email")) mapped.email = "Please enter a valid email address.";
    else if (key.includes("password"))
      mapped.password = "Please choose a stronger password.";
    else if (key.toLowerCase().includes("firstname"))
      mapped.firstName = "Please enter your first name.";
    else if (key.toLowerCase().includes("lastname"))
      mapped.lastName = "Please enter your last name.";
  }
  return Object.keys(mapped).length ? mapped : undefined;
}

function extractFieldMessage(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as {
    generalErrors?: Array<{ message?: string }>;
    message?: string;
  };
  const general = body.generalErrors?.[0]?.message;
  if (general && !looksTechnical(general)) return general;
  return null;
}

function looksTechnical(message: string): boolean {
  return /\b(\d{3}|Bad Request|Unauthorized|Exception|stack|SQL)\b/i.test(
    message,
  );
}

export const MESSAGES = {
  registerFailed:
    "Unable to create your account. Please check your information and try again.",
  loginFailed: "Incorrect email or password. Please try again.",
  googleFailed: "Google Sign-In did not complete. Please try again.",
  verifyFailed: "We could not verify your account. Please check the code and try again.",
  resendFailed: "Unable to resend the verification email. Please try again.",
  network: "Unable to connect. Check your connection and try again.",
  sessionExpired: "Your session has expired. Please log in again.",
  reviewFailed: "Unable to save your review. Please try again.",
} as const;
