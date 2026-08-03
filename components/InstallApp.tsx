"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallApp() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installFailed, setInstallFailed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStandalone(window.matchMedia("(display-mode: standalone)").matches);
      setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    }, 0);

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setPromptEvent(null);
      setInstallFailed(false);
      setInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "dismissed") setInstallFailed(true);
    } catch {
      setInstallFailed(true);
      setPromptEvent(null);
    }
  }

  if (installed) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            ✅
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">
              EwaToDo terpasang!
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Cari ikon EwaToDo di layar utama HP-mu. Tidak ada tanda unduhan di
              notifikasi — itu normal, aplikasinya sudah terpasang.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (standalone) return null;
  if (!promptEvent && !isIOS) return null;

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          📲
        </span>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">
            Pasang Aplikasi EwaToDo
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {promptEvent
              ? "Pasang EwaToDo ke layar utama dengan sekali tap. Tampil seperti aplikasi penuh — tanpa perlu lewat menu Chrome."
              : "Di iPhone, pasang lewat menu Bagikan (⤴) di Safari lalu pilih “Tambahkan ke Layar Utama”."}
          </p>
        </div>
      </div>

      {installFailed && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
          Belum terpasang — coba tap tombol lagi atau ikuti langkah manual di
          bawah.
        </p>
      )}

      {promptEvent && (
        <button
          type="button"
          onClick={install}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-500/30 transition-colors hover:bg-indigo-700"
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7 10 5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
          Instal Aplikasi
        </button>
      )}

      <button
        type="button"
        onClick={() => setShowManual((v) => !v)}
        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        {showManual ? "Sembunyikan panduan" : "Cara pasang manual"}
      </button>

      {showManual && (
        <ol className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            <span className="font-semibold text-slate-800">
              Android (Chrome/Edge):
            </span>{" "}
            tekan ⋮ di kanan atas → pilih{" "}
            <span className="font-semibold">“Tambahkan ke layar utama”</span> →
            “Tambah”.
          </li>
          <li>
            <span className="font-semibold text-slate-800">
              iPhone (Safari):
            </span>{" "}
            tekan tombol Bagikan ⤴ di bawah → pilih{" "}
            <span className="font-semibold">“Tambahkan ke Layar Utama”</span> →
            “Tambah”.
          </li>
        </ol>
      )}
    </section>
  );
}
