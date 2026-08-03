"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const IN_APP_BROWSER_UA =
  /WhatsApp|Instagram|FBAV|FBAN|FBIOS|FB_IAB|Messenger|Telegram|MicroMessenger|TikTok|Twitter|GoogleApp|GSA|Snapchat|Line\//i;

export function InstallApp({ downloadCount = 0 }: { downloadCount?: number }) {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [installFailed, setInstallFailed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStandalone(window.matchMedia("(display-mode: standalone)").matches);
      setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
      setIsAndroid(/android/i.test(navigator.userAgent));
      setIsInAppBrowser(IN_APP_BROWSER_UA.test(navigator.userAgent));
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
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
  if (!promptEvent && !isIOS && !isAndroid) return null;

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
              : isIOS
                ? "iPhone tidak bisa mengunduh file installer seperti Android, tapi EwaToDo tetap bisa terpasang seperti aplikasi sungguhan lewat Safari."
                : "Pasang EwaToDo ke layar utama. Tampil seperti aplikasi penuh — tanpa perlu lewat menu Chrome."}
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

      {!isIOS && (
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          {showManual ? "Sembunyikan panduan" : "Cara pasang manual"}
        </button>
      )}

      {showManual && !isIOS && (
        <ol className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            <span className="font-semibold text-slate-800">
              Android (Chrome/Edge):
            </span>{" "}
            tekan ⋮ di kanan atas → pilih{" "}
            <span className="font-semibold">“Tambahkan ke layar utama”</span> →
            “Tambah”.
          </li>
        </ol>
      )}

      {isIOS && (
        <div className="mt-4 border-t border-indigo-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">
            Cara pasang di iPhone:
          </p>
          {isInAppBrowser && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Kamu membuka halaman ini dari dalam aplikasi chat/media sosial, jadi
              menu “Tambahkan ke Layar Utama” tidak tersedia di sini. Buka dulu
              di Safari (langkah 1).
            </p>
          )}
          <ol className="mt-2 space-y-2 text-sm text-slate-600">
            {isInAppBrowser && (
              <li>
                <span className="font-semibold text-slate-800">
                  Buka di Safari:
                </span>{" "}
                ketuk menu ⋯ di kanan atas lalu pilih{" "}
                <span className="font-semibold">“Buka di Safari”</span> — atau
                tap tombol <span className="font-semibold">Salin Tautan</span>{" "}
                di bawah, lalu tempel di Safari.
              </li>
            )}
            <li>
              <span className="font-semibold text-slate-800">Bagikan:</span> di
              Safari ketuk tombol <span className="font-semibold">Bagikan ⤴</span>{" "}
              di bawah. Kalau tidak terlihat, ketuk{" "}
              <span className="font-semibold">“...” (More)</span> di kanan bawah
              dulu, baru ketuk <span className="font-semibold">Bagikan</span>.
            </li>
            <li>
              <span className="font-semibold text-slate-800">
                Tambahkan ke Layar Utama:
              </span>{" "}
              geser ke bawah lalu ketuk{" "}
              <span className="font-semibold">“Tambahkan ke Layar Utama”</span>{" "}
              — kalau tidak terlihat, ketuk{" "}
              <span className="font-semibold">View More</span> atau{" "}
              <span className="font-semibold">Edit Actions</span> dulu.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Tambah:</span>{" "}
              pastikan toggle{" "}
              <span className="font-semibold">“Open as Web App”</span> aktif,
              lalu ketuk <span className="font-semibold">Tambah</span> di kanan
              atas. Ikon EwaToDo pun muncul di layar utama.
            </li>
          </ol>
          {isInAppBrowser && (
            <button
              type="button"
              onClick={copyLink}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
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
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              {copied ? "Tautan tersalin ✓" : "Salin Tautan"}
            </button>
          )}
        </div>
      )}

      {isAndroid && (
        <div className="mt-4 border-t border-indigo-100 pt-4">
          <p className="text-sm font-semibold text-slate-800">
            Atau unduh sebagai file (Android):
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tombol di bawah mengunduh file installer (APK). Setelah terunduh,
            buka filenya lalu izinkan Chrome menginstal dari “sumber tidak
            dikenal”.
          </p>
          {downloadCount > 0 && (
            <p className="mt-1 text-xs font-medium text-indigo-600">
              📥 Sudah diunduh {downloadCount} kali.
            </p>
          )}
          <a
            href="/api/apk-download"
            download="EwaToDo.apk"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
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
            Download APK Android
          </a>
        </div>
      )}
    </section>
  );
}
