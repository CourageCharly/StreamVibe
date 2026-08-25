import { NextRequest, NextResponse } from "next/server";
import { resendFrom, sendMail } from "@/lib/mail";

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
  const { text, html } = buildBodies(fullName, email, phoneLine, message);

  try {
    const sent = await sendMail({
      to: SUPPORT_INBOX,
      subject,
      text,
      html,
      replyTo: email,
      from: resendFrom("support"),
    });
    if (sent) {
      return NextResponse.json({ ok: true, via: "resend" });
    }

    const origin =
      request.headers.get("origin") ||
      request.nextUrl.origin ||
      "https://stream-vibe-dusky.vercel.app";
    const form = await fetch(
      `https://formsubmit.co/ajax/${encodeURIComponent(SUPPORT_INBOX)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Origin: origin,
          Referer: `${origin}/support`,
        },
        body: new URLSearchParams({
          name: fullName,
          email,
          phone: phoneLine,
          message,
          _subject: subject,
          _template: "table",
          _captcha: "false",
          _replyto: email,
        }).toString(),
        cache: "no-store",
      },
    );
    if (form.ok) {
      return NextResponse.json({ ok: true, via: "formsubmit" });
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
