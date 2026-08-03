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
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(false);

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
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  }

  if (installed || standalone) return null;
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
              ? "Sekali tap untuk memasang EwaToDo di HP-mu. Tampil seperti aplikasi penuh — tanpa perlu menu Chrome lagi."
              : "Di iPhone, buka menu Bagikan (⤴) di Safari lalu pilih “Tambahkan ke Layar Utama” untuk memasang EwaToDo."}
          </p>
        </div>
      </div>
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
    </section>
  );
}
