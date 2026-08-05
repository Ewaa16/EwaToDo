import type { Priority } from "@/lib/db";
import { jakartaParts, JAKARTA_TZ } from "@/lib/jakarta";

export const PRIORITY_META: Record<
  Priority,
  { label: string; badge: string; dot: string; accent: string }
> = {
  rendah: {
    label: "Rendah",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
    accent: "border-l-emerald-500",
  },
  sedang: {
    label: "Sedang",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
    accent: "border-l-amber-500",
  },
  tinggi: {
    label: "Tinggi",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    dot: "bg-rose-500",
    accent: "border-l-rose-500",
  },
};

export function formatDateLocal(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isOverdue(dueDate: string): boolean {
  return dueDate < localDateNow();
}

function addDaysJakarta(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function formatDueLabel(dueDate: string): string {
  const today = localDateNow();
  if (dueDate < today) return "Terlambat";
  if (dueDate === today) return "Hari ini";
  if (dueDate === addDaysJakarta(today, 1)) return "Besok";
  if (dueDate === addDaysJakarta(today, 2)) return "Lusa";
  return formatDateLocal(dueDate);
}

export function localDateNow(): string {
  const t = jakartaParts();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.y}-${p(t.mo)}-${p(t.d)}`;
}

export function greetingByHour(): { text: string; emoji: string } {
  const h = jakartaParts().h;
  if (h < 11) return { text: "Selamat pagi", emoji: "🌤️" };
  if (h < 15) return { text: "Selamat siang", emoji: "☀️" };
  if (h < 18) return { text: "Selamat sore", emoji: "🌇" };
  return { text: "Selamat malam", emoji: "🌙" };
}

export function todayLabel(): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: JAKARTA_TZ,
  }).format(new Date());
}

export type MonthRef = { year: number; month: number };

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseMonthKey(s?: string): MonthRef {
  const t = jakartaParts();
  if (!s) return { year: t.y, month: t.mo };
  const m = /^(\d{4})-(\d{2})$/.exec(s);
  if (!m) return { year: t.y, month: t.mo };
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12 || year < 2000 || year > 2100) {
    return { year: t.y, month: t.mo };
  }
  return { year, month };
}
