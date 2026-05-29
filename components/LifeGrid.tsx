"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useLifeStore } from "@/store/useLifeStore";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DayRow {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  dayName: string;
  target: string;
  completed: boolean;
}

interface LifeGridProps {
  onOpenDayDetails: (dateStr: string) => void;
}

export default function LifeGrid({ onOpenDayDetails }: LifeGridProps) {
  const store = useLifeStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Input refs for keyboard navigation
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Generate rows for the current month
  const data = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const rows: DayRow[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      const targetInfo = store.dailyTargets[dateStr];

      rows.push({
        dateStr,
        dayNum: day,
        dayName,
        target: targetInfo?.target || "",
        completed: targetInfo?.completed || false,
      });
    }
    return rows;
  }, [currentMonth, store.dailyTargets]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate consistency stats for header
  const stats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    const targetKeys = Object.keys(store.dailyTargets).filter((date) =>
      date.startsWith(monthPrefix)
    );
    const totalSet = targetKeys.length;
    const completed = targetKeys.filter(
      (date) => store.dailyTargets[date]?.completed
    ).length;
    const successRate = totalSet ? Math.round((completed / totalSet) * 100) : 0;
    return { totalSet, completed, successRate };
  }, [year, month, store.dailyTargets]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Handle cell target updates
  const handleTargetChange = useCallback((dateStr: string, value: string) => {
    store.setDailyTarget(dateStr, value);
  }, [store]);

  // Handle keyboard navigation inside the grid inputs
  const handleKeyDown = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const totalRows = data.length;

    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      const nextIndex = (index + 1) % totalRows;
      const nextDateStr = data[nextIndex].dateStr;
      inputRefs.current[nextDateStr]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (index - 1 + totalRows) % totalRows;
      const prevDateStr = data[prevIndex].dateStr;
      inputRefs.current[prevDateStr]?.focus();
    } else if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  }, [data]);

  // Column helpers for TanStack Table
  const columnHelper = createColumnHelper<DayRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("dayNum", {
        header: () => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Day
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          const isToday =
            new Date().getDate() === row.dayNum &&
            new Date().getMonth() === currentMonth.getMonth() &&
            new Date().getFullYear() === currentMonth.getFullYear();

          return (
            <div className="flex items-center gap-2 py-1">
              <span
                className={`font-mono text-xs font-bold size-6 rounded flex items-center justify-center border transition-all ${
                  isToday
                    ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                    : "bg-slate-950/40 border-white/5 text-slate-400"
                }`}
              >
                {String(row.dayNum).padStart(2, "0")}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase ${
                  isToday ? "text-indigo-400" : "text-slate-500"
                }`}
              >
                {row.dayName}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("target", {
        header: () => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Daily Focus Target
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          const index = info.row.index;
          return (
            <div className="relative group w-full pr-4">
              <input
                ref={(el) => {
                  inputRefs.current[row.dateStr] = el;
                }}
                aria-label="Daily Target"
                type="text"
                value={row.target}
                placeholder="Start typing to set target..."
                onChange={(e) => handleTargetChange(row.dateStr, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-full bg-transparent border-b text-xs font-semibold py-1 px-2 text-slate-200 transition-all placeholder:text-slate-600 focus:outline-none focus:placeholder:opacity-30 ${
                  row.completed
                    ? "border-emerald-500/20 text-slate-400 line-through focus:border-emerald-500/50"
                    : row.target
                    ? "border-indigo-500/20 focus:border-indigo-400"
                    : "border-transparent hover:border-white/5 focus:border-white/20"
                }`}
              />
            </div>
          );
        },
      }),
      columnHelper.accessor("completed", {
        header: () => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Status
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          if (!row.target) {
            return (
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wide">
                Empty
              </span>
            );
          }
          return (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => store.toggleDailyTarget(row.dateStr)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                row.completed
                  ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "bg-slate-950/40 border-white/5 text-slate-400 hover:border-indigo-500/30 hover:text-indigo-300"
              }`}
            >
              {row.completed ? (
                <>
                  <Check className="size-3 text-emerald-400" />
                  Completed
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  Pending
                </>
              )}
            </motion.button>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right block pr-2">
            Milestones
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          const dayEvents = store.events.filter((e) => e.date === row.dateStr);

          return (
            <div className="flex items-center justify-end gap-2 pr-2">
              {dayEvents.length > 0 && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded font-mono">
                  {dayEvents.length} EVT
                </span>
              )}
              <Button
                variant="ghost"
                onClick={() => onOpenDayDetails(row.dateStr)}
                className="h-7 py-1 px-2.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold border border-white/5 text-slate-300"
              >
                Configure
              </Button>
            </div>
          );
        },
      }),
    ],
    [currentMonth, columnHelper, handleKeyDown, handleTargetChange, onOpenDayDetails, store]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Month Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="size-5 text-indigo-400" />
            Life Grid Console
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Spreadsheet-speed monthly planning cockpit. Move with{" "}
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px] text-slate-200">
              Arrow keys
            </kbd>{" "}
            or{" "}
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px] text-slate-200">
              Enter
            </kbd>
            .
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/30 border border-white/5 p-1 rounded-xl">
          <button type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-extrabold text-xs uppercase tracking-[0.15em] text-slate-200 px-2 min-w-[120px] text-center">
            {monthLabel}
          </span>
          <button type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Daily Success Rate
          </span>
          <span className="text-xl font-black text-emerald-400 mt-1">
            {stats.successRate}%
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Targets Achieved
          </span>
          <span className="text-xl font-black text-indigo-400 mt-1">
            {stats.completed} / {stats.totalSet}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col justify-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Grid Coverage
          </span>
          <span className="text-xl font-black text-white mt-1">
            {stats.totalSet} / {data.length} Days
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/15 backdrop-blur-md">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full min-w-[650px] text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-white/10 bg-slate-950/50 sticky top-0 z-10"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4 font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/2 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 px-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
