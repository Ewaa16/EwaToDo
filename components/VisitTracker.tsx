"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    fetch("/api/track-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {
      // Abaikan — pencatatan kunjungan tidak boleh mengganggu navigasi.
    });
  }, [pathname]);

  return null;
}
