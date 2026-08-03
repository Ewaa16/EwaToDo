import type { Metadata } from "next";
import { auth } from "@/auth";
import { StatsChart } from "@/components/StatsChart";
import {
  getCurrentStreak,
  getDashboardSummary,
  getWeeklyStats,
} from "@/lib/db";

export const metadata: Metadata = { title: "Statistik" };

export default async function StatsPage() {
  const session = await auth();
  const userId = Number(session!.user!.id);

  const statsPromise = getWeeklyStats(userId, 7);
  const summaryPromise = getDashboardSummary(userId);
  const streakPromise = getCurrentStreak(userId);
  const [stats, summary, streak] = await Promise.all([
    statsPromise,
    summaryPromise,
    streakPromise,
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
    </div>
  );
}
