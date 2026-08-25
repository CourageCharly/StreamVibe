/** OTP mail is sent by the API with Resend. The client has no API key. */

import type { OtpKind } from "@/lib/auth/otp-copy";

export type { OtpKind };

export async function dispatchOtpEmail(
  _to: string,
  _code: string,
  _kind: OtpKind,
): Promise<boolean> {
  return true;
}
