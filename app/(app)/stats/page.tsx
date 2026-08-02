import type { Metadata } from "next";
import { auth } from "@/auth";
import { StatsChart } from "@/components/StatsChart";
import { getDashboardSummary, getWeeklyStats } from "@/lib/db";

export const metadata: Metadata = { title: "Statistik" };

export default async function StatsPage() {
  const session = await auth();
  const userId = Number(session!.user!.id);

  const stats = await getWeeklyStats(userId, 7);
  const summary = await getDashboardSummary(userId);

  const weekTotal = stats.reduce((sum, d) => sum + d.completed, 0);
  const best = [...stats].sort((a, b) => b.completed - a.completed)[0];
  const avg = (weekTotal / 7).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          📊 Statistik
        </h1>
        <p className="mt-1 text-slate-600">
          Pantau seberapa produktif kamu dalam seminggu terakhir.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Selesai 7 hari</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{weekTotal}</p>
          <p className="mt-1 text-xs text-slate-400">rata-rata {avg}/hari</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Hari paling produktif</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {best?.completed ?? 0}
            <span className="text-base font-medium text-slate-400"> tugas</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {best?.completed ? `hari ${best.label}` : "belum ada data"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total selesai</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {summary.completedTotal}
          </p>
          <p className="mt-1 text-xs text-slate-400">semua waktu</p>
        </div>
      </section>

      <StatsChart data={stats} />
    </div>
  );
}
