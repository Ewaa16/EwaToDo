"use client";

import { useEffect, useState } from "react";
import { JAKARTA_TZ } from "@/lib/jakarta";

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: JAKARTA_TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function RealtimeClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <time className="tabular-nums" dateTime={now.toISOString()}>
      {timeFormatter.format(now)} WIB
    </time>
  );
}
