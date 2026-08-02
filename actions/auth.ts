"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { createUser, getUserByEmail } from "@/lib/db";
import {
  clearRateLimit,
  isRateLimited,
  recordAttempt,
} from "@/lib/rate-limit";

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW = 15 * 60 * 1000; // 15 menit
const REGISTER_LIMIT = 3;
const REGISTER_WINDOW = 60 * 60 * 1000; // 1 jam

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

export async function loginAction(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");

  const key = `login:${email}`;
  const blocked = await isRateLimited(key, LOGIN_LIMIT);
  if (blocked !== null) {
    const menit = Math.max(1, Math.ceil(blocked / 60));
    return {
      error: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.`,
    };
  }

  // Verifikasi manual untuk pencatatan rate limit sebelum memanggil signIn.
  const user = await getUserByEmail(email);
  const valid =
    !!user?.password_hash && (await bcrypt.compare(password, user.password_hash));
  if (!valid) {
    await recordAttempt(key, LOGIN_WINDOW);
    return { error: "Email atau password salah." };
  }
  await clearRateLimit(key);

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    throw error;
  }
  return {};
}

export async function loginGoogleAction(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function registerAction(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const ip = await getClientIp();
  const regKey = `register:${ip}`;
  if ((await isRateLimited(regKey, REGISTER_LIMIT)) !== null) {
    return { error: "Terlalu banyak pendaftaran. Coba lagi nanti." };
  }

  const parsed = registerSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }

  const email = parsed.data.email.toLowerCase();
  try {
    if (await getUserByEmail(email)) {
      return {
        error: "Pendaftaran gagal. Coba email lain atau masuk dengan akunmu.",
      };
    }
    const password_hash = await bcrypt.hash(parsed.data.password, 10);
    await createUser({ name: parsed.data.name, email, password_hash });
  } catch {
    return { error: "Terjadi kesalahan saat mendaftar. Coba lagi." };
  }

  await recordAttempt(regKey, REGISTER_WINDOW);
  redirect("/login?registered=1");
}
