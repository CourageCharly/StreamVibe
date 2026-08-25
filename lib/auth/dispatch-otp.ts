/** Browser OTP mail via the activated Support FormSubmit inbox. */

import {
  OTP_FORM_INBOX,
  otpEmailCopy,
  type OtpKind,
} from "@/lib/auth/otp-copy";

export type { OtpKind };

function otpFields(to: string, kind: OtpKind, code: string) {
  const { subject, message } = otpEmailCopy(kind, code);
  return {
    email: to,
    _subject: subject,
    _autoresponse: message,
    _template: "basic",
    _captcha: "false",
  };
}

export async function dispatchOtpEmail(
  to: string,
  code: string,
  kind: OtpKind,
): Promise<boolean> {
  if (!to || !code || typeof window === "undefined") return false;
  const fields = otpFields(to, kind, code);

  try {
    const res = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(OTP_FORM_INBOX)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fields),
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
    if (res.ok && !/activat/i.test(raw)) return true;
  } catch {
    /* fall through to form POST */
  }

  return submitHiddenForm(fields);
}

function submitHiddenForm(fields: Record<string, string>): Promise<boolean> {
  return new Promise((resolve) => {
    const iframeName = `otp_mail_${Date.now()}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.title = "otp-mail";
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:absolute;width:0;height:0;border:0;clip:rect(0,0,0,0)";
    document.body.appendChild(iframe);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `https://formsubmit.co/${OTP_FORM_INBOX}`;
    form.target = iframeName;
    form.acceptCharset = "UTF-8";
    form.style.display = "none";

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.setTimeout(() => {
        form.remove();
        iframe.remove();
      }, 400);
      resolve(ok);
    };

    iframe.onload = () => finish(true);
    try {
      form.submit();
      window.setTimeout(() => finish(true), 1800);
    } catch {
      finish(false);
    }
  });
}
