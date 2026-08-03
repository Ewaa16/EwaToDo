import { createClient } from "@libsql/client";
import { unstable_cache } from "next/cache";
import fs from "fs";
import path from "path";
import { jakartaParts } from "@/lib/jakarta";

export type Priority = "rendah" | "sedang" | "tinggi";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string | null;
  image: string | null;
  provider: string;
  created_at: string;
}

export interface TaskRow {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  priority: Priority;
  due_date: string | null;
  completed: number;
  created_at: string;
  completed_at: string | null;
}

export interface DownloadRow {
  id: number;
  user_id: number | null;
  name: string | null;
  email: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export type TaskFilter = {
  status?: "semua" | "aktif" | "selesai";
  priority?: string;
  sort?: "due_date" | "created_at" | "priority";
};

// Prod (Vercel): pakai Turso remote (libsql://...) + token.
// Dev lokal (tanpa TURSO_*): pakai file SQLite lokal, sama-sama driver libsql.
const USING_LOCAL_DB = !process.env.TURSO_DATABASE_URL;
if (USING_LOCAL_DB) {
  fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
}

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:./data/local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    image         TEXT,
    provider      TEXT NOT NULL DEFAULT 'email',
    created_at    TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    description  TEXT,
    priority     TEXT NOT NULL DEFAULT 'sedang' CHECK (priority IN ('rendah','sedang','tinggi')),
    due_date     TEXT,
    completed    INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    completed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(user_id, completed);

  CREATE TABLE IF NOT EXISTS rate_limits (
    key      TEXT PRIMARY KEY,
    count    INTEGER NOT NULL,
    reset_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip         TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL
  );
`;

// Lazy, sekali per proses (createClient file lokal tidak suka DDL bersamaan dari
// banyak worker). Idempotent; dipanggil `await initDb()` di awal tiap fungsi.
let initPromise: Promise<void> | null = null;

export function initDb(): Promise<void> {
  if (!initPromise) {
    const statements = SCHEMA.split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    initPromise = db.batch(statements, "write").then(() => undefined);
  }
  return initPromise;
}

// ---- users ----

export async function getUserByEmail(
  email: string
): Promise<UserRow | undefined> {
  await initDb();
  const r = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email],
  });
  return r.rows[0] as unknown as UserRow | undefined;
}

export async function getUserById(id: number): Promise<UserRow | undefined> {
  await initDb();
  const r = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  });
  return r.rows[0] as unknown as UserRow | undefined;
}

export async function createUser(data: {
  name: string;
  email: string;
  password_hash: string;
}): Promise<UserRow> {
  await initDb();
  const info = await db.execute({
    sql: "INSERT INTO users (name, email, password_hash, provider) VALUES (?, ?, ?, 'email')",
    args: [data.name, data.email.toLowerCase(), data.password_hash],
  });
  return (await getUserById(Number(info.lastInsertRowid)))!;
}

export async function upsertGoogleUser(data: {
  name: string;
  email: string;
  image?: string | null;
}): Promise<UserRow> {
  await initDb();
  const email = data.email.toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    await db.execute({
      sql: "UPDATE users SET name = ?, image = ? WHERE id = ?",
      args: [data.name, data.image ?? existing.image, existing.id],
    });
    return existing;
  }
  const info = await db.execute({
    sql: "INSERT INTO users (name, email, image, provider) VALUES (?, ?, ?, 'google')",
    args: [data.name, email, data.image ?? null],
  });
  return (await getUserById(Number(info.lastInsertRowid)))!;
}

// ---- tasks ----

export type NewTask = {
  title: string;
  description?: string | null;
  priority?: Priority;
  due_date?: string | null;
};

export async function createTask(
  userId: number,
  data: NewTask
): Promise<TaskRow> {
  await initDb();
  const info = await db.execute({
    sql: `INSERT INTO tasks (user_id, title, description, priority, due_date)
       VALUES (?, ?, ?, ?, ?)`,
    args: [
      userId,
      data.title,
      data.description ?? null,
      data.priority ?? "sedang",
      data.due_date || null,
    ],
  });
  return (await getTaskById(Number(info.lastInsertRowid), userId))!;
}

export async function getTaskById(
  id: number,
  userId: number
): Promise<TaskRow | undefined> {
  await initDb();
  const r = await db.execute({
    sql: "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return r.rows[0] as unknown as TaskRow | undefined;
}

export async function updateTask(
  id: number,
  userId: number,
  data: Partial<NewTask>
): Promise<TaskRow | undefined> {
  await initDb();
  const current = await getTaskById(id, userId);
  if (!current) return undefined;
  await db.execute({
    sql: `UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?
     WHERE id = ? AND user_id = ?`,
    args: [
      data.title ?? current.title,
      data.description !== undefined ? data.description : current.description,
      data.priority ?? current.priority,
      data.due_date !== undefined ? data.due_date : current.due_date,
      id,
      userId,
    ],
  });
  return getTaskById(id, userId);
}

function localNowString(): string {
  const t = jakartaParts();
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${t.y}-${p(t.mo)}-${p(t.d)} ${p(t.h)}:${p(t.mi)}:${p(t.s)}`;
}

