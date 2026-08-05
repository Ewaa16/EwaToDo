"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateProfileNameAction,
  type ProfileActionState,
} from "@/actions/profile";
import { PasswordInput } from "@/components/PasswordInput";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/30";

function Feedback({ state }: { state: ProfileActionState }) {
  if (state.error) {
    return (
      <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        {state.success}
      </p>
    );
  }
  return null;
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

export function AccountSettings({
  initialName,
  hasPassword,
}: {
  initialName: string;
  hasPassword: boolean;
}) {
  const [nameState, nameAction, namePending] = useActionState<
    ProfileActionState,
    FormData
  >(updateProfileNameAction, {});
  const [pwState, pwAction, pwPending] = useActionState<
    ProfileActionState,
    FormData
  >(changePasswordAction, {});

  return (
    <div className="mt-6 w-full max-w-md space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
        <SectionTitle
          title="Ganti nama"
          description="Nama yang tampil di aplikasi"
        />
        <form action={nameAction} className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nama
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={50}
              defaultValue={initialName}
              autoComplete="name"
              className={inputCls}
            />
          </div>
          <Feedback state={nameState} />
          <button
            type="submit"
            disabled={namePending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {namePending ? "Menyimpan…" : "Simpan nama"}
          </button>
        </form>
      </div>

      {hasPassword && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
          <SectionTitle
            title="Ganti password"
            description="Gunakan password lama dan password baru minimal 8 karakter"
          />
          <form action={pwAction} className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="current-password"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password lama
              </label>
              <PasswordInput
                id="current-password"
                name="current-password"
                required
                autoComplete="current-password"
                placeholder="Password saat ini"
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password baru
              </label>
              <PasswordInput
                id="new-password"
                name="new-password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
              />
            </div>
            <Feedback state={pwState} />
            <button
              type="submit"
              disabled={pwPending}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pwPending ? "Mengganti…" : "Ganti password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
