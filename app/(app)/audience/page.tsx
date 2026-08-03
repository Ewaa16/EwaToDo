import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OWNER_EMAIL } from "@/lib/owner";
import {
  countDownloads,
  countUniqueVisitors,
  countVisits,
  getRecentDownloads,
  getRecentVisits,
  localToday,
} from "@/lib/db";

export const metadata: Metadata = { title: "Audiens" };

function deviceLabel(ua: string | null): string {
  if (!ua) return "Perangkat tak dikenal";
  if (/iphone|ipad|ipod/i.test(ua)) return "iPhone/iPad";
  if (/android/i.test(ua)) return "Android";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux";
  return "Perangkat lain";
}

// created_at berbentuk "YYYY-MM-DD HH:mm:ss" (Asia/Jakarta).
function formatWaktu(createdAt: string): string {
  const [datePart, timePart] = createdAt.split(" ");
  if (!datePart || !timePart) return createdAt;
  const [y, m, d] = datePart.split("-").map(Number);
  const [h, mi] = timePart.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, h, mi));
  return dt.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function AudiencePage() {
  const session = await auth();
  if (session?.user?.email !== OWNER_EMAIL) {
    redirect("/");
  }

  const today = localToday();
  const [
    downloadCount,
    recentDownloads,
    visitCount,
    uniqueVisitors,
    todayVisits,
    recentVisits,
  ] = await Promise.all([
    countDownloads(),
    getRecentDownloads(20),
    countVisits(),
    countUniqueVisitors(),
    countVisits(today),
    getRecentVisits(20),
  ]);

  const cards = [
    { label: "Total unduhan APK", value: downloadCount, sub: "sepanjang waktu" },
    { label: "Total kunjungan", value: visitCount, sub: "sepanjang waktu" },
    { label: "Pengunjung unik", value: uniqueVisitors, sub: "berdasarkan user" },
    { label: "Kunjungan hari ini", value: todayVisits, sub: "Asia/Jakarta" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          👥 Audiens
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Ringkasan pengunjung web dan unduhan APK.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {card.sub}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            📥 Unduhan APK
          </h2>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {downloadCount} kali
          </span>
        </div>
        {recentDownloads.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Belum ada unduhan APK tercatat.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {recentDownloads.map((d) => (
              <li key={d.id} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {d.name ?? "Tamu"}
                  </p>
                  <span className="flex-none text-xs text-slate-400 dark:text-slate-500">
                    {formatWaktu(d.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {deviceLabel(d.user_agent)} · {d.ip ?? "IP tersembunyi"}
                  {d.email ? ` · ${d.email}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            👀 Kunjungan Web
          </h2>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {visitCount} kunjungan
          </span>
        </div>
        {recentVisits.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Belum ada kunjungan tercatat.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {recentVisits.map((v) => (
              <li key={v.id} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                    {v.name ?? "Pengguna"}
                    {v.email && (
                      <span className="ml-1 text-xs font-normal text-slate-400 dark:text-slate-500">
                        {v.email}
                      </span>
                    )}
                  </p>
                  <span className="flex-none text-xs text-slate-400 dark:text-slate-500">
                    {formatWaktu(v.created_at)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                    {v.path}
                  </span>
                  <span>{deviceLabel(v.user_agent)}</span>
                  {v.ip && <span>· {v.ip}</span>}
                  {v.referrer && (
                    <span className="max-w-[12rem] truncate">· dari {v.referrer}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
