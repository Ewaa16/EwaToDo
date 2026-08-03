import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordDownload } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent");

  try {
    await recordDownload({ userId, ip, userAgent });
  } catch {
    // Jangan gagalkan unduhan jika pencatatan bermasalah.
  }

  return NextResponse.redirect(new URL("/EwaToDo.apk", request.url), 307);
}
