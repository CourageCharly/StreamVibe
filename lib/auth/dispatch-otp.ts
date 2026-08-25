/** Browser-side OTP mail — same FormSubmit path that works for Support. */

export type OtpKind = "reset" | "verify";

function copy(kind: OtpKind, code: string) {
  if (kind === "verify") {
    return {
      subject: "Your StreamVibe verification code",
      message: `Your StreamVibe verification code is ${code}. Enter it to finish creating your account.`,
    };
  }
  return {
    subject: "Your StreamVibe password reset code",
    message: `Your StreamVibe password reset code is ${code}. Enter it on the reset screen to continue.`,
  };
}

export async function dispatchOtpEmail(
  to: string,
  code: string,
  kind: OtpKind,
): Promise<boolean> {
  if (!to || !code || typeof window === "undefined") return false;
  const { subject, message } = copy(kind, code);
  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: "StreamVibe",
          email: to,
          _subject: subject,
          message,
          _template: "box",
          _captcha: "false",
          _honey: "",
        }),
      },
    );
    const raw = await res.text().catch(() => "");
    let data: { success?: string | boolean } = {};
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      /* ignore */
    }
    if (data.success === true || data.success === "true") return true;
    return res.ok;
  } catch {
    return false;
  }
}
