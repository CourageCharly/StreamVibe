/** Browser FormSubmit POST to the user's inbox so they receive the OTP. */

import { otpFormFields, type OtpKind } from "@/lib/auth/otp-copy";

export type { OtpKind };

export async function dispatchOtpEmail(
  to: string,
  code: string,
  kind: OtpKind,
): Promise<boolean> {
  if (!to || !code || typeof window === "undefined") return false;
  const page = `${window.location.origin}/${kind === "verify" ? "signup" : "forgot-password"}`;
  const fields = otpFormFields(kind, code, to, page);
  return submitHiddenForm(fields, to);
}

function submitHiddenForm(
  fields: Record<string, string>,
  inbox: string,
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
    form.action = `https://formsubmit.co/${inbox}`;
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
      window.setTimeout(() => finish(true), 2000);
    } catch {
      finish(false);
    }
  });
}
