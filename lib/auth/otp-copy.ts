import { maskEmail } from "@/lib/auth/public";

export type OtpKind = "reset" | "verify";

/** Activated FormSubmit form — OTP is delivered via _autoresponse. */
export const OTP_FORMSUBMIT_ID = "096daf83e5c4e351210c16dca4ab3028";
export const OTP_FORM_INBOX = "Couragelivingstone1@gmail.com";
export const OTP_FORM_TARGETS = [OTP_FORMSUBMIT_ID, OTP_FORM_INBOX] as const;

/** Visible FormSubmit fields so the OTP is in the mail body, not only _autoresponse. */
export function otpFormFields(
  kind: OtpKind,
  code: string,
  to: string,
  page: string,
) {
  const { subject, message } = otpEmailCopy(kind, code, to);
  return {
    email: to,
    name: "StreamVibe",
    verification_code: code,
    message,
    _subject: subject,
    _template: "table",
    _url: page,
  };
}

/**
 * One-purpose OTP mail. Subject matches the action the user started.
 * Verify mail never mentions password reset, and the reverse.
 */
export function otpEmailCopy(kind: OtpKind, code: string, to = "") {
  const otp = escapeHtml(code);
  const masked = to.trim() ? maskEmail(to) : "";
  const sentHtml = masked
    ? `<p>This code was sent to ${escapeHtml(masked)}.</p>`
    : "";
  const sentText = masked ? `This code was sent to ${masked}.\n\n` : "";
  if (kind === "verify") {
    const subject = `Your verification code: ${code}`;
    const text = `Verify your email\n\nUse the verification code below to continue:\n\n${code}\n\nThis code expires in 10 minutes.\n${sentText}If you didn't request this code, you can safely ignore this email.`;
    const html = `
        <h2>Verify your email</h2>

        <p>Use the verification code below to continue:</p>

        <h1>${otp}</h1>

        <p>This code expires in 10 minutes.</p>
        ${sentHtml}
        <p>If you didn't request this code, you can safely ignore this email.</p>`;
    return { subject, text, html, message: text };
  }

  const subject = `Your password reset code: ${code}`;
  const text = `Reset your password\n\nUse the reset code below to continue:\n\n${code}\n\nThis code expires in 10 minutes.\n${sentText}If you didn't request this code, you can safely ignore this email.`;
  const html = `
        <h2>Reset your password</h2>

        <p>Use the reset code below to continue:</p>

        <h1>${otp}</h1>

        <p>This code expires in 10 minutes.</p>
        ${sentHtml}
        <p>If you didn't request this code, you can safely ignore this email.</p>`;
  return { subject, text, html, message: text };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
