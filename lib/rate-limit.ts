import { db, initDb } from "@/lib/db";

/**
 * Rate limiting berbasis database (libSQL/Turso), bukan in-memory.
 * Di serverless (Vercel) memory tidak persisten antar instance/cold start,
 * jadi tabel rate_limits dipakai sebagai sumber tunggal yang sama.
 * Semua fungsi async. Tabel dibuat otomatis di initDb (lib/db.ts).
 */

export async function isRateLimited(
  key: string,
  limit: number
): Promise<number | null> {
  await initDb();
  const now = Date.now();
  await db.execute({
    sql: "DELETE FROM rate_limits WHERE reset_at <= ?",
    args: [now],
  });
  const r = await db.execute({
    sql: "SELECT count, reset_at FROM rate_limits WHERE key = ?",
    args: [key],
  });
  const row = r.rows[0] as unknown as
    | { count: number; reset_at: number }
    | undefined;
  if (!row || row.reset_at <= now) return null;
  if (Number(row.count) >= limit) {
    return Math.ceil((Number(row.reset_at) - now) / 1000);
  }
  return null;
}

/** Catat satu percobaan (gagal login / sukses register) untuk key. */
export async function recordAttempt(
  key: string,
  windowMs: number
): Promise<void> {
  await initDb();
  const now = Date.now();
  const resetAt = now + windowMs;
  await db.execute({
    sql: `INSERT INTO rate_limits (key, count, reset_at) VALUES (?, 1, ?)
          ON CONFLICT(key) DO UPDATE SET
            count = CASE WHEN rate_limits.reset_at < ? THEN 1 ELSE count + 1 END,
            reset_at = CASE WHEN rate_limits.reset_at < ? THEN ? ELSE rate_limits.reset_at END`,
    args: [key, resetAt, now, now, resetAt],
  });
}

/** Hapus pembatasan (mis. setelah login sukses). */
export async function clearRateLimit(key: string): Promise<void> {
  await initDb();
  await db.execute({
    sql: "DELETE FROM rate_limits WHERE key = ?",
    args: [key],
  });
}
