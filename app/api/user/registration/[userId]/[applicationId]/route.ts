import { NextRequest, NextResponse } from "next/server";
import {
  deleteRegistration,
  getRegistration,
  updateRegistration,
} from "@/lib/auth/service";
import { jsonError } from "@/lib/auth/http";
import {
  applySessionCookie,
  readSessionToken,
  sessionToUser,
} from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/config";

type Ctx = { params: Promise<{ userId: string; applicationId: string }> };

function sessionUser(request: NextRequest) {
  return readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest, context: Ctx) {
  const { userId, applicationId } = await context.params;
  const session = sessionUser(request);
  if (!session || session.userId !== userId) {
    return NextResponse.json(
      { message: "Please log in to continue." },
      { status: 401 },
    );
  }
  try {
    const data = await getRegistration(userId, applicationId);
    return NextResponse.json(data);
  } catch (error) {
    return jsonError(error, "Unable to load this account.");
  }
}

export async function PUT(request: NextRequest, context: Ctx) {
  const { userId, applicationId } = await context.params;
  const session = sessionUser(request);
  if (!session || session.userId !== userId) {
    return NextResponse.json(
      { message: "Please log in to continue." },
      { status: 401 },
    );
  }
  try {
    const body = await request.json();
    const data = await updateRegistration(userId, applicationId, body);
    const user = sessionToUser(session);
    const nextUser = {
      ...user,
      firstName: body?.user?.firstName ?? user.firstName,
      lastName: body?.user?.lastName ?? user.lastName,
      imageUrl: body?.user?.imageUrl ?? user.imageUrl,
    };
    const response = NextResponse.json(data);
    return applySessionCookie(response, nextUser);
  } catch (error) {
    return jsonError(error, "Unable to update your profile. Please try again.");
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const { userId, applicationId } = await context.params;
  const session = sessionUser(request);
  if (!session || session.userId !== userId) {
    return NextResponse.json(
      { message: "Please log in to continue." },
      { status: 401 },
    );
  }
  try {
    await deleteRegistration(userId, applicationId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, "Unable to delete this registration.");
  }
}

export function currentUserFromSession(request: NextRequest) {
  const session = sessionUser(request);
  return session ? sessionToUser(session) : null;
}
