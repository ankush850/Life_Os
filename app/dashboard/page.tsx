"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLifeStore, DayTask } from "@/store/useLifeStore";
import { PRESET_WALLPAPERS } from "@/lib/quotes";
import LifeGrid from "@/components/LifeGrid";

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const cleanTime = timeStr.trim().toUpperCase();
  const ampmMatch = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3];
    if (ampm === "PM" && hours < 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  }
  
  const colonMatch = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1], 10);
    const minutes = parseInt(colonMatch[2], 10);
    return hours * 60 + minutes;
  }

  const simpleMatch = cleanTime.match(/^(\d{1,2})\s*(AM|PM)$/);
  if (simpleMatch) {
    let hours = parseInt(simpleMatch[1], 10);
    const ampm = simpleMatch[2];
    if (ampm === "PM" && hours < 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }
    return hours * 60;
  }

  return null;
}

function isTaskOverdue(task: DayTask, nowMinutes: number, todayStr: string): boolean {
  if (task.completed || task.status === 'completed' || task.status === 'skipped' || task.status === 'in_progress') {
    return false;
  }
  if (task.date < todayStr) {
    return true;
  }
  if (task.date === todayStr) {
    if (!task.startTime) return false;
    const taskStartMin = parseTimeToMinutes(task.startTime);
    if (taskStartMin !== null && nowMinutes > taskStartMin) {
      return true;
    }
  }
  return false;
}

