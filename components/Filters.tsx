"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type FiltersProps = {
  current: {
    status: string;
    priority: string;
    sort: string;
  };
};

const selectCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:[color-scheme:dark] dark:focus:ring-indigo-500/30";

export function Filters({ current }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key);
    else params.set(key, value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectCls}
        value={current.status}
        onChange={(e) => update("status", e.target.value)}
        aria-label="Filter status"
      >
        <option value="">Semua status</option>
        <option value="aktif">Belum selesai</option>
        <option value="selesai">Selesai</option>
      </select>

      <select
        className={selectCls}
        value={current.priority}
        onChange={(e) => update("priority", e.target.value)}
        aria-label="Filter prioritas"
      >
        <option value="">Semua prioritas</option>
        <option value="tinggi">Tinggi</option>
        <option value="sedang">Sedang</option>
        <option value="rendah">Rendah</option>
      </select>

      <select
        className={selectCls}
        value={current.sort}
        onChange={(e) => update("sort", e.target.value)}
        aria-label="Urutkan"
      >
        <option value="due_date">Urut: deadline</option>
        <option value="priority">Urut: prioritas</option>
        <option value="created_at">Urut: terbaru</option>
      </select>
    </div>
  );
}
