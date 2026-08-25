export type OtpKind = "reset" | "verify";

/**
 * One-purpose OTP mail. Subject matches the action the user started.
 * Verify mail never mentions password reset, and the reverse.
 */
export function otpEmailCopy(kind: OtpKind, code: string) {
  const otp = escapeHtml(code);
  if (kind === "verify") {
    const subject = "Your verification code";
    const text = [
      "Verify your email",
      "",
      "Use the verification code below to continue:",
      "",
      code,
      "",
      "This code expires in 10 minutes.",
      "",
      "If you didn't request this code, you can safely ignore this email.",
    ].join("\n");
    const html = `
        <h2>Verify your email</h2>

        <p>Use the verification code below to continue:</p>

        <h1>${otp}</h1>

        <p>This code expires in 10 minutes.</p>

        <p>If you didn't request this code, you can safely ignore this email.</p>`;
    return { subject, text, html, message: text };
  }

  const subject = "Your password reset code";
  const text = [
    "Reset your password",
    "",
    "Use the reset code below to continue:",
    "",
    code,
    "",
    "This code expires in 10 minutes.",
    "",
    "If you didn't request this code, you can safely ignore this email.",
  ].join("\n");
  const html = `
        <h2>Reset your password</h2>

        <p>Use the reset code below to continue:</p>

        <h1>${otp}</h1>

        <p>This code expires in 10 minutes.</p>

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
