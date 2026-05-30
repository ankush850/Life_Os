"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useLifeStore, DayTask } from "@/store/useLifeStore";
import { parseNLPRecurringTasks, ParsedNLPTask } from "@/lib/nlpParser";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Plus,
  Edit2,
  Sparkles,
  Award,
  Flame,
  AlertCircle,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DayRow {
  dateStr: string; // YYYY-MM-DD
  dayNum: number;
  dayName: string;
  tasksCount: number;
  completedCount: number;
  tasks: DayTask[];
}

interface LifeGridProps {
  onOpenDayDetails: (dateStr: string) => void;
}

export default function LifeGrid({ onOpenDayDetails }: LifeGridProps) {
  const store = useLifeStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Row Expansion State
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  // AI NLP quick schedule state
  const [nlpInput, setNlpInput] = useState("");
  const [parsedPreview, setParsedPreview] = useState<ParsedNLPTask[] | null>(null);

  // Manual task creation modal state
  const [addTaskModalOpen, setAddTaskModalOpen] = useState(false);
  const [addTaskDate, setAddTaskDate] = useState("");
  const [manualTask, setManualTask] = useState({
    title: "",
    duration: "",
    startTime: "",
    isRecurring: false,
    repeatType: "Daily" as "Daily" | "Weekdays" | "Weekends" | "Custom",
    startDate: "",
    endDate: "",
    customDays: [] as number[],
  });

  // Edit modal state
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DayTask | null>(null);
  const [editingDate, setEditingDate] = useState("");
  const [editFields, setEditFields] = useState({
    title: "",
    duration: "",
    startTime: "",
    status: "pending" as "pending" | "in_progress" | "completed" | "skipped",
  });

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

      const dayTasks = [...(store.dayTasks[dateStr] || [])];
      
      // Auto-migrate legacy target if it exists and no tasks are present
      const legacyTarget = store.dailyTargets[dateStr];
      if (legacyTarget && legacyTarget.target && dayTasks.length === 0) {
        dayTasks.push({
          id: `legacy-${dateStr}`,
          taskId: "legacy",
          title: legacyTarget.target,
          completed: legacyTarget.completed,
          date: dateStr,
        });
      }

      const completedCount = dayTasks.filter((t) => t.completed).length;

      rows.push({
        dateStr,
        dayNum: day,
        dayName,
        tasksCount: dayTasks.length,
        completedCount,
        tasks: dayTasks,
      });
    }
    return rows;
  }, [currentMonth, store.dayTasks, store.dailyTargets]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Streaks, Missed Tasks & Habit Consistency analytics
  const analytics = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    let totalScheduled = 0;
    let totalCompleted = 0;
    
    const taskConsistency: Record<string, { title: string; completed: number; total: number }> = {};
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let currentStreak = 0;
    let longestStreak = 0;
    
    const missedTasksList: Array<{ title: string; date: string }> = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      const dayTasks = [...(store.dayTasks[dateKey] || [])];
      const legacyTarget = store.dailyTargets[dateKey];
      if (legacyTarget && legacyTarget.target && dayTasks.length === 0) {
        dayTasks.push({
          id: `legacy-${dateKey}`,
          taskId: "legacy",
          title: legacyTarget.target,
          completed: legacyTarget.completed,
          date: dateKey,
        });
      }

      if (dayTasks.length > 0) {
        const allCompleted = dayTasks.every((t) => t.completed);
        
        if (dateKey <= todayStr) {
          if (allCompleted) {
            currentStreak++;
            if (currentStreak > longestStreak) {
              longestStreak = currentStreak;
            }
          } else {
            currentStreak = 0;
          }
        }

        dayTasks.forEach((task) => {
          totalScheduled++;
          if (task.completed) {
            totalCompleted++;
          } else if (dateKey < todayStr) {
            missedTasksList.push({ title: task.title, date: dateKey });
          }

          if (task.taskId !== "legacy" && task.taskId !== "single") {
            if (!taskConsistency[task.taskId]) {
              taskConsistency[task.taskId] = { title: task.title, completed: 0, total: 0 };
            }
            taskConsistency[task.taskId].total++;
            if (task.completed) {
              taskConsistency[task.taskId].completed++;
            }
          }
        });
      }
    }

    const monthlyCompletionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    
    let mostConsistentTaskName = "None";
    let highestRate = 0;
    Object.values(taskConsistency).forEach((tc) => {
      const rate = tc.total > 0 ? tc.completed / tc.total : 0;
      if (rate > highestRate) {
        highestRate = rate;
        mostConsistentTaskName = `${tc.title} (${Math.round(rate * 100)}%)`;
      }
    });

    return {
      monthlyCompletionRate,
      longestStreak,
      mostConsistentTaskName,
      missedTasks: missedTasksList.slice(0, 3),
    };
  }, [store.dayTasks, store.dailyTargets, year, month]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Toggle Row Expansion
  const toggleRow = useCallback((dateStr: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  }, []);

  // Run natural language parser on input
  const handleAIParse = () => {
    if (!nlpInput.trim()) return;
    const tasks = parseNLPRecurringTasks(nlpInput);
    if (tasks.length > 0) {
      setParsedPreview(tasks);
    }
  };

  // Confirm and save recurring series parsed by AI
  const handleConfirmAISchedule = () => {
    if (!parsedPreview) return;
    parsedPreview.forEach((task) => {
      store.addGridTaskSeries(task);
    });
    setParsedPreview(null);
    setNlpInput("");
  };

  // Create manual task (either single-day or recurring series)
  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTask.title.trim()) return;

    if (manualTask.isRecurring) {
      store.addGridTaskSeries({
        title: manualTask.title,
        duration: manualTask.duration || undefined,
        startTime: manualTask.startTime || undefined,
        startDate: manualTask.startDate,
        endDate: manualTask.endDate,
        repeatType: manualTask.repeatType,
        customDays: manualTask.repeatType === "Custom" ? manualTask.customDays : undefined,
      });
    } else {
      store.addDayTaskInstance(addTaskDate, {
        title: manualTask.title,
        duration: manualTask.duration || undefined,
        startTime: manualTask.startTime || undefined,
      });
    }

    setAddTaskModalOpen(false);
    // Reset form
    setManualTask({
      title: "",
      duration: "",
      startTime: "",
      isRecurring: false,
      repeatType: "Daily",
      startDate: "",
      endDate: "",
      customDays: [],
    });
  };

  const legacyTargetMatchesCompleted = useCallback((dateStr: string, desiredCompleted: boolean): boolean => {
    const target = store.dailyTargets[dateStr];
    return target ? target.completed !== desiredCompleted : false;
  }, [store]);

  // Toggle all tasks on a specific day
  const handleToggleAllDayTasks = useCallback((row: DayRow) => {
    if (row.tasksCount === 0) return;
    const allCompleted = row.completedCount === row.tasksCount;
    row.tasks.forEach((task) => {
      if (task.taskId === "legacy") {
        if (legacyTargetMatchesCompleted(row.dateStr, !allCompleted)) {
          store.toggleDailyTarget(row.dateStr);
        }
      } else {
        store.updateDayTaskInstance(row.dateStr, task.id, { completed: !allCompleted });
      }
    });
  }, [store, legacyTargetMatchesCompleted]);

  // Open edit modal for a task
  const handleOpenEditModal = (task: DayTask, dateStr: string) => {
    setEditingTask(task);
    setEditingDate(dateStr);
    setEditFields({
      title: task.title,
      duration: task.duration || "",
      startTime: task.startTime || "",
      status: task.status || "pending",
    });
    setEditTaskModalOpen(true);
  };

  // Save edits (Entire Series vs Single Day)
  const handleSaveEdit = (mode: "series" | "single") => {
    if (!editingTask || !editingDate) return;

    if (mode === "series" && editingTask.taskId !== "single" && editingTask.taskId !== "legacy") {
      store.updateGridTaskSeries(editingTask.taskId, {
        title: editFields.title,
        duration: editFields.duration || undefined,
        startTime: editFields.startTime || undefined,
      });
    } else {
      // Single day
      if (editingTask.taskId === "legacy") {
        store.setDailyTarget(editingDate, editFields.title);
      } else {
        store.updateDayTaskInstance(editingDate, editingTask.id, {
          title: editFields.title,
          duration: editFields.duration || undefined,
          startTime: editFields.startTime || undefined,
          status: editFields.status,
        });
      }
    }
    setEditTaskModalOpen(false);
  };

  // Delete task (Entire Series vs Single Day)
  const handleDeleteTask = (mode: "series" | "single") => {
    if (!editingTask || !editingDate) return;

    if (mode === "series" && editingTask.taskId !== "single" && editingTask.taskId !== "legacy") {
      store.deleteGridTaskSeries(editingTask.taskId);
    } else {
      // Single day
      if (editingTask.taskId === "legacy") {
        store.setDailyTarget(editingDate, "");
      } else {
        store.deleteDayTaskInstance(editingDate, editingTask.id);
      }
    }
    setEditTaskModalOpen(false);
  };

  const toggleCustomDaySelection = (dayNum: number) => {
    setManualTask((prev) => {
      const exists = prev.customDays.includes(dayNum);
      const newDays = exists
        ? prev.customDays.filter((d) => d !== dayNum)
        : [...prev.customDays, dayNum];
      return { ...prev, customDays: newDays };
    });
  };

  // TanStack Column Helpers
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
                    ? "bg-[#D4AF7A]/10 border-[#D4AF7A]/30 text-[#D4AF7A] shadow-[0_0_8px_rgba(212,175,122,0.15)]"
                    : "bg-slate-950/40 border-white/5 text-slate-400"
                }`}
              >
                {String(row.dayNum).padStart(2, "0")}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase ${
                  isToday ? "text-[#D4AF7A]" : "text-white/40"
                }`}
              >
                {row.dayName}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("tasksCount", {
        header: () => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Checklist Status
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          const pct = row.tasksCount > 0 ? Math.round((row.completedCount / row.tasksCount) * 100) : 0;
          return (
            <div className="flex flex-col gap-1 w-full max-w-[200px] text-left">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-300">
                  {row.completedCount} / {row.tasksCount} Tasks
                </span>
                {row.tasksCount > 0 && (
                  <span className={pct === 100 ? "text-[#D4AF7A]" : "text-[#D4AF7A]/80"}>
                    {pct}%
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-950/60 h-1.5 rounded-full overflow-hidden flex border border-white/5">
                <div
                  className={`h-full transition-all duration-300 ${pct === 100 ? "bg-[#D4AF7A]" : "bg-[#D4AF7A]/50"}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("tasks", {
        header: () => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Agenda Details
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex flex-wrap gap-1.5 max-w-[360px]">
              {row.tasks.map((t) => (
                <span
                  key={t.id}
                  className={`text-[9px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                    t.completed
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                      : "bg-slate-950/40 border-white/5 text-slate-400"
                  }`}
                >
                  <span className={`size-1 rounded-full ${t.completed ? "bg-emerald-400" : "bg-slate-500"}`} />
                  {t.title} {t.duration && `(${t.duration})`}
                </span>
              ))}
              {row.tasks.length === 0 && (
                <span className="text-[10px] text-slate-600 font-semibold italic">No tasks scheduled</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("completedCount", {
        header: () => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overall Status
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          if (row.tasksCount === 0) {
            return (
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wide">
                Empty
              </span>
            );
          }
          const allDone = row.completedCount === row.tasksCount;
          return (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering row expansion on click
                handleToggleAllDayTasks(row);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                allDone
                  ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "bg-white/2 border-white/5 text-white/50 hover:border-[#D4AF7A]/30 hover:text-[#D4AF7A]"
              }`}
            >
              {allDone ? (
                <>
                  <Check className="size-3 text-emerald-400" />
                  Completed
                </>
              ) : (
                <>
                  <span className="size-1.5 rounded-full bg-[#D4AF7A] animate-pulse" />
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
            Configure
          </span>
        ),
        cell: (info) => {
          const row = info.row.original;
          const isExpanded = !!expandedDates[row.dateStr];
          return (
            <div className="flex items-center justify-end gap-2 pr-2">
              <Button
                variant="ghost"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRow(row.dateStr);
                }}
                className="h-8 py-1.5 px-3 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold border border-white/5 text-slate-300 transition-all flex items-center gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="size-3.5" /> Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" /> Tasks
                  </>
                )}
              </Button>
            </div>
          );
        },
      }),
    ],
    [currentMonth, columnHelper, expandedDates, toggleRow, handleToggleAllDayTasks]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-6 w-full text-slate-200">
      
      {/* Month Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-light text-white flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <Calendar className="size-5 text-[#D4AF7A]" />
            Life Architecture
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Spreadsheet-speed recurring planner. Expand day rows to manage multi-task agendas, set targets, or trigger AI NLP scheduling.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/30 border border-white/5 p-1 rounded-xl">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-extrabold text-xs uppercase tracking-[0.15em] text-slate-200 px-2 min-w-[120px] text-center">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* AI Quick Schedule Input Panel */}
      <div className="rounded-3xl liquid-glass p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[#D4AF7A]">
            <Sparkles className="size-4 text-[#D4AF7A] animate-pulse" /> AI Quick Recurring Task Scheduler
          </h3>
          <span className="text-[9px] text-slate-500 font-mono">NATURAL LANGUAGE NLP COCKPIT</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={nlpInput}
            onChange={(e) => setNlpInput(e.target.value)}
            placeholder="e.g., Study for 3 hours daily, play football for 30 minutes, work on my hobby from June 1 to June 30"
            className="flex-1 bg-white/3 border-white/10 text-xs rounded-xl focus:border-[#D4AF7A] text-white font-semibold placeholder:text-white/20 transition-all min-h-[44px]"
            required
          />
          <button
            type="button"
            onClick={handleAIParse}
            disabled={!nlpInput.trim()}
            className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] disabled:opacity-50 font-bold rounded-full text-xs py-3 px-6 min-h-[44px] uppercase tracking-wider cursor-pointer transition-colors"
          >
            Parse Plans
          </button>
        </div>

        {/* AI Parsed Tasks Preview Area */}
        <AnimatePresence>
          {parsedPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-2xl bg-white/2 border border-[#D4AF7A]/20 flex flex-col gap-3.5"
            >
              <span className="text-[10px] font-bold text-[#D4AF7A] uppercase tracking-widest">
                Confirm schedule trajectory:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {parsedPreview.map((task, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/3 border border-white/5 text-left text-xs">
                    <p className="font-extrabold text-white">{task.title}</p>
                    <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-400 mt-1 uppercase">
                      <span>⏱️ Duration: {task.duration || "N/A"}</span>
                      <span>🔄 Recurrence: {task.repeatType}</span>
                      <span>📅 Active: {task.startDate} to {task.endDate}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setParsedPreview(null)}
                  className="rounded-lg text-xs font-bold hover:bg-white/5 text-slate-400 py-3.5"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmAISchedule}
                  className="bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-bold text-white px-5 py-3.5"
                >
                  Schedule Series
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats & Insights Analytics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col justify-center gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="size-3.5 text-[#D4AF7A]" /> Monthly Completion %
          </span>
          <span className="text-xl font-light text-[#D4AF7A] mt-0.5">
            {analytics.monthlyCompletionRate}%
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col justify-center gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="size-3.5 text-emerald-400" /> Task Streak
          </span>
          <span className="text-xl font-black text-emerald-400 mt-0.5">
            {analytics.longestStreak} Days
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col justify-center gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="size-3.5 text-yellow-400" /> Most Consistent Habit
          </span>
          <span className="text-sm font-black text-slate-200 mt-1 truncate" title={analytics.mostConsistentTaskName}>
            {analytics.mostConsistentTaskName}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col justify-center gap-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="size-3.5 text-rose-400" /> Missed Task Insights
          </span>
          <div className="flex flex-col gap-0.5 mt-0.5 text-[9px] text-rose-300 font-bold max-h-[36px] overflow-hidden">
            {analytics.missedTasks.map((t, idx) => (
              <span key={idx} className="truncate">
                ⚠️ {t.date.split("-").slice(1).join("/")} - {t.title}
              </span>
            ))}
            {analytics.missedTasks.length === 0 && (
              <span className="text-emerald-400 font-black uppercase">No Misses recorded!</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/15 backdrop-blur-md">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full min-w-0 md:min-w-[650px] text-left border-collapse">
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
              {table.getRowModel().rows.map((row) => {
                const isExpanded = !!expandedDates[row.original.dateStr];
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className="hover:bg-white/2 transition-colors duration-150 cursor-pointer"
                      onClick={() => toggleRow(row.original.dateStr)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-2 px-4 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    
                    {/* Expandable subrow checklist */}
                    {isExpanded && (
                      <tr className="bg-slate-950/40">
                        <td colSpan={columns.length} className="p-4 border-t border-b border-white/5">
                          <div className="flex flex-col gap-4">
                            
                            {/* Subrow Checklist Header */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className="text-xs font-bold text-slate-300">
                                Daily Checklist ({row.original.completedCount} / {row.original.tasksCount} completed)
                              </span>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDayDetails(row.original.dateStr);
                                  }}
                                  className="text-[10px] font-bold text-slate-400 hover:text-white flex items-center gap-1.5 min-h-[32px] px-2"
                                  title="Manage daily target and planner events"
                                >
                                  Manage Events
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAddTaskDate(row.original.dateStr);
                                    setManualTask((prev) => ({
                                      ...prev,
                                      startDate: row.original.dateStr,
                                      endDate: row.original.dateStr,
                                    }));
                                    setAddTaskModalOpen(true);
                                  }}
                                  className="text-[10px] font-bold text-[#D4AF7A] hover:text-[#E7CBA9] flex items-center gap-1.5 min-h-[32px] px-2 cursor-pointer transition-colors"
                                >
                                  <Plus className="size-3.5" /> Add Task
                                </button>
                              </div>
                            </div>

                            {/* Checklist instances */}
                            <div className="flex flex-col gap-2">
                              {row.original.tasks.map((task) => (
                                <div
                                  key={task.id}
                                  onClick={(e) => e.stopPropagation()} // Stop row toggle when clicking anywhere on checklist card
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all"
                                >
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (task.taskId === "legacy") {
                                          store.toggleDailyTarget(row.original.dateStr);
                                        } else {
                                          store.updateDayTaskInstance(row.original.dateStr, task.id, {
                                            completed: !task.completed,
                                          });
                                        }
                                      }}
                                      className={`size-4 rounded border-2 flex items-center justify-center transition-all ${
                                        task.completed
                                          ? "bg-emerald-500 border-emerald-400 text-white"
                                          : "border-white/20 hover:border-white/40"
                                      }`}
                                    >
                                      {task.completed && "✓"}
                                    </button>
                                    <span
                                      className={`text-xs font-bold ${
                                        task.completed ? "text-slate-500 line-through" : "text-slate-200"
                                      }`}
                                    >
                                      {task.title}{" "}
                                      {task.duration && (
                                        <span className="text-[10px] text-slate-400 font-normal">
                                          ({task.duration})
                                        </span>
                                      )}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(task, row.original.dateStr)}
                                    className="p-2 text-white/40 hover:text-[#D4AF7A] transition-colors min-h-[32px] px-2.5 cursor-pointer"
                                    title="Edit settings"
                                  >
                                    <Edit2 className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                              {row.original.tasks.length === 0 && (
                                <span className="text-xs text-slate-600 italic">
                                  No tasks scheduled for this day. Click &ldquo;Add Task&rdquo; to schedule one!
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: ADD MANUAL TASK */}
      <Dialog open={addTaskModalOpen} onOpenChange={setAddTaskModalOpen}>
        <DialogContent className="bg-[#071b33] border border-white/10 text-white rounded-3xl max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-light flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <Calendar className="size-5 text-[#D4AF7A]" />
              Add Task
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold mt-1">
              Add a one-time target instance or generate a recurring task series across a selected date range.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateManualTask} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-300">Task Title</Label>
              <Input
                value={manualTask.title}
                onChange={(e) => setManualTask((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Learn algorithmic complexities"
                className="bg-white/3 border border-white/10 text-xs rounded-xl focus:border-[#D4AF7A]/50 focus:ring-0"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-300">Duration (Optional)</Label>
              <Input
                value={manualTask.duration}
                onChange={(e) => setManualTask((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g., 2 hours, 45 minutes"
                className="bg-white/3 border border-white/10 text-xs rounded-xl focus:border-[#D4AF7A]/50 focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-300">Start Time (Optional)</Label>
              <Input
                value={manualTask.startTime}
                onChange={(e) => setManualTask((prev) => ({ ...prev, startTime: e.target.value }))}
                placeholder="e.g., 08:00 AM, 2:00 PM"
                className="bg-white/3 border border-white/10 text-xs rounded-xl focus:border-[#D4AF7A]/50 focus:ring-0"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-950/30 p-3 rounded-xl border border-white/5">
              <input
                id="is-recurring-check"
                type="checkbox"
                checked={manualTask.isRecurring}
                onChange={(e) => setManualTask((prev) => ({ ...prev, isRecurring: e.target.checked }))}
                className="size-4 rounded-full border-white/20 text-[#D4AF7A] focus:ring-0 bg-transparent cursor-pointer"
              />
              <Label htmlFor="is-recurring-check" className="text-xs font-bold text-slate-200 cursor-pointer">
                Repeat this task (Recurring series)
              </Label>
            </div>

            {manualTask.isRecurring && (
              <div className="flex flex-col gap-4 p-3.5 rounded-xl bg-slate-950/40 border border-white/5">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-bold text-slate-300">Repeat Type</Label>
                  <Select
                    value={manualTask.repeatType}
                    onValueChange={(val) =>
                      setManualTask((prev) => ({
                        ...prev,
                        repeatType: val as "Daily" | "Weekdays" | "Weekends" | "Custom",
                      }))
                    }
                  >
                    <SelectTrigger className="bg-white/3 border border-white/10 text-xs rounded-xl text-white font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#071b33] border border-white/10 text-white font-sans">
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekdays">Weekdays (Mon-Fri)</SelectItem>
                      <SelectItem value="Weekends">Weekends (Sat-Sun)</SelectItem>
                      <SelectItem value="Custom">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {manualTask.repeatType === "Custom" && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase">Select days:</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, index) => {
                        const isSelected = manualTask.customDays.includes(index);
                        return (
                          <button
                            type="button"
                            key={index}
                            onClick={() => toggleCustomDaySelection(index)}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                              isSelected
                                ? "bg-[#D4AF7A]/25 border-[#D4AF7A]/40 text-[#D4AF7A]"
                                : "bg-slate-950/40 border-white/5 text-slate-500"
                            }`}
                          >
                            {dayName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-bold text-slate-300">Start Date</Label>
                    <Input
                      type="date"
                      value={manualTask.startDate}
                      onChange={(e) => setManualTask((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="bg-white/3 border border-white/10 text-xs rounded-xl font-semibold text-white focus:border-[#D4AF7A]/50 focus:ring-0"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-bold text-slate-300">End Date</Label>
                    <Input
                      type="date"
                      value={manualTask.endDate}
                      onChange={(e) => setManualTask((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="bg-white/3 border border-white/10 text-xs rounded-xl font-semibold text-white focus:border-[#D4AF7A]/50 focus:ring-0"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end mt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setAddTaskModalOpen(false)}
                className="rounded-xl text-xs font-bold hover:bg-white/5 text-slate-400 py-4.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#D4AF7A] hover:bg-[#E7CBA9] rounded-full text-xs font-bold text-[#071B33] px-5 py-4 uppercase tracking-wider cursor-pointer transition-colors"
              >
                Add Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CONFIGURE / BULK EDIT TASK */}
      <Dialog open={editTaskModalOpen} onOpenChange={setEditTaskModalOpen}>
        <DialogContent className="bg-[#071b33] border border-white/10 text-white rounded-3xl max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-light flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <Edit2 className="size-5 text-[#D4AF7A]" />
              Configure Task
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-semibold mt-1">
              Select whether to modify or delete this single instance or the entire recurring task series.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-300">Title</Label>
              <Input
                value={editFields.title}
                onChange={(e) => setEditFields((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-slate-950/50 border-white/20 text-xs rounded-xl focus:border-indigo-500 text-white font-semibold"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-300">Duration</Label>
              <Input
                value={editFields.duration}
                onChange={(e) => setEditFields((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g. 1 hour"
                className="bg-slate-950/50 border-white/20 text-xs rounded-xl focus:border-indigo-500 text-white font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-300">Start Time (Optional)</Label>
              <Input
                value={editFields.startTime}
                onChange={(e) => setEditFields((prev) => ({ ...prev, startTime: e.target.value }))}
                placeholder="e.g. 08:00 AM, 2:00 PM"
                className="bg-slate-950/50 border-white/20 text-xs rounded-xl focus:border-indigo-500 text-white font-semibold"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-300">Status (Single Day Edit only)</Label>
              <Select
                value={editFields.status}
                onValueChange={(val) =>
                  setEditFields((prev) => ({
                    ...prev,
                    status: val as "pending" | "in_progress" | "completed" | "skipped",
                  }))
                }
              >
                <SelectTrigger className="bg-white/3 border border-white/10 text-xs rounded-xl text-white font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#071b33] border border-white/10 text-white font-sans">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="skipped">Skipped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => handleSaveEdit("single")}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-bold py-4 rounded-xl"
                >
                  Save Day Only
                </Button>
                {editingTask && editingTask.taskId !== "single" && editingTask.taskId !== "legacy" && (
                  <Button
                    type="button"
                    onClick={() => handleSaveEdit("series")}
                    className="flex-1 bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] text-xs font-bold py-3.5 rounded-full uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Save Entire Series
                  </Button>
                )}
              </div>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  onClick={() => handleDeleteTask("single")}
                  className="flex-1 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-bold py-4 rounded-xl"
                >
                  Delete Day Only
                </Button>
                {editingTask && editingTask.taskId !== "single" && editingTask.taskId !== "legacy" && (
                  <Button
                    type="button"
                    onClick={() => handleDeleteTask("series")}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-4 rounded-xl"
                  >
                    Delete Series
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
