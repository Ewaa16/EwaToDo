"use client";

import { useEffect } from "react";
import { Logo } from "@/components/Logo";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16 text-center">
      <Logo />
      <p className="mt-8 text-5xl" aria-hidden="true">
        😅
      </p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
        Terjadi kesalahan
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Ada yang tidak beres saat memproses halaman ini. Jangan khawatir, data
        kamu tetap aman — coba lagi sebentar lagi.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-700"
      >
        Coba Lagi
      </button>
    </div>
  );
}
