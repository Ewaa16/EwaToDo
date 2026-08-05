"use client";

import Link from "next/link";
import { useState } from "react";
import type { TaskRow } from "@/lib/db";
import { monthKey, PRIORITY_META } from "@/lib/format";

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const monthLabel = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dayLabel = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function daysInMonthUTC(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function firstWeekdayMonIndex(year: number, month: number): number {
  return (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
}

function isoFromUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type Cell = { date: string; inMonth: boolean };

export function TaskCalendar({
  tasks,
  year,
  month,
  today,
  baseHref,
}: {
  tasks: TaskRow[];
  year: number;
  month: number;
  today: string;
  baseHref: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const monthPrefix = monthKey(year, month);
  const activeSelected =
    selected && selected.startsWith(monthPrefix) ? selected : null;

  const tasksByDate = new Map<string, TaskRow[]>();
  for (const task of tasks) {
    const list = tasksByDate.get(task.due_date!) ?? [];
    list.push(task);
    tasksByDate.set(task.due_date!, list);
  }

  const total = daysInMonthUTC(year, month);
  const lead = firstWeekdayMonIndex(year, month);
  const cells: Cell[] = [];

  for (let i = 0; i < lead; i++) {
    const d = new Date(Date.UTC(year, month - 1, 1 - (lead - i)));
    cells.push({ date: isoFromUtc(d), inMonth: false });
  }
  for (let d = 1; d <= total; d++) {
    const dd = String(d).padStart(2, "0");
    cells.push({ date: `${monthKey(year, month)}-${dd}`, inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    const d = new Date(`${last.date}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    cells.push({ date: isoFromUtc(d), inMonth: false });
  }

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;

  const markFor = (date: string): "aktif" | "selesai" | null => {
    const list = tasksByDate.get(date);
    if (!list || list.length === 0) return null;
    return list.some((t) => !t.completed) ? "aktif" : "selesai";
  };

  const selectedTasks = activeSelected
    ? (tasksByDate.get(activeSelected) ?? [])
    : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Kalender tugas
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {monthLabel.format(new Date(Date.UTC(year, month - 1, 1)))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${baseHref}?month=${monthKey(prevYear, prevMonth)}`}
            aria-label="Bulan sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <Link
            href={`${baseHref}?month=${monthKey(nextYear, nextMonth)}`}
            aria-label="Bulan berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            {w}
          </div>
        ))}

        {cells.map((cell, i) => {
          const dayNum = Number(cell.date.slice(8, 10));
          const mark = markFor(cell.date);
          const isToday = cell.date === today;
          const isSelected = cell.date === activeSelected;
          const count = tasksByDate.get(cell.date)?.length ?? 0;

          if (!cell.inMonth) {
            return (
              <div
                key={i}
                className="flex h-9 items-center justify-center rounded-lg text-sm text-slate-300 dark:text-slate-700"
              >
                {dayNum}
              </div>
            );
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(isSelected ? null : cell.date)}
              aria-pressed={isSelected}
              aria-label={`${dayLabel.format(new Date(`${cell.date}T00:00:00Z`))} — ${count} tugas${isToday ? ", hari ini" : ""}`}
              className={`flex h-9 flex-col items-center justify-center gap-0.5 rounded-lg text-sm transition-colors ${
                isToday
                  ? "bg-indigo-600 font-semibold text-white hover:bg-indigo-700"
                  : "text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              } ${isSelected ? "ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900" : ""}`}
            >
              <span>{dayNum}</span>
              {mark && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isToday ? "bg-white" : mark === "aktif" ? "bg-indigo-500" : "bg-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Ada tugas aktif
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Semua sudah selesai
        </span>
        {tasks.length === 0 && <span>Belum ada tugas di bulan ini.</span>}
      </div>

      {activeSelected && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
            {dayLabel.format(new Date(`${activeSelected}T00:00:00Z`))}
          </p>
          {selectedTasks.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tidak ada tugas pada tanggal ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={`h-2 w-2 flex-none rounded-full ${PRIORITY_META[task.priority].dot}`}
                    />
                    <span
                      className={`truncate text-sm font-medium ${
                        task.completed
                          ? "text-slate-400 line-through dark:text-slate-500"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span
                    className={`flex-none rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.completed
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : PRIORITY_META[task.priority].badge
                    }`}
                  >
                    {task.completed ? "Selesai" : PRIORITY_META[task.priority].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
