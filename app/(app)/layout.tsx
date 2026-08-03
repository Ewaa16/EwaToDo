import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <Navbar
        user={{ name: user.name, email: user.email, image: user.image }}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-8 md:pb-8">
        {children}
      </main>
      <footer className="hidden border-t border-slate-200 py-6 md:block">
        <p className="text-center text-xs text-slate-400">
          EwaToDo · catat tugas harianmu dengan mudah 🗒️
        </p>
      </footer>
    </div>
  );
}
