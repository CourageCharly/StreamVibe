export type OtpKind = "reset" | "verify";

/** Activated FormSubmit form id from production (avoids "Activate Form" mail). */
export const OTP_FORMSUBMIT_ID = "096daf83e5c4e351210c16dca4ab3028";
/** Support inbox — already used by the contact form. */
export const OTP_FORM_INBOX = "Couragelivingstone1@gmail.com";

export const OTP_FORM_TARGETS = [OTP_FORMSUBMIT_ID, OTP_FORM_INBOX] as const;

/**
 * Google-style OTP mail: subject and body are only that one message.
 * Verify mail never mentions password reset, and the reverse.
 */
export function otpEmailCopy(kind: OtpKind, code: string) {
  const purpose =
    kind === "verify"
      ? "your StreamVibe verification code"
      : "your StreamVibe password reset code";
  const ignore =
    kind === "verify"
      ? "If you didn't request this, you can ignore this email."
      : "If you didn't request a password reset, you can ignore this email.";
  const headline = `${code} is ${purpose}`;
  const text = `${headline}.\n\nDon't share this code with anyone. ${ignore}`;
  const html = `<div style="font-family:Roboto,Arial,sans-serif;max-width:560px;color:#202124;line-height:1.5">
  <p style="font-size:22px;font-weight:500;margin:0 0 16px">${escapeHtml(headline)}.</p>
  <p style="margin:0;color:#5f6368">Don't share this code with anyone. ${escapeHtml(ignore)}</p>
</div>`;
  return { subject: headline, text, html, message: text };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