function getTaskCategory(title: string): string {
  const t = title.toLowerCase();
  if (/study|code|programm|learn|course|english|read|book|class|exam/i.test(t)) {
    return "📚 Study";
  }
  if (/work|office|meet|client|project|business|task|deploy/i.test(t)) {
    return "💼 Work";
  }
  if (/gym|workout|run|walk|football|sport|health|water|meditat|sleep|stretch/i.test(t)) {
    return "💪 Health";
  }
  if (/expense|budget|buy|pay|finance|bank|money|card/i.test(t)) {
    return "💵 Finance";
  }
  return "🎯 Personal";
}
import JourneyReplay from "@/components/JourneyReplay";
import EngineeringMode from "@/components/EngineeringMode";
import LifeEngine from "@/components/LifeEngine";
import FocusMode from "@/components/FocusMode";
import DailyTaskSystem from "@/components/DailyTaskSystem";
import MonthlyPlanner from "@/components/MonthlyPlanner";
import FinancialOS from "@/components/FinancialOS";
import {
  Sparkles,
  CheckCircle2,
  Calendar as CalendarIcon,
  Wallet,
  BarChart3,
  LogOut,
  Sliders,
  Plus,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  Trash2,
  Upload,
  Target,
  Check,
  AlertCircle,
  Terminal,
  Layers,
  Brain,
  Menu,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const { push } = useRouter();
  const store = useLifeStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useLifeStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsubFinish = useLifeStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsubFinish();
    }
  }, []);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [analyticsFilter, setAnalyticsFilter] = useState<"Week" | "Month" | "Year">("Week");
  const [isEngineeringMode, setIsEngineeringMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Customization Dialog State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [bgInput, setBgInput] = useState(store.settings.bgImage);
  const [blurVal, setBlurVal] = useState(store.settings.bgBlur);
  const [opacityVal, setOpacityVal] = useState(store.settings.bgOpacity);

  // Check if telemetry data exists (at least 3 daily targets or transactions)
  const hasTelemetryData = useMemo(() => {
    const targetsCount = Object.keys(store.dailyTargets).length;
    const expensesCount = store.expenses.length;
    return targetsCount >= 3 || expensesCount >= 3;
  }, [store.dailyTargets, store.expenses]);

  // Form states for creating new items
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState("");
  const [newTaskStartTime, setNewTaskStartTime] = useState("");

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("Food");
  const [newExpenseType, setNewExpenseType] = useState<"income" | "expense">("expense");
  const [newExpenseDesc, setNewExpenseDesc] = useState("");

  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectCategory, setNewProjectCategory] = useState("Design");

  // Calendar event sub-modal within Day Detail Modal
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("Work");

  // Day Detail Modal (Handles daily planner target + events)
  const [dayDetailModalOpen, setDayDetailModalOpen] = useState(false);
  const [dayTargetText, setDayTargetText] = useState("");
  const [dayTargetCompleted, setDayTargetCompleted] = useState(false);

  // Today's Target Planner input
  const [todayTargetInputText, setTodayTargetInputText] = useState("");

  // Calendar month state
  const [currentMonth] = useState(new Date());

  // Monitor Hydration
  useEffect(() => {
    
  }, []);

  // Dynamic current time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Trigger re-calculation every minute
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => {
    const year = currentTime.getFullYear();
    const month = String(currentTime.getMonth() + 1).padStart(2, "0");
    const day = String(currentTime.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [currentTime]);

  const todaysTasks = useMemo(() => {
    const tasks = store.dayTasks[todayStr] || [];
    
    // Auto-migrate legacy target if it exists and no tasks are present
    const legacyTarget = store.dailyTargets[todayStr];
    if (legacyTarget && legacyTarget.target && tasks.length === 0) {
      return [{
        id: `legacy-${todayStr}`,
        taskId: "legacy",
        title: legacyTarget.target,
        completed: legacyTarget.completed,
        date: todayStr,
        status: (legacyTarget.completed ? 'completed' : 'pending') as "completed" | "pending",
      }];
    }
    return tasks;
  }, [store.dayTasks, store.dailyTargets, todayStr]);

  const nowMinutes = useMemo(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }, [currentTime]);

  const overdueTasks = useMemo(() => {
    const list: DayTask[] = [];
    Object.keys(store.dayTasks).forEach((dateKey) => {
      if (dateKey <= todayStr) {
        const tasks = store.dayTasks[dateKey] || [];
        tasks.forEach((task) => {
          if (isTaskOverdue(task, nowMinutes, todayStr)) {
            list.push(task);
          }
        });
      }
    });

    Object.keys(store.dailyTargets).forEach((dateKey) => {
      if (dateKey <= todayStr) {
        const target = store.dailyTargets[dateKey];
        if (target && target.target && !target.completed) {
          const dayTasks = store.dayTasks[dateKey] || [];
          if (dayTasks.length === 0) {
            if (dateKey < todayStr) {
              list.push({
                id: `legacy-${dateKey}`,
                taskId: "legacy",
                title: target.target,
                completed: target.completed,
                date: dateKey,
                status: 'pending',
              });
            }
          }
        }
      }
    });

    return list;
  }, [store.dayTasks, store.dailyTargets, todayStr, nowMinutes]);

  const nextTask = useMemo(() => {
    const upcoming = todaysTasks.filter((task) => {
      if (task.completed || task.status === 'completed' || task.status === 'skipped') {
        return false;
      }
      if (!task.startTime) return false;
      const startMin = parseTimeToMinutes(task.startTime);
      return startMin !== null && startMin > nowMinutes;
    });

    if (upcoming.length === 0) return null;

    upcoming.sort((a, b) => {
      const minA = parseTimeToMinutes(a.startTime!) || 0;
      const minB = parseTimeToMinutes(b.startTime!) || 0;
      return minA - minB;
    });

    return upcoming[0];
  }, [todaysTasks, nowMinutes]);

  const nextTaskCountdown = useMemo(() => {
    if (!nextTask || !nextTask.startTime) return "";
    const startMin = parseTimeToMinutes(nextTask.startTime);
    if (startMin === null) return "";
    const diff = startMin - nowMinutes;
    if (diff <= 0) return "";
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hrs > 0) {
      return `Starts in ${hrs}h ${mins}m`;
    }
    return `Starts in ${mins}m`;
  }, [nextTask, nowMinutes]);

  const nextTaskTimeRange = useMemo(() => {
    if (!nextTask || !nextTask.startTime) return "";
    const startMin = parseTimeToMinutes(nextTask.startTime);
    if (startMin === null) return nextTask.startTime;
    
    let durationMin = 0;
    if (nextTask.duration) {
      const durStr = nextTask.duration.toLowerCase();
      const hourMatch = durStr.match(/(\d+(\.\d+)?)\s*hour/);
      const minMatch = durStr.match(/(\d+)\s*min/);
      if (hourMatch) {
        durationMin += parseFloat(hourMatch[1]) * 60;
      } else if (minMatch) {
        durationMin += parseInt(minMatch[1], 10);
      } else {
        const rawNumMatch = durStr.match(/(\d+(\.\d+)?)/);
        if (rawNumMatch) {
          durationMin += parseFloat(rawNumMatch[1]) * 60;
        }
      }
    }

    if (durationMin === 0) {
      return nextTask.startTime;
    }

    const endMin = (startMin + durationMin) % 1440;
    const formatMinToTime = (totalMin: number) => {
      let hours = Math.floor(totalMin / 60);
      const mins = totalMin % 60;
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`;
    };

    return `${nextTask.startTime} – ${formatMinToTime(endMin)}`;
  }, [nextTask]);

  const todaysProgress = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    let skipped = 0;

    todaysTasks.forEach((task) => {
      if (task.status === 'skipped') {
        skipped++;
      } else if (task.completed || task.status === 'completed') {
        completed++;
      } else if (isTaskOverdue(task, nowMinutes, todayStr)) {
        overdue++;
      } else {
        pending++;
      }
    });

    const total = todaysTasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, pending, overdue, skipped, total, rate };
  }, [todaysTasks, nowMinutes, todayStr]);

  // Mount/Redirect checklist
  useEffect(() => {
    if (hasHydrated && !store.settings.isLoggedIn) {
      push("/login");
    }
  }, [hasHydrated, store.settings.isLoggedIn, push]);

  // Focus Timer Clock ticking logic
  const isFocusRunning = store.isFocusRunning;
  const isFocusTimerStarted = store.focusSeconds > 0;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocusRunning) {
      interval = setInterval(() => {
        const latestSeconds = useLifeStore.getState().focusSeconds;
        useLifeStore.getState().setFocusSeconds(latestSeconds + 1);
      }, 1000);
    } else if (isFocusTimerStarted) {
      interval = setInterval(() => {
        const latestPaused = useLifeStore.getState().focusPausedSeconds;
        useLifeStore.getState().setFocusPausedSeconds(latestPaused + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusRunning, isFocusTimerStarted]);

  // Update input states when store loads from hydration
  useEffect(() => {
    if (hasHydrated) {
      setBgInput(store.settings.bgImage);
      setBlurVal(store.settings.bgBlur);
      setOpacityVal(store.settings.bgOpacity);
    }
  }, [hasHydrated, store.settings.bgImage, store.settings.bgBlur, store.settings.bgOpacity]);

  // Format focus hours
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    return `${hrs} h ${mins} m`;
  };

  const activePercent = (store.focusSeconds / (store.focusSeconds + store.focusPausedSeconds || 1)) * 100;

  // Background Customization Handlers
  const handleBgSave = () => {
    store.updateSettings({
      bgImage: bgInput,
      bgBlur: blurVal,
      bgOpacity: opacityVal,
    });
    setIsCustomizing(false);
  };

  const handleLocalBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBgInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Task submit handler
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    store.addDayTaskInstance(todayStr, {
      title: newTaskTitle,
      duration: newTaskDuration || undefined,
      startTime: newTaskStartTime || undefined,
    });
    setNewTaskTitle("");
    setNewTaskDuration("");
    setNewTaskStartTime("");
    setTaskModalOpen(false);
  };

  // Expense submit handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newExpenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    store.addExpense({
      amount: parsedAmount,
      category: newExpenseCategory,
      type: newExpenseType,
      date: new Date().toISOString().split("T")[0],
      description: newExpenseDesc,
    });
    setNewExpenseAmount("");
    setNewExpenseDesc("");
    setExpenseModalOpen(false);
  };

  // Habit handler
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName) return;
    store.addHabit(newHabitName);
    setNewHabitName("");
    setHabitModalOpen(false);
  };

  // Project handler
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    store.addProject({
      name: newProjectName,
      status: "Upcoming",
      category: newProjectCategory,
    });
    setNewProjectName("");
    setProjectModalOpen(false);
  };

  // Calendar Event handler
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !selectedCalendarDate) return;
    store.addEvent({
      title: newEventTitle,
      date: selectedCalendarDate,
      category: newEventCategory,
    });
    setNewEventTitle("");
  };

  // Calendar Day Click Handler
  const handleDayClick = (dateStr: string) => {
    setSelectedCalendarDate(dateStr);
    const target = store.dailyTargets[dateStr];
    setDayTargetText(target?.target || "");
    setDayTargetCompleted(target?.completed || false);
    setDayDetailModalOpen(true);
  };

  // Day Target Save Handler
  const handleSaveDayTarget = () => {
    store.setDailyTarget(selectedCalendarDate, dayTargetText);
    const currentCompleted = store.dailyTargets[selectedCalendarDate]?.completed || false;
    if (dayTargetCompleted !== currentCompleted) {
      store.toggleDailyTarget(selectedCalendarDate);
    }
    setDayDetailModalOpen(false);
  };

  // Today's Date String
  const todayTarget = store.dailyTargets[todayStr];

  const handleSaveTodayTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayTargetInputText) return;
    store.setDailyTarget(todayStr, todayTargetInputText);
    setTodayTargetInputText("");
  };

  // Day targets performance calculations
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentMonth);

  // Scan targets this month
  const monthPrefix = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;
  const targetKeysThisMonth = Object.keys(store.dailyTargets).filter((date) => date.startsWith(monthPrefix));
  const targetsSetThisMonth = targetKeysThisMonth.length;
  const completedTargetsThisMonth = targetKeysThisMonth.filter((date) => store.dailyTargets[date]?.completed).length;
  const targetSuccessPercent = targetsSetThisMonth ? Math.round((completedTargetsThisMonth / targetsSetThisMonth) * 100) : 0;
  const monthConsistencyPercent = Math.round((completedTargetsThisMonth / daysInMonth) * 100);

  // Chart data calculations based on analytics filter
  const activityData = useMemo(() => {
    const focusHours = parseFloat((store.focusSeconds / 3600).toFixed(1));
    if (analyticsFilter === "Week") {
      const data = [
        { name: "Mon", hours: 0 },
        { name: "Tue", hours: 0 },
        { name: "Wed", hours: 0 },
        { name: "Thu", hours: 0 },
        { name: "Fri", hours: 0 },
        { name: "Sat", hours: 0 },
        { name: "Sun", hours: 0 },
      ];
      const currentDayOfWeek = new Date().getDay(); // 0 is Sunday, 1 is Monday...
      const mappedIdx = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Mon=0...Sun=6
      data[mappedIdx].hours = focusHours;
      return data;
    } else if (analyticsFilter === "Month") {
      // Monthly view: 4 weeks
      return [
        { name: "Week 1", hours: 12.5 },
        { name: "Week 2", hours: 18.0 },
        { name: "Week 3", hours: 15.2 },
        { name: "Week 4", hours: focusHours },
      ];
    } else {
      // Yearly view: 12 months (May is index 4, which is the current month)
      const data = [
        { name: "Jan", hours: 45.0 },
        { name: "Feb", hours: 50.5 },
        { name: "Mar", hours: 62.0 },
        { name: "Apr", hours: 55.4 },
        { name: "May", hours: focusHours },
        { name: "Jun", hours: 0 },
        { name: "Jul", hours: 0 },
        { name: "Aug", hours: 0 },
        { name: "Sep", hours: 0 },
        { name: "Oct", hours: 0 },
        { name: "Nov", hours: 0 },
        { name: "Dec", hours: 0 },
      ];
      return data;
    }
  }, [analyticsFilter, store.focusSeconds]);

  const mappedIndex = useMemo(() => {
    if (analyticsFilter === "Week") {
      const currentDayOfWeek = new Date().getDay();
      return currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    } else if (analyticsFilter === "Month") {
      return 3; // Week 4 is current
    } else {
      return new Date().getMonth(); // Current month index
    }
  }, [analyticsFilter]);

  // Pie chart performance data (Monthly Planner target completion)
  const performancePieData = [
    { name: "Completed Days", value: completedTargetsThisMonth || 0, color: "#10b981" },
    { name: "Remaining Days", value: Math.max(0, daysInMonth - completedTargetsThisMonth) || 1, color: "rgba(255,255,255,0.05)" },
  ];

  // Expenses calculations (filtered by current selected month)

  const activeBg = store.settings.bgImage || PRESET_WALLPAPERS[0].url;

  // ==============================
  // DASHBOARD WIDGETS RENDER VARIABLES
  // ==============================

  const focusHourTrackerWidget = (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col gap-3.5">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s working hours</span>
        <span className="text-3xl font-extrabold tracking-tight mt-1">{formatTime(store.focusSeconds)}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="w-full bg-slate-950/60 h-2.5 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${activePercent}%` }}></div>
          <div className="bg-rose-500 h-full transition-all" style={{ width: `${100 - activePercent}%` }}></div>
        </div>
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-400"></span>Active ({Math.round(activePercent)}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-rose-400"></span>Paused ({Math.round(100 - activePercent)}%)
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => store.setIsFocusRunning(!store.isFocusRunning)}
          className={`flex-1 font-bold py-5 rounded-xl text-xs gap-1.5 transition-all shadow-lg min-h-[44px] ${
            store.isFocusRunning
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
              : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20"
          }`}
        >
          {store.isFocusRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {store.isFocusRunning ? "Pause timer" : "Resume session"}
        </Button>
        <button
          type="button"
          onClick={store.resetFocusTimer}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-300 min-h-[44px]"
          title="Reset Session Timer"
        >
          <RotateCcw className="size-4.5" />
        </button>
      </div>
    </div>
  );

  const todaysGoalWidget = (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-1.5">
        <Target className="size-4 text-indigo-400 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Today&apos;s Target</span>
      </div>

      {todayTarget ? (
        <div className="flex flex-col gap-3">
          <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl text-left">
            <p className="text-xs font-black text-white leading-relaxed">&ldquo;{todayTarget.target}&rdquo;</p>
            <div className="flex items-center gap-1.5 mt-2.5 text-[9px] font-bold uppercase">
              {todayTarget.completed ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="size-3 text-emerald-400" /> Completed Target
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <AlertCircle className="size-3 text-slate-500" /> Goal Pending
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => store.toggleDailyTarget(todayStr)}
              className={`flex-1 font-bold py-4 rounded-xl text-xs min-h-[44px] ${
                todayTarget.completed
                  ? "bg-slate-800 text-slate-300 border border-white/5 hover:bg-slate-700"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {todayTarget.completed ? "Mark Pending" : "Mark Completed"}
            </Button>
            <Button
              onClick={() => handleDayClick(todayStr)}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 p-4 rounded-xl min-h-[44px]"
            >
              Edit
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveTodayTarget} className="flex flex-col gap-3">
          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
            No targets set for today. Set a milestone to keep motivated!
          </p>
          <Input
            value={todayTargetInputText}
            onChange={(e) => setTodayTargetInputText(e.target.value)}
            placeholder="Write today's focus target..."
            className="bg-slate-950/50 border-white/20 text-xs rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white font-bold placeholder:text-slate-500 transition-all min-h-[40px]"
            required
          />
          <Button type="submit" className="mt-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold py-4 text-xs shadow-lg shadow-indigo-500/20 min-h-[44px]">
            Set Today&apos;s Goal
          </Button>
        </form>
      )}
    </div>
  );

  const todaysTasksWidget = (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Agenda</span>
          <span className="text-xs font-bold text-slate-500 mt-0.5">Checklist progress & status actions</span>
        </div>
        <button
          type="button"
          onClick={() => setTaskModalOpen(true)}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 min-h-[32px] px-2"
        >
          <Plus className="size-3" /> Quick Add
        </button>
      </div>

      {/* Daily Progress summary row */}
      {todaysTasks.length > 0 && (
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 flex flex-col gap-2 text-left">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
            <span>Progress: {todaysProgress.completed} / {todaysProgress.total} Done</span>
            <span className={todaysProgress.rate === 100 ? "text-emerald-400" : "text-indigo-400"}>
              {todaysProgress.rate}%
            </span>
          </div>
          <div className="w-full bg-slate-950/60 h-2 rounded-full overflow-hidden flex border border-white/5">
            <div
              className={`h-full transition-all duration-300 ${todaysProgress.rate === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
              style={{ width: `${todaysProgress.rate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-wider mt-0.5">
            <span className="text-slate-400">📝 Pending: {todaysProgress.pending}</span>
            <span className="text-emerald-400">✓ Completed: {todaysProgress.completed}</span>
            {todaysProgress.overdue > 0 && (
              <span className="text-rose-400 animate-pulse">⚠️ Overdue: {todaysProgress.overdue}</span>
            )}
          </div>
        </div>
      )}

      {/* Task list container */}
      <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
        {todaysTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-semibold text-[10px] uppercase flex flex-col items-center gap-2">
            <span>🎉 No tasks scheduled for today.</span>
            <span className="text-[9px] text-slate-600 lowercase font-normal italic">create tasks in life grid planner...</span>
          </div>
        ) : (
          todaysTasks.map((task) => {
            const isOverdue = isTaskOverdue(task, nowMinutes, todayStr);
            const statusLabel = task.status === 'completed' || task.completed
              ? 'Completed'
              : task.status === 'skipped'
              ? 'Skipped'
              : task.status === 'in_progress'
              ? 'In Progress'
              : isOverdue
              ? 'Overdue'
              : 'Pending';

            const statusColors = {
              Completed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              Skipped: "bg-slate-500/10 border-slate-500/20 text-slate-400",
              'In Progress': "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
              Overdue: "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse",
              Pending: "bg-slate-500/10 border-white/5 text-slate-300"
            }[statusLabel];

            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  task.status === 'completed' || task.completed
                    ? "bg-slate-950/20 border-emerald-500/20 opacity-80"
                    : task.status === 'in_progress'
                    ? "bg-indigo-500/5 border-indigo-500/30"
                    : isOverdue
                    ? "bg-rose-500/5 border-rose-500/30"
                    : "bg-slate-950/40 border-white/5"
                }`}
              >
                {/* Header Row: Category Tag + Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                    {getTaskCategory(task.title)}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${statusColors}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Task Title + Details Row */}
                <div>
                  <h4 className={`text-xs font-black leading-snug ${
                    task.completed || task.status === 'completed' ? "text-slate-500 line-through" : "text-white"
                  }`}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[9px] font-extrabold uppercase text-slate-400 mt-1.5">
                    {task.startTime && (
                      <span className="flex items-center gap-0.5 text-indigo-300">
                        ⏰ {task.startTime}
                      </span>
                    )}
                    {task.duration && (
                      <span className="flex items-center gap-0.5 text-slate-500">
                        ⏳ {task.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-end gap-1.5 mt-1 pt-2 border-t border-white/5">
                  {task.taskId !== "legacy" && (
                    <>
                      {/* Undo / Reset Button (only shown for skip/completed) */}
                      {(task.status === 'completed' || task.status === 'skipped') ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'pending', completed: false })}
                          className="h-7 text-[9px] font-bold text-slate-400 hover:text-white px-2.5 rounded-lg hover:bg-white/5"
                        >
                          Reset
                        </Button>
                      ) : (
                        <>
                          {/* Skip Action */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'skipped' })}
                            className="h-7 text-[9px] font-bold text-slate-500 hover:text-rose-300 px-2 rounded-lg hover:bg-rose-500/5"
                          >
                            Skip
                          </Button>

                          {/* Toggle In Progress */}
                          {task.status !== 'in_progress' ? (
                            <Button
                              size="sm"
                              onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'in_progress' })}
                              className="h-7 text-[9px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2 rounded-lg"
                            >
                              Start
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'pending' })}
                              className="h-7 text-[9px] font-bold bg-amber-600 hover:bg-amber-500 text-white px-2 rounded-lg"
                            >
                              Pause
                            </Button>
                          )}

                          {/* Complete Action */}
                          <Button
                            size="sm"
                            onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'completed', completed: true })}
                            className="h-7 text-[9px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 rounded-lg"
                          >
                            Complete
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  {task.taskId === "legacy" && (
                    <Button
                      size="sm"
                      onClick={() => store.toggleDailyTarget(todayStr)}
                      className={`h-7 text-[9px] font-bold px-3 rounded-lg ${
                        task.completed
                          ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      {task.completed ? "Undo Goal" : "Complete Goal"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const focusAnalyticsWidget = (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-lg flex flex-col gap-4 h-full min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity</span>
          <h3 className="text-lg font-black tracking-tight text-white mt-1">Focus Analytics</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            You logged {activityData.reduce((acc, c) => acc + c.hours, 0).toFixed(1)} hours this {analyticsFilter.toLowerCase()}. Maintain study consistency!
          </p>
        </div>

        <div className="flex bg-slate-950/60 p-0.5 rounded-md border border-white/5 self-start mr-2 mt-1">
          {(["Week", "Month", "Year"] as const).map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setAnalyticsFilter(filter)}
              className={`px-3.5 py-2 rounded-md text-[10px] font-black tracking-wider uppercase transition-all min-h-[36px] ${
                filter === analyticsFilter ? "bg-white text-slate-950" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[260px] pt-4 flex flex-col justify-center overflow-hidden">
        {hasTelemetryData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "11px",
                  color: "#fff",
                  fontWeight: "600",
                }}
                labelClassName="text-indigo-400 font-bold"
                cursor={{ fill: "rgba(255, 255, 255, 0.03)", radius: 4 }}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                {activityData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      index === mappedIndex
                        ? "url(#blueGrad)"
                        : "rgba(99, 102, 241, 0.45)"
                    }
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl bg-white/2 min-h-[220px]">
            <AlertCircle className="size-8 text-indigo-400/60 mb-2 animate-pulse" />
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Awaiting Telemetry Data</h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-1 max-w-[200px] leading-relaxed">
              Set targets or log transactions for at least 3 days to unlock analytics graphs.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-1">
          <TrendingUp className="size-4 text-indigo-400" />
          <span>Today focus indicator</span>
        </div>
        <span>Weekly Target: 40h</span>
      </div>
    </div>
  );

  const plannerConsistencyWidget = (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col gap-4 text-center items-center justify-center">
      <div className="text-left w-full">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Planner Consistency</span>
      </div>

      <div className="relative size-36 flex items-center justify-center">
        {hasTelemetryData ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performancePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {performancePieData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-white">{monthConsistencyPercent}%</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase">Consistency</span>
            </div>
          </>
        ) : (
          <div className="size-32 rounded-full border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-2 bg-white/2">
            <span className="text-[8px] text-slate-500 font-black uppercase">Awaiting Telemetry</span>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 font-semibold mb-2">
        {completedTargetsThisMonth} completed / {daysInMonth} days this month
      </div>

      <div className="w-full space-y-2.5 text-left text-[10px] font-bold uppercase text-slate-400">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Goal Success Rate</span>
            <span className="text-emerald-400">{targetSuccessPercent}%</span>
          </div>
          <Progress value={targetSuccessPercent} className="w-full flex-col gap-0 bg-transparent">
            <ProgressTrack className="bg-white/5 h-2">
              <ProgressIndicator className="bg-emerald-500" />
            </ProgressTrack>
          </Progress>
          <span className="text-[8px] text-slate-500 leading-none">
            Completed {completedTargetsThisMonth} out of {targetsSetThisMonth} targets set.
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Month Coverage</span>
            <span className="text-indigo-400">{Math.round((targetsSetThisMonth / daysInMonth) * 100)}%</span>
          </div>
          <Progress value={(targetsSetThisMonth / daysInMonth) * 100} className="w-full flex-col gap-0 bg-transparent">
            <ProgressTrack className="bg-white/5 h-2">
              <ProgressIndicator className="bg-indigo-500" />
            </ProgressTrack>
          </Progress>
          <span className="text-[8px] text-slate-500 leading-none">
            Targets set for {targetsSetThisMonth} out of {daysInMonth} calendar days.
          </span>
        </div>
      </div>
    </div>
  );

  const byProjectWidget = (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-4 shadow-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">By project</span>
        <button
          type="button"
          onClick={() => setProjectModalOpen(true)}
          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 min-h-[44px] px-2"
        >
          <Plus className="size-3" /> New
        </button>
      </div>

      <div className="space-y-1.5 max-h-[130px] overflow-y-auto pr-1">
        {store.projects.length === 0 ? (
          <div className="text-center py-3 text-slate-500 font-semibold text-[10px] uppercase">No active projects</div>
        ) : (
          store.projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-400"></div>
                <div className="text-left">
                  <h4 className="text-xs font-bold leading-tight">{project.name}</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  store.deleteProject(project.id);
                }}
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-white/5 rounded text-red-400 transition-all min-h-[32px]"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (!hasHydrated || !store.settings.isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="size-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative flex flex-col transition-all duration-1000 bg-cover bg-center font-sans overflow-x-hidden text-slate-100 ${
        isEngineeringMode ? "engineering-cockpit" : ""
      }`}
      style={{
        backgroundImage: isEngineeringMode ? "none" : `url(${activeBg})`,
        backgroundColor: isEngineeringMode ? "#000000" : undefined,
      }}
    >
      {/* HUD Scan Line Effect when in Engineering Mode */}
      {isEngineeringMode && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.4)] pointer-events-none animate-scan z-20"></div>
      )}

      {/* Dynamic Overlay & Blur */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${store.settings.bgImage || PRESET_WALLPAPERS[0].url})`,
          opacity: 1,
          filter: `blur(${store.settings.bgBlur}px) brightness(${100 - store.settings.bgOpacity}%)`,
        }}
      />

      {/* Focus Mode Overlay */}
      <FocusMode />

      {/* Main Grid Wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 flex flex-col flex-1 gap-4">
        
        {/* HEADER */}
        {/* Desktop Header Layout */}
        <header className="hidden lg:flex w-full rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 px-4 py-2.5 items-center justify-between shadow-lg gap-4">
          
          {/* Left Section: Logo + Nav */}
          <div className="flex items-center flex-1 min-w-0 xl:gap-8 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <Image src="/logo.png" alt="LifeOS Logo" width={32} height={32} className="rounded-lg object-contain drop-shadow-md" />
              <span className="font-extrabold text-xl tracking-tight text-indigo-400 hidden sm:block">
                LifeOS
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto no-scrollbar pr-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                { id: "tasks", label: "Daily Tasks", icon: CheckCircle2 },
                { id: "planner", label: "Planner", icon: CalendarIcon },
                { id: "grid", label: "Life Grid", icon: Layers },
                { id: "expenses", label: "Expenses", icon: Wallet },
                { id: "intelligence", label: "Life Engine", icon: Brain },
                { id: "journey", label: "Journey Replay", icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-2 rounded-xl font-bold text-xs whitespace-nowrap shrink-0 transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-white/10 text-white shadow-sm backdrop-blur-md border border-white/10"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Section: Dev Console, Utils, Profile */}
          <div className="flex items-center justify-end shrink-0 xl:gap-6 gap-3">
            
            {/* Dev Console Button */}
            <button type="button"
              onClick={() => setActiveTab("engineering")}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${
                activeTab === "engineering"
                  ? "bg-white/10 text-white shadow-sm backdrop-blur-md border border-white/10"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
              }`}
            >
              <Terminal className="size-3.5" />
              <span>Dev Console</span>
            </button>
            
            {/* Utilities (ENG Toggle & Settings) */}
            <div className="flex items-center gap-3 xl:gap-4 bg-slate-950/20 px-3 py-2 rounded-2xl shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isEngineeringMode ? "text-emerald-400" : "text-slate-500"}`}>
                  Eng
                </span>
                <button type="button"
                  aria-label="Toggle Engineering Mode"
                  onClick={() => {
                    setIsEngineeringMode(!isEngineeringMode);
                    if (!isEngineeringMode) {
                      setActiveTab("engineering");
                    }
                  }}
                  className={`w-9 h-5 shrink-0 rounded-full transition-all duration-300 relative border flex items-center p-0.5 cursor-pointer ${
                    isEngineeringMode
                      ? "bg-emerald-950/60 border-emerald-500/50"
                      : "bg-slate-900/60 border-white/10"
                  }`}
                  title="Toggle Engineering Monochrome Terminal HUD"
                >
                  <div
                    className={`size-3.5 rounded-full transition-all duration-300 ${
                      isEngineeringMode ? "bg-emerald-400 translate-x-4 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-500"
                    }`}
                  />
                </button>
              </div>
              
              <div className="w-px h-4 bg-white/5 shrink-0"></div>
              
              <button type="button"
                onClick={() => setIsCustomizing(true)}
                className="shrink-0 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Customize Wallpaper & Theme"
              >
                <Sliders className="size-4" />
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 bg-slate-950/30 pl-3 xl:pl-4 pr-1.5 py-1.5 rounded-2xl border border-white/5 hover:bg-slate-950/50 transition-all cursor-pointer group shrink-0 max-w-[140px] xl:max-w-[200px]">
              <div className="text-right hidden xl:block overflow-hidden min-w-0">
                <p className="text-xs font-bold leading-none mb-1 text-slate-200 group-hover:text-white transition-colors truncate">{store.settings.name}</p>
                <p className="text-[9px] text-slate-500 font-bold tracking-wide uppercase leading-none truncate">{store.settings.email.split('@')[0]}</p>
              </div>
              <div className="flex items-center shrink-0">
                <div className="size-8 shrink-0 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-black text-xs text-indigo-200 shadow-inner">
                  {store.settings.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <button type="button"
                  onClick={() => {
                    store.logout();
                    push("/login");
                  }}
                  className="opacity-0 w-0 overflow-hidden group-hover:w-8 group-hover:opacity-100 group-hover:ml-2 h-8 shrink-0 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-400 transition-all duration-300 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header Layout */}
        <header className="lg:hidden flex w-full rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 px-4 py-3 items-center justify-between shadow-lg z-30">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="LifeOS Logo" width={28} height={28} className="rounded-lg object-contain" />
            <span className="font-extrabold text-lg tracking-tight text-indigo-400">
              LifeOS
            </span>
          </div>

          <button type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {/* Mobile Slide-out Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl pt-24 px-6 pb-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                  System Navigation
                </span>
                
                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {[
                    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
                    { id: "tasks", label: "Daily Tasks", icon: CheckCircle2 },
                    { id: "planner", label: "Planner", icon: CalendarIcon },
                    { id: "grid", label: "Life Grid", icon: Layers },
                    { id: "expenses", label: "Expenses", icon: Wallet },
                    { id: "intelligence", label: "Life Engine", icon: Brain },
                    { id: "journey", label: "Journey Replay", icon: Sparkles },
                    { id: "engineering", label: "Dev Console", icon: Terminal },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button type="button"
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
                          activeTab === tab.id
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10 border border-indigo-500/20"
                            : "text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent"
                        }`}
                      >
                        <Icon className="size-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>

                {/* System Controls */}
                <div className="flex flex-col gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl mt-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                    System Controls
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Engineering Mode</span>
                    <button type="button"
                      aria-label="Toggle Engineering Mode"
                      onClick={() => {
                        setIsEngineeringMode(!isEngineeringMode);
                        if (!isEngineeringMode) {
                          setActiveTab("engineering");
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-10 h-6 shrink-0 rounded-full transition-all duration-300 relative border flex items-center p-0.5 cursor-pointer ${
                        isEngineeringMode
                          ? "bg-emerald-950/60 border-emerald-500/50"
                          : "bg-slate-900/60 border-white/10"
                      }`}
                    >
                      <div
                        className={`size-4.5 rounded-full transition-all duration-300 ${
                          isEngineeringMode ? "bg-emerald-400 translate-x-4 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-slate-500"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="h-px bg-white/5"></div>
                  <button type="button"
                    onClick={() => {
                      setIsCustomizing(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                  >
                    <span>Customize Wallpaper & Theme</span>
                    <Sliders className="size-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Mobile User Profile Section */}
              <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl mt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-black text-sm text-indigo-200 shadow-inner">
                    {store.settings.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="text-left overflow-hidden max-w-[150px]">
                    <p className="text-xs font-bold leading-none mb-1 text-slate-200 truncate">{store.settings.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{store.settings.email}</p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => {
                    store.logout();
                    push("/login");
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY CONTENTS */}
        <div className="flex-1 flex flex-col gap-4">

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="w-full flex flex-col gap-4">
              {/* Overdue alert banner if there are overdue tasks */}
              {overdueTasks.length > 0 && (
                <div className="w-full p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 backdrop-blur-xl flex items-center justify-between shadow-lg shadow-rose-950/20 animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="size-5 text-rose-400" />
                    <div className="text-left">
                      <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider">Needs Attention</h4>
                      <p className="text-[10px] text-rose-400 font-semibold mt-0.5">
                        You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""} from today or past days.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {overdueTasks.slice(0, 1).map((task) => (
                      <Button
                        key={task.id}
                        size="sm"
                        onClick={() => {
                          if (task.taskId === "legacy") {
                            store.toggleDailyTarget(task.date);
                          } else {
                            store.updateDayTaskInstance(task.date, task.id, { status: "completed", completed: true });
                          }
                        }}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] h-8 rounded-lg px-2.5"
                      >
                        Complete: {task.title.substring(0, 15)}...
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Reminder Banner */}
              {nextTask && (
                <div className="w-full p-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg shadow-indigo-950/20 gap-4">
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="size-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
                      🔔
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300 flex items-center gap-1.5">
                        Next Task <span className="text-white/40">•</span> <span className="text-indigo-400 font-black">{nextTaskCountdown}</span>
                      </span>
                      <h3 className="text-sm font-black text-white mt-0.5">{nextTask.title}</h3>
                      <div className="flex gap-2 text-[9px] font-bold text-slate-400 uppercase mt-1">
                        <span>⏰ {nextTaskTimeRange}</span>
                        {nextTask.duration && <span>⏳ {nextTask.duration}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      onClick={() => store.updateDayTaskInstance(todayStr, nextTask.id, { status: "in_progress" })}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] h-8 rounded-lg px-3.5"
                    >
                      Start Task
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => store.updateDayTaskInstance(todayStr, nextTask.id, { status: "completed", completed: true })}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] h-8 rounded-lg px-3"
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              )}

              {/* Pristine Empty State Banner */}
              {todaysTasks.length === 0 && (
                <div className="w-full p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-xl flex flex-col justify-center text-left">
                  <h3 className="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="size-4 text-indigo-400" /> Welcome to your Cockpit
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    Your LifeOS dashboard shows your active schedules. To plan tasks, head to the <button type="button" onClick={() => setActiveTab("grid")} className="text-indigo-400 underline font-bold">Life Grid Console</button> or add one below!
                  </p>
                </div>
              )}

              {/* MOBILE & TABLET LAYOUT (Vertical Stack) */}
              <div className="flex lg:hidden flex-col gap-6 w-full">
                {todaysGoalWidget}
                {focusAnalyticsWidget}
                {plannerConsistencyWidget}
                {byProjectWidget}
                {todaysTasksWidget}
                {focusHourTrackerWidget}
              </div>

              {/* DESKTOP LAYOUT (3 Columns) */}
              <div className="hidden lg:grid grid-cols-12 gap-4 items-start w-full">
                {/* Left Column (Span 3) */}
                <div className="col-span-3 flex flex-col gap-4">
                  {focusHourTrackerWidget}
                  {todaysGoalWidget}
                  {todaysTasksWidget}
                </div>

                {/* Center Column (Span 6) */}
                <div className="col-span-6 flex flex-col gap-4">
                  {focusAnalyticsWidget}
                </div>

                {/* Right Column (Span 3) */}
                <div className="col-span-3 flex flex-col gap-4">
                  {plannerConsistencyWidget}
                  {byProjectWidget}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS & HABITS */}
          {activeTab === "tasks" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
              {/* Tasks Workspace (Span 8) */}
              <div className="lg:col-span-8 flex flex-col gap-4 h-full">
                <DailyTaskSystem />
              </div>

              {/* Habits Workspace (Span 4) */}
              <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col gap-4 min-h-[400px] w-full">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-white">Daily Habits</h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Toggle checkboxes to build streaks</p>
                  </div>
                  <button type="button"
                    onClick={() => setHabitModalOpen(true)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
                  >
                    <Plus className="size-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {store.habits.length === 0 ? (
                    <div className="text-center py-5 text-slate-500 font-semibold text-[10px] uppercase">No habits set. Initiate streaks!</div>
                  ) : (
                    store.habits.map((habit) => {
                      const isCompletedToday = habit.completedDates.includes(todayStr);
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <button type="button"
                              onClick={() => store.toggleHabit(habit.id, todayStr)}
                              className={`size-4 rounded border-2 flex items-center justify-center transition-all ${
                                isCompletedToday
                                  ? "bg-emerald-500 border-emerald-400 text-white"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                            >
                              {isCompletedToday && "✓"}
                            </button>
                            <div className="text-left">
                              <h4 className="text-xs font-bold text-white">{habit.name}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-emerald-400 flex items-center gap-0.5">
                              🔥 {habit.streak}
                            </span>
                            <button type="button"
                              onClick={() => store.deleteHabit(habit.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded text-red-400 transition-all"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANNER */}
          {activeTab === "planner" && (
            <div className="w-full">
              <MonthlyPlanner />
            </div>
          )}

          {/* TAB 3: LIFE GRID */}
          {activeTab === "grid" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg flex flex-col gap-4 min-h-[400px] w-full">
              <LifeGrid onOpenDayDetails={handleDayClick} />
            </div>
          )}

          {/* TAB 4: EXPENSES */}
          {activeTab === "expenses" && (
            <div className="w-full">
              <FinancialOS />
            </div>
          )}

          {/* TAB 5: JOURNEY REPLAY */}
          {activeTab === "journey" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg min-h-[400px] w-full">
              <JourneyReplay />
            </div>
          )}

          {/* TAB 6: ENGINEERING MODE */}
          {activeTab === "engineering" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-5 shadow-lg min-h-[400px] w-full">
              <EngineeringMode />
            </div>
          )}

          {/* TAB 7: INTELLIGENCE (LIFE ENGINE) */}
          {activeTab === "intelligence" && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-lg min-h-[500px] w-full">
              <LifeEngine />
            </div>
          )}

        </div>

      </div>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto p-6 text-center text-slate-500 text-[10px] font-bold uppercase tracking-wide">
        &copy; {new Date().getFullYear()} LifeOS - Day-by-Day performance tracker
      </footer>

      {/* DIALOG 1: BACKGROUND CUSTOMIZER */}
      <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900/95 border border-white/10 text-white rounded-2xl backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight">Customize Dashboard Theme</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Personalize background layouts to maximize motivation and screen accessibility.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            
            {/* Input URL */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Background Image URL</Label>
              <Input
                value={bgInput}
                onChange={(e) => setBgInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="bg-white/5 border-white/10 rounded-xl text-slate-200"
              />
            </div>

            {/* Local Upload */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Or Upload Image File</Label>
              <div className="flex items-center justify-center border border-dashed border-white/15 rounded-xl p-4 bg-white/3 hover:bg-white/5 cursor-pointer relative transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLocalBgUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Upload className="size-4 text-indigo-400" />
                  <span>Choose local file...</span>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="flex flex-col gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Preset Wallpaper</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_WALLPAPERS.map((wp) => (
                  <button type="button"
                    key={wp.title}
                    onClick={() => setBgInput(wp.url)}
                    className={`aspect-video rounded-lg bg-cover bg-center border transition-all ${
                      bgInput === wp.url ? "border-indigo-400 scale-105 shadow-md shadow-indigo-950/40" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundImage: `url(${wp.url})` }}
                    title={wp.title}
                  ></button>
                ))}
              </div>
            </div>

            {/* Sliders for Blur and Dark Tint */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Background Blur</span>
                  <span>{blurVal}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blurVal}
                  onChange={(e) => setBlurVal(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Dark Overlay Tint</span>
                  <span>{opacityVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacityVal}
                  onChange={(e) => setOpacityVal(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-950"
                />
              </div>
            </div>

          </div>

          <div className="flex gap-2.5 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsCustomizing(false)}
              className="flex-1 rounded-xl font-bold py-5 border-white/10 bg-transparent text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBgSave}
              className="flex-1 rounded-xl font-bold py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
            >
              Save Customizer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: ADD TASK */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Add New Task to Today</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Task Title</Label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Finish LifeOS implementation Plan..."
                className="bg-white/5 border-white/10 rounded-xl"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Duration (Optional)</Label>
              <Input
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(e.target.value)}
                placeholder="e.g. 2 hours, 30 minutes"
                className="bg-white/5 border-white/10 rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Start Time (Optional)</Label>
              <Input
                value={newTaskStartTime}
                onChange={(e) => setNewTaskStartTime(e.target.value)}
                placeholder="e.g. 08:00 AM, 2:00 PM"
                className="bg-white/5 border-white/10 rounded-xl"
              />
            </div>

            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold py-5 mt-2">
              Save Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: ADD LEDGER ITEM */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Add Financial Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="flex flex-col gap-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Transaction Type</Label>
                <Select
                  value={newExpenseType}
                  onValueChange={(val) => setNewExpenseType((val as "income" | "expense") || "expense")}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="expense">Expense (-)</SelectItem>
                    <SelectItem value="income">Income (+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] font-bold uppercase text-slate-400">Amount ($)</Label>
                <Input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="45.00"
                  className="bg-white/5 border-white/10 rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label>
              <Select value={newExpenseCategory} onValueChange={(val) => setNewExpenseCategory(val || "Food")}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {["Food", "Travel", "Shopping", "Education", "Bills", "Entertainment", "Salary", "Freelance", "Investment", "Other"].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Description</Label>
              <Input
                value={newExpenseDesc}
                onChange={(e) => setNewExpenseDesc(e.target.value)}
                placeholder="Dinner with team, office supplies, etc."
                className="bg-white/5 border-white/10 rounded-xl"
              />
            </div>
            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold py-5 mt-2">
              Add to Ledger
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: ADD HABIT */}
      <Dialog open={habitModalOpen} onOpenChange={setHabitModalOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Register Daily Habit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddHabit} className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Habit Name</Label>
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Drink 3L Water, 30m Coding, gym session..."
                className="bg-white/5 border-white/10 rounded-xl"
                required
              />
            </div>
            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold py-5 mt-2">
              Save Habit
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 5: ADD PROJECT */}
      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Create Project Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProject} className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Project Name</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="LifeOS UI/UX design, Rust compiler study..."
                className="bg-white/5 border-white/10 rounded-xl"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Category Tag</Label>
              <Select value={newProjectCategory} onValueChange={(val) => setNewProjectCategory(val || "Design")}>
                <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {["Design", "Coding", "Meeting", "Writing", "Learning"].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold py-5 mt-2">
              Initialize Project Folder
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 6: DAY DETAIL MODAL (Planner of each day + Target set/completed logic) */}
      <Dialog open={dayDetailModalOpen} onOpenChange={setDayDetailModalOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <CalendarIcon className="size-5 text-indigo-400" />
              Planner: {selectedCalendarDate}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Set a specific focus target and log milestones for this date.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2">
            
            {/* Daily Target Section */}
            <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-950/40 border border-white/5">
              <Label className="text-[10px] font-black uppercase text-indigo-300 flex items-center gap-1.5">
                <Target className="size-3.5 text-indigo-400" />
                Daily Target Goal
              </Label>
              <Input
                value={dayTargetText}
                onChange={(e) => setDayTargetText(e.target.value)}
                placeholder="e.g. Solve 3 LeetCode, finish next page..."
                className="bg-white/5 border-white/10 text-xs rounded-xl"
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="dayTargetCompleted"
                  checked={dayTargetCompleted}
                  onChange={(e) => setDayTargetCompleted(e.target.checked)}
                  className="size-4 rounded border-white/20 text-emerald-500 focus:ring-0 bg-transparent cursor-pointer"
                />
                <Label htmlFor="dayTargetCompleted" className="text-slate-300 text-xs font-bold cursor-pointer">
                  Mark daily target as completed
                </Label>
              </div>
              <Button onClick={handleSaveDayTarget} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold py-4 text-xs mt-1">
                Save Daily Target
              </Button>
            </div>

            {/* Scheduled Events for this day */}
            <div className="flex flex-col gap-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Scheduled Milestones</Label>
              
              {/* Event list */}
              <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                {store.events.filter(e => e.date === selectedCalendarDate).length === 0 ? (
                  <div className="text-center py-4 text-slate-500 font-bold text-[10px] uppercase">No events scheduled</div>
                ) : (
                  store.events
                    .filter(e => e.date === selectedCalendarDate)
                    .map((evt) => (
                      <div
                        key={evt.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-indigo-400"></span>
                          <span className="font-bold text-slate-200">{evt.title}</span>
                          <span className="text-[8px] bg-indigo-500/25 px-1.5 py-0.5 rounded text-indigo-300 font-bold">
                            {evt.category}
                          </span>
                        </div>
                        <button type="button"
                          onClick={() => store.deleteEvent(evt.id)}
                          className="p-1 hover:bg-white/5 rounded text-red-400 transition-all"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))
                )}
              </div>

              {/* Event sub-form */}
              <form
                onSubmit={(e) => {
                  handleAddEvent(e);
                  setNewEventTitle("");
                }}
                className="flex items-center gap-2 border-t border-white/5 pt-3 mt-1"
              >
                <Input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="New event title..."
                  className="bg-white/5 border-white/10 text-xs rounded-xl flex-1"
                  required
                />
                <Select value={newEventCategory} onValueChange={(val) => setNewEventCategory(val || "Work")}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl w-[90px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white text-xs">
                    {["Work", "Study", "Personal", "Health", "Social"].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-slate-800 border border-white/10 hover:bg-slate-700 py-4 px-3 rounded-xl">
                  Add
                </Button>
              </form>
            </div>

          </div>

          <div className="flex gap-2.5 mt-3 border-t border-white/5 pt-3">
            <Button
              variant="outline"
              onClick={() => setDayDetailModalOpen(false)}
              className="w-full rounded-xl font-bold py-5 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 text-xs"
            >
              Close Planner
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
