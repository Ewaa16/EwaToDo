import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { VisitTracker } from "@/components/VisitTracker";
import { OWNER_EMAIL } from "@/lib/owner";

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

  const isOwner = user.email === OWNER_EMAIL;

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
      >
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-600/15" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-600/10" />
        <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl dark:bg-sky-600/10" />
      </div>
      <div className="relative z-10 flex min-h-full flex-col">
        <VisitTracker />
        <Navbar
          user={{ name: user.name, email: user.email, image: user.image }}
          isOwner={isOwner}
        />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-8 md:pb-8">
          {children}
        </main>
        <footer className="hidden border-t border-slate-200 py-6 dark:border-slate-800 md:block">
          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            EwaToDo · catat tugas harianmu dengan mudah 🗒️
          </p>
        </footer>
      </div>
    </div>
  );
}