export async function setTaskCompleted(
  id: number,
  userId: number,
  completed: boolean
): Promise<TaskRow | undefined> {
  await initDb();
  const current = await getTaskById(id, userId);
  if (!current) return undefined;
  await db.execute({
    sql: `UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ? AND user_id = ?`,
    args: [completed ? 1 : 0, completed ? localNowString() : null, id, userId],
  });
  return getTaskById(id, userId);
}

export async function deleteTask(
  id: number,
  userId: number
): Promise<boolean> {
  await initDb();
  const r = await db.execute({
    sql: "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return r.rowsAffected > 0;
}

const TASK_FILTER_SQL = (
  f: TaskFilter
): { sql: string; params: (string | number)[] } => {
  const clauses: string[] = [];
  const params: (string | number)[] = [];
  if (f.status === "aktif") {
    clauses.push("completed = 0");
  } else if (f.status === "selesai") {
    clauses.push("completed = 1");
  }
  if (f.priority) {
    clauses.push("priority = ?");
    params.push(f.priority);
  }
  return { sql: clauses.join(" AND "), params };
};

export async function getTasks(
  userId: number,
  filter: TaskFilter = {}
): Promise<TaskRow[]> {
  await initDb();
  const { sql, params } = TASK_FILTER_SQL(filter);
  const where = sql ? `AND ${sql}` : "";
  const sort =
    filter.sort === "created_at"
      ? "created_at DESC"
      : filter.sort === "priority"
        ? "CASE priority WHEN 'tinggi' THEN 1 WHEN 'sedang' THEN 2 ELSE 3 END, due_date ASC"
        : "completed ASC, due_date ASC, created_at DESC";
  const r = await db.execute({
    sql: `SELECT * FROM tasks WHERE user_id = ? ${where} ORDER BY ${sort}`,
    args: [userId, ...params],
  });
  return r.rows as unknown as TaskRow[];
}

export async function getTodayTasks(userId: number): Promise<TaskRow[]> {
  await initDb();
  const today = localToday();
  const r = await db.execute({
    sql: `SELECT * FROM tasks
       WHERE user_id = ?
         AND completed = 0
         AND due_date = ?
       ORDER BY CASE priority WHEN 'tinggi' THEN 1 WHEN 'sedang' THEN 2 ELSE 3 END, created_at ASC`,
    args: [userId, today],
  });
  return r.rows as unknown as TaskRow[];
}

export async function getUpcomingTasks(
  userId: number,
  limit = 3
): Promise<TaskRow[]> {
  await initDb();
  const today = localToday();
  const r = await db.execute({
    sql: `SELECT * FROM tasks
       WHERE user_id = ? AND completed = 0 AND due_date IS NOT NULL AND due_date >= ?
       ORDER BY due_date ASC, priority ASC
       LIMIT ?`,
    args: [userId, today, limit],
  });
  return r.rows as unknown as TaskRow[];
}

export type DashboardSummary = {
  todayDue: number;
  todayCompleted: number;
  activeTotal: number;
  completedTotal: number;
};

export async function getDashboardSummary(
  userId: number
): Promise<DashboardSummary> {
  await initDb();
  const today = localToday();
  const r = await db.execute({
    sql: `SELECT
        (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ?) AS todayDue,
        (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND completed = 1 AND substr(completed_at, 1, 10) = ?) AS todayCompleted,
        (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND completed = 0) AS activeTotal,
        (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND completed = 1) AS completedTotal`,
    args: [userId, today, userId, today, userId, userId],
  });
  const row = r.rows[0] as unknown as {
    todayDue: number;
    todayCompleted: number;
    activeTotal: number;
    completedTotal: number;
  };
  return {
    todayDue: Number(row.todayDue ?? 0),
    todayCompleted: Number(row.todayCompleted ?? 0),
    activeTotal: Number(row.activeTotal ?? 0),
    completedTotal: Number(row.completedTotal ?? 0),
  };
}

export type DailyStat = { date: string; label: string; completed: number };

export async function getWeeklyStats(
  userId: number,
  days = 7
): Promise<DailyStat[]> {
  await initDb();
  const today = jakartaParts();
  const startDate = new Date(Date.UTC(today.y, today.mo - 1, today.d - (days - 1)));
  const startStr = formatLocalDate(startDate);

  const rows = await db.execute({
    sql: `SELECT substr(completed_at, 1, 10) AS date, COUNT(*) AS completed
       FROM tasks
       WHERE user_id = ? AND completed = 1 AND completed_at IS NOT NULL
         AND substr(completed_at, 1, 10) >= ?
       GROUP BY date`,
    args: [userId, startStr],
  });
  const byDate = new Map(
    (rows.rows as unknown as { date: string; completed: number }[]).map(
      (r) => [r.date, Number(r.completed)]
    )
  );

  const result: DailyStat[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.UTC(today.y, today.mo - 1, today.d - (days - 1) + i));
    const iso = formatLocalDate(d);
    result.push({
      date: iso,
      label: d.toLocaleDateString("id-ID", {
        weekday: "short",
        timeZone: "Asia/Jakarta",
      }),
      completed: byDate.get(iso) ?? 0,
    });
  }
  return result;
}

// ---- downloads ----

export async function recordDownload(data: {
  userId?: number | null;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await initDb();
  await db.execute({
    sql: "INSERT INTO downloads (user_id, ip, user_agent, created_at) VALUES (?, ?, ?, ?)",
    args: [
      data.userId ?? null,
      data.ip ?? null,
      data.userAgent ?? null,
      localNowString(),
    ],
  });
}

// Count publik (bukan per-user) — aman di-cache global, hindari hit DB tiap render.
export const countDownloads = unstable_cache(
  async (): Promise<number> => {
    await initDb();
    const r = await db.execute({
      sql: "SELECT COUNT(*) AS c FROM downloads",
      args: [],
    });
    return Number((r.rows[0] as unknown as { c: number }).c ?? 0);
  },
  ["downloads-count"],
  { revalidate: 600 }
);

export async function getRecentDownloads(limit = 20): Promise<DownloadRow[]> {
  await initDb();
  const r = await db.execute({
    sql: `SELECT d.id, d.user_id, d.ip, d.user_agent, d.created_at, u.name, u.email
       FROM downloads d
       LEFT JOIN users u ON u.id = d.user_id
       ORDER BY d.id DESC
       LIMIT ?`,
    args: [limit],
  });
  return r.rows as unknown as DownloadRow[];
}

// ---- helpers ----

export function localToday(): string {
  return formatLocalDate(new Date());
}

export function formatLocalDate(d: Date): string {
  const t = jakartaParts(d);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.y}-${p(t.mo)}-${p(t.d)}`;
}
