import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettings } from "@/components/AccountSettings";
import { ProfileForm } from "@/components/ProfileForm";
import {
  getCurrentStreak,
  getDashboardSummary,
  getUserById,
} from "@/lib/db";
import { formatDateTimeLocal } from "@/lib/format";

export const metadata: Metadata = { title: "Profil" };

function StatCard({
  label,
  value,
  hint,
  emoji,
}: {
  label: string;
  value: string;
  hint: string;
  emoji: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {emoji} {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
        {hint}
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect("/login");

  const userId = Number(user.id);
  const [dbUser, summary, streak] = await Promise.all([
    getUserById(userId),
    getDashboardSummary(userId),
    getCurrentStreak(userId),
  ]);

  const isGoogle = dbUser?.provider === "google";
  const rows = [
    { label: "Email", value: user.email ?? "—" },
    {
      label: "Login",
      value: isGoogle ? "Google" : "Email & Password",
    },
    {
      label: "Member sejak",
      value: dbUser?.created_at
        ? formatDateTimeLocal(dbUser.created_at)
        : "—",
    },
    {
      label: "Terakhir masuk",
      value: dbUser?.last_login_at
        ? formatDateTimeLocal(dbUser.last_login_at)
        : "—",
    },
  ];

  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Profil saya
      </h1>

      <ProfileForm
        image={user.image ?? null}
        name={user.name ?? "Teman"}
        email={user.email ?? ""}
      />

      <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-3">
        <StatCard
          emoji="📌"
          label="Tugas aktif"
          value={String(summary.activeTotal)}
          hint="belum selesai"
        />
        <StatCard
          emoji="✅"
          label="Total selesai"
          value={String(summary.completedTotal)}
          hint="semua waktu"
        />
        <StatCard
          emoji="🔥"
          label="Streak"
          value={`${streak.streak} hari`}
          hint={streak.streak === 0 ? "belum ada" : "hari beruntun"}
        />
        <StatCard
          emoji="🎯"
          label="Selesai hari ini"
          value={String(summary.todayCompleted)}
          hint="Asia/Jakarta"
        />
      </div>

      <section className="mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Informasi akun
        </h2>
        <dl className="mt-4 space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
                {row.label}
              </dt>
              <dd className="text-right text-sm font-medium text-slate-900 dark:text-white">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-6 w-full">
        <AccountSettings
          initialName={user.name ?? "Teman"}
          hasPassword={!isGoogle}
        />
      </div>
    </div>
  );
}
