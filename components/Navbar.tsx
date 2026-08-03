"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/actions/auth";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Beranda",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    href: "/tasks",
    label: "Tugas",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="m3 6 1 1 2-2" />
        <path d="m3 12 1 1 2-2" />
        <path d="m3 18 1 1 2-2" />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "Statistik",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </svg>
    ),
  },
];

type NavbarProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);
  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" aria-label="Beranda">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div className="hidden items-center gap-2.5 sm:flex">
              {user.image && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Foto profil"}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-500/40"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {initial}
                </span>
              )}
              <span className="max-w-[10rem] truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                {user.name}
              </span>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-500/60 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
