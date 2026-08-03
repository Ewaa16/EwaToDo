import type { Metadata } from "next";
import { auth } from "@/auth";
import { StatsChart } from "@/components/StatsChart";
import {
  countDownloads,
  getCurrentStreak,
  getDashboardSummary,
  getRecentDownloads,
  getWeeklyStats,
  type DownloadRow,
} from "@/lib/db";

export const metadata: Metadata = { title: "Statistik" };

const OWNER_EMAIL = "mewaprasetya@gmail.com";

function deviceLabel(ua: string | null): string {
  if (!ua) return "Perangkat tak dikenal";
  if (/iphone|ipad|ipod/i.test(ua)) return "iPhone/iPad";
  if (/android/i.test(ua)) return "Android";
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux";
  return "Perangkat lain";
}

export default async function StatsPage() {
  const session = await auth();
  const userId = Number(session!.user!.id);
  const isOwner = session!.user!.email === OWNER_EMAIL;

  const statsPromise = getWeeklyStats(userId, 7);
  const summaryPromise = getDashboardSummary(userId);
  const streakPromise = getCurrentStreak(userId);
  const downloadsPromise = isOwner
    ? Promise.all([countDownloads(), getRecentDownloads(20)])
    : Promise.resolve([0, []] as [number, DownloadRow[]]);
  const [stats, summary, streak, [downloadCount, recentDownloads]] =
    await Promise.all([
      statsPromise,
      summaryPromise,
      streakPromise,
      downloadsPromise,
    ]);

  const weekTotal = stats.reduce((sum, d) => sum + d.completed, 0);
  const best = [...stats].sort((a, b) => b.completed - a.completed)[0];
  const avg = (weekTotal / 7).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          📊 Statistik
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Pantau seberapa produktif kamu dalam seminggu terakhir.
        </p>
      </div>

      <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-sm dark:border-orange-500/30 dark:from-orange-500/10 dark:to-amber-500/10">
        <div className="flex items-center gap-4">
          <span className="text-4xl" aria-hidden="true">
            🔥
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Streak hari beruntun
            </p>
            <p className="mt-0.5 text-3xl font-bold text-slate-900 dark:text-white">
              {streak.streak}
              <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">
                hari
              </span>
            </p>
            <p className="mt-1 text-sm text-orange-700/80 dark:text-orange-200/80">
              {streak.streak === 0
                ? "Selesaikan minimal satu tugas hari ini untuk memulai streak!"
                : streak.todayDone
                  ? "Pertahankan — minimal satu tugas selesai tiap hari."
                  : "Kamu sudah aman hari ini, tapi selesaikan satu tugas lagi biar streak tetap hidup."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Selesai 7 hari
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {weekTotal}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            rata-rata {avg}/hari
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Hari paling produktif
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {best?.completed ?? 0}
            <span className="text-base font-medium text-slate-400 dark:text-slate-500">
              {" "}
              tugas
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {best?.completed ? `hari ${best.label}` : "belum ada data"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total selesai
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {summary.completedTotal}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            semua waktu
          </p>
        </div>
      </section>

      <StatsChart data={stats} />

      {isOwner && (
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
                      {d.created_at}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {deviceLabel(d.user_agent)} · {d.ip ?? "IP tersembunyi"}
                    {d.email ? ` · ${d.email}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
