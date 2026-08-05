import Link from "next/link";
import { auth } from "@/auth";
import { Confetti } from "@/components/Confetti";
import { InstallApp } from "@/components/InstallApp";
import { RealtimeClock } from "@/components/RealtimeClock";
import { TaskCalendar } from "@/components/TaskCalendar";
import { TaskItem } from "@/components/TaskItem";
import {
  countDownloads,
  getDashboardSummary,
  getMonthTasks,
  getTodayTasks,
  getUpcomingTasks,
  localToday,
} from "@/lib/db";
import {
  formatDueLabel,
  greetingByHour,
  isOverdue,
  parseMonthKey,
  todayLabel,
  PRIORITY_META,
} from "@/lib/format";

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <span className="text-base" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
        {hint}
      </p>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await auth();
  const userId = Number(session!.user!.id);
  const name = session!.user!.name ?? "Teman";

  const params = await searchParams;
  const monthRef = parseMonthKey(params.month);

  const [summary, todayTasks, upcoming, downloadCount, monthTasks] =
    await Promise.all([
      getDashboardSummary(userId),
      getTodayTasks(userId),
      getUpcomingTasks(userId, 3),
      countDownloads(),
      getMonthTasks(userId, monthRef.year, monthRef.month),
    ]);

  const { text, emoji } = greetingByHour();

  const progress =
    summary.todayDue > 0
      ? Math.round((summary.todayCompleted / summary.todayDue) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <Confetti />

      {/* Sapaan */}
      <section>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {todayLabel()} · <RealtimeClock />
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {emoji} {text}, {name}!
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {summary.todayDue === 0
            ? "Tidak ada tugas yang jatuh tempo hari ini. Nikmati hari santaimu atau siapkan rencana baru!"
            : summary.todayCompleted === summary.todayDue
              ? "Semua tugas hari ini sudah beres. Kerja bagus! 🎉"
              : `Kamu punya ${summary.todayDue} tugas hari ini dan ${summary.todayCompleted} sudah selesai. Semangat!`}
        </p>
      </section>

      {/* Ringkasan */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tugas hari ini"
          value={summary.todayDue}
          hint="jatuh tempo hari ini"
          icon="📅"
        />
        <StatCard
          label="Selesai hari ini"
          value={summary.todayCompleted}
          hint="tugas telah dirampungkan"
          icon="✅"
        />
        <StatCard
          label="Masih aktif"
          value={summary.activeTotal}
          hint="belum selesai total"
          icon="⏳"
        />
      </section>

      {/* Progress */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Progress hari ini
          </h2>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {progress}%
          </span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {summary.todayCompleted} dari {summary.todayDue} tugas hari ini telah
          diselesaikan · {summary.completedTotal} selesai secara keseluruhan
        </p>
      </section>

      {/* Aksi utama — desktop */}
      <section className="hidden md:block">
        <Link
          href="/tasks"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-4 text-base font-semibold text-white shadow-md shadow-indigo-500/30 transition-colors hover:from-indigo-600 hover:to-violet-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Tambah Tugas Baru
        </Link>
      </section>

      {/* Tugas hari ini */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Tugas hari ini
          </h2>
          <Link
            href="/tasks"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Lihat semua →
          </Link>
        </div>
        {todayTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-3xl" aria-hidden="true">
              🎯
            </p>
            <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">
              Belum ada tugas hari ini
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Klik <span className="font-semibold text-indigo-600 dark:text-indigo-400">Tambah Tugas</span>{" "}
              untuk memulai.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>

      {/* Kalender tugas */}
      <TaskCalendar
        tasks={monthTasks}
        year={monthRef.year}
        month={monthRef.month}
        today={localToday()}
        baseHref="/"
      />

      {/* Pasang aplikasi */}
      <InstallApp downloadCount={downloadCount} />

      {/* Deadline terdekat */}
      {upcoming.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
            ⏰ Deadline terdekat
          </h2>
          <ul className="space-y-3">
            {upcoming.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    <span
                      className={`mr-1.5 inline-block h-2 w-2 rounded-full align-middle ${PRIORITY_META[task.priority].dot}`}
                    />
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Prioritas {task.priority}
                  </p>
                </div>
                <span
                  className={`flex-none rounded-full px-2.5 py-1 text-xs font-medium ${
                    isOverdue(task.due_date!)
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                      : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                  }`}
                >
                  {formatDueLabel(task.due_date!)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAB — mobile */}
      <Link
        href="/tasks"
        aria-label="Tambah Tugas Baru"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/40 transition-transform active:scale-95 md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </Link>
    </div>
  );
}
