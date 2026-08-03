import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      {params.registered === "1" && (
        <div className="mb-5 w-full max-w-md rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
          Akun berhasil dibuat! Silakan masuk.
        </div>
      )}
      <LoginForm isNew={params.registered === "1"} />
    </main>
  );
}
