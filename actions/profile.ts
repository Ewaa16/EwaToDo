"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import {
  getUserById,
  updateUserName,
  updateUserPassword,
  updateUserImage,
} from "@/lib/db";

const MAX_IMAGE_LEN = 400_000; // ~300KB setelah decode base64
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

const nameSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(50, "Nama maksimal 50 karakter"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password lama wajib diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
});

async function requireUserId(): Promise<number> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  const userId = Number(id);
  if (!Number.isInteger(userId)) redirect("/login");
  return userId;
}

function refreshProfilePaths() {
  revalidatePath("/");
  revalidatePath("/profil");
}

export type ProfileActionState = { error?: string; success?: string };

export async function updateProfileImageAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const userId = await requireUserId();
  const image = String(formData.get("image") ?? "");
  console.error("[dbg-action] userId=", userId, "imageLen=", image.length);

  if (!DATA_URL_RE.test(image)) {
    return { error: "Format gambar tidak valid." };
  }
  if (image.length > MAX_IMAGE_LEN) {
    return { error: "Gambar terlalu besar. Maksimal 300 KB." };
  }

  try {
    await updateUserImage(userId, image);
  } catch {
    return { error: "Gagal menyimpan foto profil. Coba lagi." };
  }
  refreshProfilePaths();
  return { success: "Foto profil berhasil diperbarui." };
}

export async function removeProfileImageAction(): Promise<void> {
  const userId = await requireUserId();
  try {
    await updateUserImage(userId, null);
  } catch {
    // kegagalan tidak boleh mematikan halaman
  }
  refreshProfilePaths();
}

export async function updateProfileNameAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const userId = await requireUserId();
  const parsed = nameSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nama tidak valid." };
  }

  try {
    await updateUserName(userId, parsed.data.name);
  } catch {
    return { error: "Gagal menyimpan nama. Coba lagi." };
  }
  refreshProfilePaths();
  return { success: "Nama berhasil diperbarui." };
}

export async function changePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const userId = await requireUserId();
  const parsed = passwordSchema.safeParse({
    currentPassword: String(formData.get("current-password") ?? ""),
    newPassword: String(formData.get("new-password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  const user = await getUserById(userId);
  if (!user?.password_hash) {
    return { error: "Akun ini tidak memakai password." };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password_hash);
  if (!valid) {
    return { error: "Password lama salah." };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
    await updateUserPassword(userId, passwordHash);
  } catch {
    return { error: "Gagal mengganti password. Coba lagi." };
  }
  refreshProfilePaths();
  return { success: "Password berhasil diganti." };
}
