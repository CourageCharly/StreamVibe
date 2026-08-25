/** Browser OTP mail via the activated FormSubmit form (not the user's naked email). */

import {
  OTP_FORM_TARGETS,
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

  for (const target of OTP_FORM_TARGETS) {
    try {
      const res = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(target)}`,
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
      if (/activat/i.test(raw)) continue;
      let data: { success?: string | boolean } = {};
      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        /* ignore */
      }
      if (data.success === true || data.success === "true" || res.ok) {
        return true;
      }
    } catch {
      /* try next target */
    }
  }

  return submitHiddenForm(fields, OTP_FORM_TARGETS[0]);
}

function submitHiddenForm(
  fields: Record<string, string>,
  target: string,
): Promise<boolean> {
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
    form.action = `https://formsubmit.co/${target}`;
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
