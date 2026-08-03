import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import { addTaskAction } from "@/actions/tasks";
import { Filters } from "@/components/Filters";
import { TaskForm } from "@/components/TaskForm";
import { TaskItem } from "@/components/TaskItem";
import { getTasks } from "@/lib/db";

export const metadata: Metadata = { title: "Tugas" };

const VALID_STATUS = ["", "aktif", "selesai"];

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  const userId = Number(session!.user!.id);
  const params = await searchParams;

  const status = VALID_STATUS.includes(params.status ?? "")
    ? params.status ?? ""
    : "";
  const priority = params.priority ?? "";
  const sort = ["due_date", "priority", "created_at"].includes(
    params.sort ?? ""
  )
    ? (params.sort as "due_date" | "priority" | "created_at")
    : "due_date";

  const tasks = await getTasks(userId, {
    status: (status || undefined) as "aktif" | "selesai" | undefined,
    priority: priority || undefined,
    sort,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          📋 Semua Tugas
        </h1>
        <p className="mt-1 text-slate-600">
          Kelola seluruh tugas harianmu dalam satu tempat.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">➕ Tambah tugas baru</h2>
        <TaskForm action={addTaskAction} submitLabel="Tambah Tugas" />
      </section>

      <Suspense>
        <Filters current={{ status, priority, sort }} />
      </Suspense>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
          <p className="text-4xl" aria-hidden="true">
            {status === "selesai" ? "🎉" : "📝"}
          </p>
          <p className="mt-3 font-semibold text-slate-700">
            {status === "selesai"
              ? "Belum ada tugas yang selesai"
              : "Tidak ada tugas ditemukan"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {status === "selesai"
              ? "Tandai tugas selesai dan tugas akan muncul di sini."
              : "Coba ubah filter atau tambahkan tugas baru."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
