"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { Logo } from "@/components/Logo";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, {});

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/30";

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-indigo-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
        Buat akun baru
      </h1>
      <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
        Mulai catat tugas harianmu sekarang
      </p>

      <form action={formAction} className="mt-6 space-y-4">
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
            autoComplete="name"
            placeholder="Nama kamu"
            className={inputCls}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="kamu@email.com"
            className={inputCls}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            className={inputCls}
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Mendaftar…" : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
