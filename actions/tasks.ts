"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createTask,
  deleteTask,
  formatLocalDate,
  setTaskCompleted,
  updateTask,
} from "@/lib/db";

function isValidIsoDate(value: string): boolean {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  return formatLocalDate(d) === value;
}

const taskSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  description: z
    .string()
    .trim()
    .max(2000, "Deskripsi maksimal 2000 karakter")
    .nullable()
    .optional(),
  category: z.string().trim().max(50).optional().default("Umum"),
  priority: z
    .enum(["rendah", "sedang", "tinggi"])
    .optional()
    .default("sedang"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid")
    .refine(isValidIsoDate, { message: "Tanggal tidak valid" })
    .nullable()
    .optional(),
});

async function requireUserId(): Promise<number> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  const userId = Number(id);
  // Cegah binding nilai non-integer (userId harus integer di DB).
  if (!Number.isInteger(userId)) redirect("/login");
  return userId;
}

function parseTask(formData: FormData) {
  return taskSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: formData.get("description") || null,
    category: String(formData.get("category") || "Umum"),
    priority: String(formData.get("priority") || "sedang"),
    due_date: String(formData.get("due_date") || "") || null,
  });
}

function refreshAll() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/stats");
}

export async function addTaskAction(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const parsed = parseTask(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }
  try {
    await createTask(userId, parsed.data);
  } catch {
    return { error: "Gagal menyimpan tugas. Coba lagi." };
  }
  refreshAll();
  return {};
}

export async function editTaskAction(
  id: number,
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const userId = await requireUserId();
  const parsed = parseTask(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }
  try {
    const updated = await updateTask(id, userId, parsed.data);
    if (!updated) return { error: "Tugas tidak ditemukan." };
  } catch {
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }
  refreshAll();
  return {};
}

export async function toggleTaskAction(
  id: number,
  completed: boolean
): Promise<void> {
  const userId = await requireUserId();
  try {
    await setTaskCompleted(id, userId, completed);
  } catch {
    // kegagalan toggle tidak boleh mematikan halaman; daftar tetap direvalidasi
  }
  refreshAll();
}

export async function deleteTaskAction(id: number): Promise<void> {
  const userId = await requireUserId();
  try {
    await deleteTask(id, userId);
  } catch {
    // sama seperti toggle
  }
  refreshAll();
}
