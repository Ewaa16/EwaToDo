"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { updateUserImage } from "@/lib/db";

const MAX_IMAGE_LEN = 400_000; // ~300KB setelah decode base64
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

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
