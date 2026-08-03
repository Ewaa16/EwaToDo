import type { Metadata } from "next";
import { auth } from "@/auth";
import { StatsChart } from "@/components/StatsChart";
import {
  countDownloads,
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

  const stats = await getWeeklyStats(userId, 7);
  const summary = await getDashboardSummary(userId);

  let downloadCount = 0;
  let recentDownloads: DownloadRow[] = [];
  if (isOwner) {
    [downloadCount, recentDownloads] = await Promise.all([
      countDownloads(),
      getRecentDownloads(20),
    ]);
  }

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

      {isOwner && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">📥 Unduhan APK</h2>
            <span className="text-sm font-bold text-indigo-600">
              {downloadCount} kali
            </span>
          </div>
          {recentDownloads.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Belum ada unduhan APK tercatat.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {recentDownloads.map((d) => (
                <li key={d.id} className="py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium text-slate-800">
                      {d.name ?? "Tamu"}
                    </p>
                    <span className="flex-none text-xs text-slate-400">
                      {d.created_at}
                    </span>
                  </div>
                  <p className="truncate text-xs text-slate-500">
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
