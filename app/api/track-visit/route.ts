import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordVisit } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth().catch(() => null);
  const userId = session?.user?.id ? Number(session.user.id) : null;
  if (!userId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let path = "/";
  let referrer: string | null = null;
  try {
    const body = (await request.json()) as {
      path?: unknown;
      referrer?: unknown;
    };
    if (
      typeof body.path === "string" &&
      body.path.startsWith("/") &&
      body.path.length <= 200
    ) {
      path = body.path;
    }
    if (typeof body.referrer === "string" && body.referrer.length <= 500) {
      referrer = body.referrer;
    }
  } catch {
    // Body tidak valid → tetap catat dengan path default.
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent");

  try {
    await recordVisit({ userId, path, referrer, ip, userAgent });
  } catch {
    // Jangan gagalkan navigasi jika pencatatan kunjungan bermasalah.
  }

  return NextResponse.json({ ok: true });
}
