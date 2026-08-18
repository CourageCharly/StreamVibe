export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  verified: boolean;
};

export type SessionPayload = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  verified: boolean;
  exp: number;
};

export type RegistrationInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type FieldErrors = Partial<
  Record<"email" | "password" | "firstName" | "lastName" | "code", string>
>;

export type AuthApiError = {
  message: string;
  fieldErrors?: FieldErrors;
  requiresVerification?: boolean;
  email?: string;
};

export type RegistrationResult = {
  user: AuthUser;
  requiresVerification: boolean;
  verificationId?: string;
  developmentCode?: string;
};
