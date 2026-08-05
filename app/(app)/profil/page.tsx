import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileForm } from "@/components/ProfileForm";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) redirect("/login");

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
    </div>
  );
}
