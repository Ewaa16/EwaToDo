"use client";

import { useState, useTransition } from "react";
import { deleteTaskAction, editTaskAction, toggleTaskAction } from "@/actions/tasks";
import { TaskForm } from "@/components/TaskForm";
import type { TaskRow } from "@/lib/db";
import { PRIORITY_META, formatDateLocal, isOverdue } from "@/lib/format";

export function TaskItem({
  task,
  categories = [],
}: {
  task: TaskRow;
  categories?: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const completed = Boolean(task.completed);
  const overdue = task.due_date ? isOverdue(task.due_date) && !completed : false;
  const dueToday = task.due_date && !completed && task.due_date === new Date().toISOString().slice(0, 10);

  function toggle() {
    startTransition(() => toggleTaskAction(task.id, !completed));
  }

  function remove() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    startTransition(() => deleteTaskAction(task.id));
  }

  return (
    <li
      className={`group rounded-xl border bg-white p-4 shadow-sm transition-all ${
        completed ? "border-slate-200 opacity-70" : "border-slate-200"
      }`}
    >
      {editing ? (
        <TaskForm
          action={editTaskAction.bind(null, task.id)}
          initial={{
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            due_date: task.due_date,
          }}
          submitLabel="Simpan Perubahan"
          categories={categories}
          onDone={() => setEditing(false)}
        />
      ) : (
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={toggle}
            disabled={isPending}
            aria-label={completed ? "Tandai belum selesai" : "Tandai selesai"}
            className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 transition-colors disabled:opacity-50 ${
              completed
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white hover:border-indigo-500"
            }`}
          >
            {completed && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-medium leading-snug text-slate-800 ${
                completed ? "line-through decoration-slate-400" : ""
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="mt-1 text-sm text-slate-500">{task.description}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {task.category && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {task.category}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_META[task.priority].badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_META[task.priority].dot}`} />
                {PRIORITY_META[task.priority].label}
              </span>
              {task.due_date && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    overdue
                      ? "bg-rose-100 text-rose-700"
                      : dueToday
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {overdue ? "Terlambat · " : ""}
                  {formatDateLocal(task.due_date)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-none items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
              aria-label="Edit tugas"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={remove}
              className={`rounded-lg p-2 transition-colors ${
                confirming
                  ? "bg-rose-600 text-white"
                  : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              }`}
              aria-label="Hapus tugas"
            >
              {confirming ? (
                <span className="px-1 text-xs font-semibold">Yakin?</span>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
