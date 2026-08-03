"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyStat } from "@/lib/db";

export function StatsChart({ data }: { data: DailyStat[] }) {
  const [dark, setDark] = useState(false);
  const total = data.reduce((sum, d) => sum + d.completed, 0);

  useEffect(() => {
    const apply = () =>
      setDark(document.documentElement.classList.contains("dark"));
    const id = setTimeout(apply, 0);
    window.addEventListener("ewatodo-theme", apply);
    return () => {
      clearTimeout(id);
      window.removeEventListener("ewatodo-theme", apply);
    };
  }, []);

  const grid = dark ? "#1e293b" : "#e2e8f0";
  const tick = dark ? "#94a3b8" : "#64748b";
  const tooltipBg = dark ? "#0f172a" : "#ffffff";
  const tooltipBorder = dark ? "#334155" : "#e2e8f0";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Tugas Selesai 7 Hari Terakhir
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {total}
            </span>{" "}
            tugas selesai dalam sepekan
          </p>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={grid}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 13, fill: tick }}
              axisLine={{ stroke: grid }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 13, fill: tick }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
              contentStyle={{
                borderRadius: 12,
                border: `1px solid ${tooltipBorder}`,
                fontSize: 13,
                backgroundColor: tooltipBg,
                color: dark ? "#e2e8f0" : "#0f172a",
              }}
              formatter={(value) => [`${value} tugas`, "Selesai"]}
            />
            <Bar
              dataKey="completed"
              fill="#6366f1"
              radius={[8, 8, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
