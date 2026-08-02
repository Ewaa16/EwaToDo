"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOutAction } from "@/actions/auth";
import { Logo } from "@/components/Logo";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/tasks", label: "Tugas" },
  { href: "/stats", label: "Statistik" },
];

type NavbarProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
};

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);
  const initial = (user.name ?? user.email ?? "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/">
          <Logo size="sm" />
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 sm:flex">
            {user.image && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? "Foto profil"}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-100"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                {initial}
              </span>
            )}
            <span className="max-w-[10rem] truncate text-sm font-medium text-slate-700">
              {user.name}
            </span>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
