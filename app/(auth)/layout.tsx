import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/");
  }
  return (
    <div className="flex min-h-full flex-col bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-100">
      {children}
    </div>
  );
}
