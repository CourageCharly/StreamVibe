import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * Support form delivery → Couragelivingstone1@gmail.com
 * Primary path is client-side FormSubmit; this API is a fallback
 * (FormSubmit form-urlencoded, then SMTP, then Resend).
 */
const SUPPORT_INBOX = "Couragelivingstone1@gmail.com";

type SupportBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  message?: string;
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildBodies(
  fullName: string,
  email: string,
  phoneLine: string,
  message: string,
) {
  const text = [
    "New StreamVibe support message",
    "",
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phoneLine}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family:Manrope,Arial,sans-serif;line-height:1.5;color:#141414">
      <h2 style="margin:0 0 12px">New StreamVibe support message</h2>
      <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phoneLine)}</p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(message)}</p>
    </div>
  `;

  return { text, html };
}

async function sendViaSmtp(opts: {
  fullName: string;
  email: string;
  phoneLine: string;
  message: string;
  subject: string;
}) {
  const user =
    process.env.SMTP_USER?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    SUPPORT_INBOX;
  const pass =
    process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();

  if (!pass) return { ok: false as const };

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "465");
  const secure = process.env.SMTP_SECURE !== "false";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const { text, html } = buildBodies(
    opts.fullName,
    opts.email,
    opts.phoneLine,
    opts.message,
  );

  await transporter.sendMail({
    from: `"StreamVibe Support" <${user}>`,
    to: SUPPORT_INBOX,
    replyTo: opts.email,
    subject: opts.subject,
    text,
    html,
  });

  return { ok: true as const, via: "smtp" as const };
}

async function sendViaResend(opts: {
  fullName: string;
  email: string;
  phoneLine: string;
  message: string;
  subject: string;
}) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false as const };

  const from =
    process.env.RESEND_FROM?.trim() ||
    "StreamVibe Support <onboarding@resend.dev>";
  const { text, html } = buildBodies(
    opts.fullName,
    opts.email,
    opts.phoneLine,
    opts.message,
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [SUPPORT_INBOX],
      reply_to: opts.email,
      subject: opts.subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("[api/support] Resend", res.status, await res.text().catch(() => ""));
    return { ok: false as const };
  }
  return { ok: true as const, via: "resend" as const };
}

/**
 * FormSubmit — form-urlencoded first (works from server when form is activated).
 */
async function sendViaFormSubmit(
  opts: {
    fullName: string;
    email: string;
    phoneLine: string;
    message: string;
    subject: string;
  },
  request: NextRequest,
) {
  const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(SUPPORT_INBOX)}`;
  const origin =
    request.headers.get("origin") ||
    request.nextUrl.origin ||
    "https://localhost";

  const fields: Record<string, string> = {
    name: opts.fullName,
    email: opts.email,
    phone: opts.phoneLine,
    message: opts.message,
    _subject: opts.subject,
    _template: "table",
    _captcha: "false",
    _replyto: opts.email,
    _honey: "",
  };

  const body = new URLSearchParams(fields);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/support`,
    },
    body: body.toString(),
    cache: "no-store",
  });

  const raw = await res.text().catch(() => "");
  console.info("[api/support] FormSubmit", res.status, raw.slice(0, 240));

  let data: { success?: string | boolean; message?: string } = {};
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    /* ignore */
  }

  if (data.success === true || data.success === "true") {
    return { ok: true as const, via: "formsubmit" as const };
  }

  const msg = String(data.message ?? raw ?? "").toLowerCase();
  if (/successfully|form was submitted|thank you/i.test(msg)) {
    return { ok: true as const, via: "formsubmit" as const };
  }

  return { ok: false as const };
}

export async function POST(request: NextRequest) {
  let body: SupportBody;
  try {
    body = (await request.json()) as SupportBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const countryCode = String(body.countryCode ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json(
      { error: "First name, last name, email, and message are required." },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const fullName = `${firstName} ${lastName}`;
  const phoneLine =
    [countryCode, phone].filter(Boolean).join(" ").trim() || "—";
  const subject = `StreamVibe Support — ${fullName}`;
  const payload = { fullName, email, phoneLine, message, subject };

  try {
    try {
      const formSubmit = await sendViaFormSubmit(payload, request);
      if (formSubmit.ok) {
        return NextResponse.json({ ok: true, via: formSubmit.via });
      }
    } catch (e) {
      console.error("[api/support] FormSubmit", e);
    }

    try {
      const smtp = await sendViaSmtp(payload);
      if (smtp.ok) {
        return NextResponse.json({ ok: true, via: smtp.via });
      }
    } catch (e) {
      console.error("[api/support] SMTP", e);
    }

    try {
      const resend = await sendViaResend(payload);
      if (resend.ok) {
        return NextResponse.json({ ok: true, via: resend.via });
      }
    } catch (e) {
      console.error("[api/support] Resend", e);
    }

    return NextResponse.json(
      {
        error:
          "We could not send your message right now. Please try again in a moment.",
      },
      { status: 502 },
    );
  } catch (error) {
    console.error("[api/support]", error);
    return NextResponse.json(
      {
        error:
          "We could not send your message right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
