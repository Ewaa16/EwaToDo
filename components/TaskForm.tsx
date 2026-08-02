"use client";

import { useActionState, useEffect, useRef } from "react";
import { PRIORITY_META } from "@/lib/format";
import type { Priority } from "@/lib/db";

type TaskFormProps = {
  action: (
    prevState: { error?: string },
    formData: FormData
  ) => Promise<{ error?: string }>;
  initial?: {
    title: string;
    description?: string | null;
    category: string;
    priority: Priority;
    due_date?: string | null;
  };
  submitLabel: string;
  categories?: string[];
  onDone?: () => void;
  compact?: boolean;
};

export function TaskForm({
  action,
  initial,
  submitLabel,
  categories = [],
  onDone,
  compact,
}: TaskFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (!firstRender.current && !state.error && formRef.current) {
      formRef.current.reset();
      onDone?.();
    }
    firstRender.current = false;
  }, [state, onDone]);

  const selectCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="Apa yang ingin kamu kerjakan?"
          defaultValue={initial?.title}
          className={`${inputCls} font-medium ${compact ? "" : "py-2.5"}`}
          autoFocus={!compact}
        />
      </div>

      {!compact && (
        <div>
          <textarea
            name="description"
            rows={2}
            maxLength={2000}
            placeholder="Deskripsi (opsional)"
            defaultValue={initial?.description ?? ""}
            className={`${inputCls} resize-none`}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <input
            name="category"
            type="text"
            list="category-options"
            maxLength={50}
            placeholder="Kategori"
            defaultValue={initial?.category ?? "Umum"}
            className={inputCls}
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <select
            name="priority"
            defaultValue={initial?.priority ?? "sedang"}
            className={selectCls}
          >
            {(
              Object.keys(PRIORITY_META) as Priority[]
            ).map((p) => (
              <option key={p} value={p}>
                Prioritas {PRIORITY_META[p].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            name="due_date"
            type="date"
            defaultValue={initial?.due_date ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm font-medium text-rose-600">{state.error}</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
