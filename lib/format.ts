import type { Priority } from "@/lib/db";

export const PRIORITY_META: Record<
  Priority,
  { label: string; badge: string; dot: string }
> = {
  rendah: {
    label: "Rendah",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  sedang: {
    label: "Sedang",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  tinggi: {
    label: "Tinggi",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
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

export function localDateNow(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function greetingByHour(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 11) return { text: "Selamat pagi", emoji: "🌤️" };
  if (h < 15) return { text: "Selamat siang", emoji: "☀️" };
  if (h < 18) return { text: "Selamat sore", emoji: "🌇" };
  return { text: "Selamat malam", emoji: "🌙" };
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
