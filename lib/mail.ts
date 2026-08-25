import type { ReactElement } from "react";
import { Resend } from "resend";

const DEFAULT_FROM = "StreamVibe <onboarding@resend.dev>";

function apiKey() {
  return process.env.RESEND_API_KEY?.trim() || "";
}

export function resendFrom(kind: "otp" | "support" = "otp") {
  const custom = process.env.RESEND_FROM?.trim();
  if (custom) return custom;
  return kind === "support"
    ? "StreamVibe Support <onboarding@resend.dev>"
    : DEFAULT_FROM;
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: ReactElement;
  replyTo?: string;
  from?: string;
}): Promise<boolean> {
  const key = apiKey();
  if (!key) {
    console.error("[mail] RESEND_API_KEY is not set");
    return false;
  }

  const resend = new Resend(key);
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];
  const from = opts.from ?? resendFrom();
  const payload = opts.react
    ? {
        from,
        to,
        subject: opts.subject,
        react: opts.react,
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      }
    : {
        from,
        to,
        subject: opts.subject,
        html: opts.html ?? "",
        ...(opts.text ? { text: opts.text } : {}),
        ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
      };
  const { data, error } = await resend.emails.send(payload);

  if (error) {
    console.error("[mail] Resend", error.message ?? error);
    return false;
  }
  if (data?.id) {
    console.info("[mail] Resend sent", data.id);
  }
  return true;
}
