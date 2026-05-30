"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLifeStore, DayTask } from "@/store/useLifeStore";
import { PRESET_WALLPAPERS } from "@/lib/quotes";
import LifeGrid from "@/components/LifeGrid";
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

  // Horizontal scroll states for desktop navigation
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = (element: HTMLDivElement | null) => {
    if (!element) return;
    const { scrollLeft, scrollWidth, clientWidth } = element;
    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      checkScroll(el);
    };

    el.addEventListener("scroll", handleScroll);
    checkScroll(el);

    const resizeObserver = new ResizeObserver(() => {
      checkScroll(el);
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [activeTab, hasHydrated]);

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
    return `${hrs}h ${mins}m`;
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
      // Yearly view: 12 months
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
    { name: "Completed Days", value: completedTargetsThisMonth || 0, color: "#D4AF7A" },
    { name: "Remaining Days", value: Math.max(0, daysInMonth - completedTargetsThisMonth) || 1, color: "rgba(255,255,255,0.05)" },
  ];

  // ==============================
  // DASHBOARD WIDGETS RENDER VARIABLES
  // ==============================

  const focusHourTrackerWidget = (
    <div className="rounded-3xl liquid-glass p-6 shadow-xl flex flex-col gap-4">
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E7CBA9]">Sanctuary Session</span>
        <span className="text-4xl font-extrabold tracking-tight mt-1 text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {formatTime(store.focusSeconds)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex border border-white/5">
          <div className="bg-[#D4AF7A] h-full transition-all duration-500" style={{ width: `${activePercent}%` }}></div>
          <div className="bg-white/10 h-full transition-all duration-500" style={{ width: `${100 - activePercent}%` }}></div>
        </div>
        <div className="flex justify-between text-[9px] font-bold text-white/50 uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#D4AF7A]"></span>Active ({Math.round(activePercent)}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-white/20"></span>Paused ({Math.round(100 - activePercent)}%)
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => store.setIsFocusRunning(!store.isFocusRunning)}
          className={`flex-1 font-bold py-5 rounded-full text-xs uppercase tracking-widest gap-1.5 transition-all shadow-lg min-h-[44px] ${
            store.isFocusRunning
              ? "bg-white/10 hover:bg-white/15 text-white"
              : "bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33]"
          }`}
        >
          {store.isFocusRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {store.isFocusRunning ? "Pause Session" : "Enter Flow"}
        </Button>
        <button
          type="button"
          onClick={store.resetFocusTimer}
          className="h-11 w-11 flex items-center justify-center rounded-full bg-white/5 border border-white/8 hover:bg-white/10 transition-all text-white/70 hover:text-white min-h-[44px]"
          title="Reset Session Timer"
        >
          <RotateCcw className="size-4.5" />
        </button>
      </div>
    </div>
  );

  const todaysGoalWidget = (
    <div className="rounded-3xl liquid-glass p-6 shadow-xl flex flex-col gap-6 min-h-[220px] text-left">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Target className="size-4.5 text-[#D4AF7A] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E7CBA9]">Today&apos;s Mission</span>
        </div>
        {todayTarget && (
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
            🔥 {store.habits.reduce((acc, h) => Math.max(acc, h.streak), 0)} Day Streak
          </span>
        )}
      </div>

      {todayTarget ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Primary Milestone</span>
            <p className="text-xl font-light text-white leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              &ldquo;{todayTarget.target}&rdquo;
            </p>
            <div className="flex items-center gap-1.5 mt-2.5 text-[9px] font-bold uppercase tracking-widest">
              {todayTarget.completed ? (
                <span className="text-[#D4AF7A] flex items-center gap-1">
                  <Check className="size-3 text-[#D4AF7A]" /> Completed
                </span>
              ) : (
                <span className="text-white/40 flex items-center gap-1">
                  <AlertCircle className="size-3 text-white/30" /> Active
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => store.toggleDailyTarget(todayStr)}
              className={`flex-1 font-bold py-4 rounded-full text-xs uppercase tracking-widest min-h-[44px] ${
                todayTarget.completed
                  ? "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  : "bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33]"
              }`}
            >
              {todayTarget.completed ? "Reopen Target" : "Complete Mission"}
            </Button>
            <Button
              onClick={() => handleDayClick(todayStr)}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-white p-4 rounded-full min-h-[44px] text-xs font-bold uppercase tracking-widest"
            >
              Edit
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveTodayTarget} className="flex flex-col gap-4">
          <p className="text-xs text-white/50 font-light leading-relaxed">
            No primary milestone defined for today. Set a trajectory to maintain momentum.
          </p>
          <Input
            value={todayTargetInputText}
            onChange={(e) => setTodayTargetInputText(e.target.value)}
            placeholder="Define today's focus target..."
            className="bg-white/3 border-white/10 text-xs rounded-xl focus:border-[#D4AF7A] text-white placeholder:text-white/30 transition-all min-h-[44px]"
            required
          />
          <Button type="submit" className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] rounded-full font-bold py-4.5 text-xs uppercase tracking-widest shadow-lg min-h-[44px]">
            Set Mission
          </Button>
        </form>
      )}
    </div>
  );

  const todaysTasksWidget = (
    <div className="rounded-3xl liquid-glass p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E7CBA9]">Rituals Checklist</span>
          <span className="text-xs font-bold text-white/40 mt-0.5">Today&apos;s schedule actions</span>
        </div>
        <button
          type="button"
          onClick={() => setTaskModalOpen(true)}
          className="text-[10px] font-bold text-[#D4AF7A] hover:text-white flex items-center gap-1 min-h-[32px] px-2 cursor-pointer"
        >
          <Plus className="size-3" /> Quick Add
        </button>
      </div>

      {/* Daily Progress summary row */}
      {todaysTasks.length > 0 && (
        <div className="bg-white/2 border border-white/5 rounded-2xl p-3 flex flex-col gap-2 text-left">
          <div className="flex justify-between items-center text-[10px] font-bold text-white/70">
            <span>Completed: {todaysProgress.completed} / {todaysProgress.total}</span>
            <span className={todaysProgress.rate === 100 ? "text-[#D4AF7A]" : "text-white"}>
              {todaysProgress.rate}%
            </span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex border border-white/5">
            <div
              className={`h-full transition-all duration-300 ${todaysProgress.rate === 100 ? "bg-[#D4AF7A]" : "bg-white/50"}`}
              style={{ width: `${todaysProgress.rate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
            <span>Pending: {todaysProgress.pending}</span>
            <span>Completed: {todaysProgress.completed}</span>
            {todaysProgress.overdue > 0 && (
              <span className="text-rose-400 animate-pulse">Overdue: {todaysProgress.overdue}</span>
            )}
          </div>
        </div>
      )}

      {/* Task list container */}
      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
        {todaysTasks.length === 0 ? (
          <div className="text-center py-8 text-white/30 font-semibold text-[10px] uppercase tracking-widest flex flex-col items-center gap-2">
            <span>🎉 No tasks scheduled for today.</span>
            <span className="text-[9px] text-white/20 lowercase font-normal italic">schedule tasks in life architecture...</span>
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
              Skipped: "bg-white/5 border-white/10 text-white/40",
              'In Progress': "bg-[#D4AF7A]/10 border-[#D4AF7A]/20 text-[#D4AF7A]",
              Overdue: "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse",
              Pending: "bg-white/5 border-white/5 text-white/60"
            }[statusLabel];

            return (
              <div
                key={task.id}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                  task.status === 'completed' || task.completed
                    ? "bg-white/2 border-white/5 opacity-60"
                    : task.status === 'in_progress'
                    ? "bg-[#D4AF7A]/5 border-[#D4AF7A]/20"
                    : isOverdue
                    ? "bg-rose-500/5 border-rose-500/25"
                    : "bg-white/3 border-white/5"
                }`}
              >
                {/* Header Row: Category Tag + Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-md bg-white/5 text-white/50 tracking-wider">
                    {getTaskCategory(task.title)}
                  </span>
                  <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${statusColors}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Task Title + Details Row */}
                <div>
                  <h4 className={`text-xs font-semibold leading-snug ${
                    task.completed || task.status === 'completed' ? "text-white/40 line-through font-light" : "text-white"
                  }`}>
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap gap-2 text-[8px] font-bold uppercase tracking-widest text-white/40 mt-1">
                    {task.startTime && (
                      <span className="flex items-center gap-0.5 text-[#D4AF7A]">
                        ⏰ {task.startTime}
                      </span>
                    )}
                    {task.duration && (
                      <span className="flex items-center gap-0.5">
                        ⏳ {task.duration}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-end gap-1.5 mt-1 pt-2 border-t border-white/5">
                  {task.taskId !== "legacy" && (
                    <>
                      {(task.status === 'completed' || task.status === 'skipped') ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'pending', completed: false })}
                          className="h-7 text-[8px] font-bold uppercase tracking-widest text-white/40 hover:text-white px-2.5 rounded-full hover:bg-white/5"
                        >
                          Reset
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'skipped' })}
                            className="h-7 text-[8px] font-bold uppercase tracking-widest text-white/30 hover:text-rose-300 px-2 rounded-full hover:bg-rose-500/5"
                          >
                            Skip
                          </Button>

                          {task.status !== 'in_progress' ? (
                            <Button
                              size="sm"
                              onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'in_progress' })}
                              className="h-7 text-[8px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white px-3 rounded-full border border-white/10"
                            >
                              Start
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'pending' })}
                              className="h-7 text-[8px] font-bold uppercase tracking-widest bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 px-3 rounded-full border border-amber-500/20"
                            >
                              Pause
                            </Button>
                          )}

                          <Button
                            size="sm"
                            onClick={() => store.updateDayTaskInstance(todayStr, task.id, { status: 'completed', completed: true })}
                            className="h-7 text-[8px] font-bold uppercase tracking-widest bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] px-3.5 rounded-full"
                          >
                            Done
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  {task.taskId === "legacy" && (
                    <Button
                      size="sm"
                      onClick={() => store.toggleDailyTarget(todayStr)}
                      className={`h-7 text-[8px] font-bold uppercase tracking-widest px-3 rounded-full ${
                        task.completed
                          ? "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10"
                          : "bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33]"
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
    <div className="rounded-3xl liquid-glass p-6 shadow-xl flex flex-col gap-6 h-full min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-left">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E7CBA9]">Flow Metrics</span>
          <h3 className="text-2xl font-light tracking-tight text-white mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Focus Analytics</h3>
          <p className="text-xs text-white/50 font-normal mt-1 leading-relaxed">
            You logged <span className="text-[#D4AF7A] font-bold">{activityData.reduce((acc, c) => acc + c.hours, 0).toFixed(1)}h</span> of deep focus this {analyticsFilter.toLowerCase()}.
          </p>
        </div>

        <div className="flex bg-white/5 p-0.5 rounded-full border border-white/5 self-start mr-2 mt-1">
          {(["Week", "Month", "Year"] as const).map((filter) => (
            <button
              type="button"
              key={filter}
              onClick={() => setAnalyticsFilter(filter)}
              className={`px-4 py-2 rounded-full text-[9px] font-black tracking-wider uppercase transition-all min-h-[32px] cursor-pointer ${
                filter === analyticsFilter ? "bg-[#D4AF7A] text-[#071B33]" : "text-white/60 hover:text-white"
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
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#071B33",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "11px",
                  color: "#fff",
                  fontWeight: "600",
                }}
                labelClassName="text-[#D4AF7A] font-bold"
                cursor={{ fill: "rgba(255, 255, 255, 0.02)", radius: 12 }}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                {activityData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={
                      index === mappedIndex
                        ? "url(#goldGrad)"
                        : "rgba(212, 175, 122, 0.25)"
                    }
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF7A" />
                  <stop offset="100%" stopColor="#E7CBA9" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/2 min-h-[220px]">
            <AlertCircle className="size-8 text-[#D4AF7A] mb-2 animate-pulse" />
            <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Awaiting Telemetry Data</h4>
            <p className="text-[10px] text-white/50 font-normal mt-1 max-w-[200px] leading-relaxed">
              Log focus session time to view analytics trends.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold text-white/40 uppercase tracking-widest">
        <div className="flex items-center gap-1.5 text-[#D4AF7A]">
          <TrendingUp className="size-4" />
          <span>Telemetry Ok</span>
        </div>
        <span>Goal: 40h</span>
      </div>
    </div>
  );

  const plannerConsistencyWidget = (
    <div className="rounded-3xl liquid-glass p-6 shadow-xl flex flex-col gap-6 text-center items-center justify-center">
      <div className="text-left w-full border-b border-white/5 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E7CBA9]">Sanctuary Consistency</span>
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
              <span className="text-2xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{monthConsistencyPercent}%</span>
              <span className="text-[8px] text-white/40 font-bold uppercase tracking-widest">Rate</span>
            </div>
          </>
        ) : (
          <div className="size-32 rounded-full border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-2 bg-white/2">
            <span className="text-[8px] text-white/30 font-black uppercase">Awaiting Data</span>
          </div>
        )}
      </div>

      <div className="text-xs text-white/50 font-normal">
        {completedTargetsThisMonth} targets met / {daysInMonth} days this month
      </div>

      <div className="w-full space-y-4 text-left text-[9px] font-bold uppercase tracking-widest text-white/50">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Goal Success Rate</span>
            <span className="text-[#D4AF7A] font-extrabold">{targetSuccessPercent}%</span>
          </div>
          <Progress value={targetSuccessPercent} className="w-full flex-col gap-0 bg-transparent">
            <ProgressTrack className="bg-white/5 h-1.5">
              <ProgressIndicator className="bg-[#D4AF7A]" />
            </ProgressTrack>
          </Progress>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span>Month Coverage</span>
            <span className="text-white/80">{Math.round((targetsSetThisMonth / daysInMonth) * 100)}%</span>
          </div>
          <Progress value={(targetsSetThisMonth / daysInMonth) * 100} className="w-full flex-col gap-0 bg-transparent">
            <ProgressTrack className="bg-white/5 h-1.5">
              <ProgressIndicator className="bg-white/35" />
            </ProgressTrack>
          </Progress>
        </div>
      </div>
    </div>
  );

  const byProjectWidget = (
    <div className="rounded-3xl liquid-glass p-5 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E7CBA9]">Portfolio</span>
        <button
          type="button"
          onClick={() => setProjectModalOpen(true)}
          className="text-[10px] font-bold text-[#D4AF7A] hover:text-white flex items-center gap-1 min-h-[32px] px-2 cursor-pointer"
        >
          <Plus className="size-3" /> Add Project
        </button>
      </div>

      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
        {store.projects.length === 0 ? (
          <div className="text-center py-4 text-white/30 font-semibold text-[9px] uppercase tracking-widest">No active folders</div>
        ) : (
          store.projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-2 rounded-full bg-[#D4AF7A]"></div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-white leading-tight">{project.name}</h4>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  store.deleteProject(project.id);
                }}
                className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1.5 hover:bg-white/5 rounded-full text-rose-400 transition-all min-h-[32px]"
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
        <div className="size-8 rounded-full border-4 border-[#D4AF7A] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative flex flex-col transition-all duration-1000 font-sans overflow-x-hidden text-slate-100 ${
        isEngineeringMode ? "creator-lab-cockpit" : ""
      }`}
      style={{
        backgroundColor: "#071B33",
      }}
    >
      {/* HUD Scan Line Effect when in Engineering Mode */}
      {isEngineeringMode && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-[#D4AF7A]/20 shadow-[0_0_12px_rgba(212,175,122,0.4)] pointer-events-none animate-scan z-20"></div>
      )}

      {/* Dynamic Overlay Gradient */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#071B33] via-[#0B2447] to-[#102A43] transition-opacity duration-1000"
      />

      {/* Focus Mode Overlay */}
      <FocusMode />

      {/* Main Layout Wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 flex flex-col flex-1 gap-6">
        
        {/* Floating navbar */}
        <header className="hidden lg:flex w-full rounded-full liquid-glass px-8 py-3.5 items-center justify-between shadow-2xl gap-4">
          
          {/* Logo & Navigation */}
          <div className="flex items-center flex-1 min-w-0 gap-4">
            <div className="flex items-center gap-2 shrink-0 cursor-pointer select-none" onClick={() => setActiveTab("dashboard")}>
              <span className="font-medium text-xl tracking-wider text-[#D4AF7A] uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                LIFE OS
              </span>
            </div>

            {/* Responsive Horizontal Sliding Navigation */}
            <div className="relative flex-1 min-w-0 mx-2 overflow-hidden">
              {/* Left Fade Indicator */}
              <div 
                className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#071b33]/90 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${showLeftFade ? "opacity-100" : "opacity-0"}`} 
              />

              {/* Scroll Container */}
              <div 
                ref={navScrollRef}
                className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1"
              >
                {[
                  { id: "dashboard", label: "Sanctuary", icon: BarChart3 },
                  { id: "tasks", label: "Daily Rituals", icon: CheckCircle2 },
                  { id: "planner", label: "Planning Board", icon: CalendarIcon },
                  { id: "grid", label: "Life Architecture", icon: Layers },
                  { id: "expenses", label: "Wealth Studio", icon: Wallet },
                  { id: "intelligence", label: "Life Intelligence Center", icon: Brain },
                  { id: "journey", label: "Journey Replay", icon: Sparkles },
                  { id: "engineering", label: "Creator Lab", icon: Terminal },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs uppercase tracking-widest whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-white/10 text-white border border-white/10 shadow-lg"
                          : "text-white/40 hover:text-white border border-transparent"
                      }`}
                    >
                      <Icon className="size-3.5 text-[#D4AF7A]" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Fade Indicator */}
              <div 
                className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#071b33]/90 to-transparent pointer-events-none z-10 transition-opacity duration-300 ${showRightFade ? "opacity-100" : "opacity-0"}`} 
              />
            </div>
          </div>

          {/* Right Section: Settings, Profile */}
          <div className="flex items-center justify-end shrink-0 xl:gap-6 gap-3">
            
            <div className="flex items-center gap-3 xl:gap-4 bg-white/3 px-4 py-2 rounded-full border border-white/5 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${isEngineeringMode ? "text-[#D4AF7A]" : "text-white/30"}`}>
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
                      ? "bg-[#D4AF7A]/20 border-[#D4AF7A]/50"
                      : "bg-white/5 border-white/10"
                  }`}
                  title="Toggle Creator Lab Terminal Interface"
                >
                  <div
                    className={`size-3.5 rounded-full transition-all duration-300 ${
                      isEngineeringMode ? "bg-[#D4AF7A] translate-x-4 shadow-[0_0_8px_rgba(212,175,122,0.8)]" : "bg-white/30"
                    }`}
                  />
                </button>
              </div>
              
              <div className="w-px h-4 bg-white/5 shrink-0"></div>
              
              <button type="button"
                onClick={() => setIsCustomizing(true)}
                className="shrink-0 text-white/50 hover:text-white transition-all cursor-pointer"
                title="Customize Wallpaper & Theme"
              >
                <Sliders className="size-4" />
              </button>
            </div>

            {/* Profile widget */}
            <div className="flex items-center gap-3 bg-white/2 pl-4 pr-1.5 py-1.5 rounded-full border border-white/5 hover:bg-white/5 transition-all cursor-pointer group shrink-0 max-w-[140px] xl:max-w-[200px]">
              <div className="text-right hidden xl:block overflow-hidden min-w-0">
                <p className="text-xs font-bold leading-none mb-1 text-slate-200 group-hover:text-white transition-colors truncate">{store.settings.name || "Ankush"}</p>
                <p className="text-[8px] text-white/40 font-bold tracking-widest uppercase leading-none truncate">{store.settings.email.split('@')[0]}</p>
              </div>
              <div className="flex items-center shrink-0">
                <div className="size-8 shrink-0 rounded-full bg-[#D4AF7A]/15 border border-[#D4AF7A]/40 flex items-center justify-center font-black text-xs text-[#D4AF7A] shadow-inner">
                  {(store.settings.name || "Ankush").split(" ").map((n) => n[0]).join("")}
                </div>
                <button type="button"
                  onClick={() => {
                    store.logout();
                    push("/login");
                  }}
                  className="opacity-0 w-0 overflow-hidden group-hover:w-8 group-hover:opacity-100 group-hover:ml-2 h-8 shrink-0 rounded-full bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-400 transition-all duration-300 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Header Layout */}
        <header className="lg:hidden flex w-full rounded-2xl liquid-glass px-4 py-3 items-center justify-between shadow-lg z-30">
          <div className="flex items-center gap-3">
            <span className="font-medium text-xl tracking-wider text-white uppercase" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              LIFE OS
            </span>
          </div>

          <button type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#D4AF7A] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span>Menu</span>
          </button>
        </header>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl pt-24 px-6 pb-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="flex flex-col gap-6">
                <span className="text-[10px] font-bold text-[#D4AF7A] uppercase tracking-[0.2em] border-b border-white/5 pb-2">
                  Navigation Menu
                </span>
                
                <nav className="flex flex-col gap-2">
                  {[
                    { id: "dashboard", label: "Sanctuary", icon: BarChart3 },
                    { id: "tasks", label: "Daily Rituals", icon: CheckCircle2 },
                    { id: "planner", label: "Planning Board", icon: CalendarIcon },
                    { id: "grid", label: "Life Architecture", icon: Layers },
                    { id: "expenses", label: "Wealth Studio", icon: Wallet },
                    { id: "intelligence", label: "Life Intelligence Center", icon: Brain },
                    { id: "journey", label: "Journey Replay", icon: Sparkles },
                    { id: "engineering", label: "Creator Lab", icon: Terminal },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button type="button"
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer text-white/70 hover:text-white bg-white/3 border border-white/5 hover:border-white/10"
                      >
                        <Icon className="size-4 text-[#D4AF7A]" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="flex items-center justify-between bg-white/3 border border-white/5 p-4 rounded-2xl mt-6">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#D4AF7A]/15 border border-[#D4AF7A]/40 flex items-center justify-center font-black text-sm text-[#D4AF7A] shadow-inner">
                    {(store.settings.name || "Ankush").split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="text-left overflow-hidden max-w-[150px]">
                    <p className="text-xs font-bold leading-none mb-1 text-slate-200 truncate">{store.settings.name || "Ankush"}</p>
                    <p className="text-[8px] text-white/40 font-bold uppercase truncate">{store.settings.email}</p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => {
                    store.logout();
                    push("/login");
                  }}
                  className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY CONTENTS */}
        <div className="flex-1 flex flex-col gap-6">

          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="w-full flex flex-col gap-6">
              
              {/* Overdue Alert banner */}
              {overdueTasks.length > 0 && (
                <div className="w-full p-4 rounded-3xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-xl flex items-center justify-between shadow-lg shadow-rose-950/20 animate-pulse">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="size-5 text-rose-400" />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-rose-300 uppercase tracking-widest">Needs Attention</h4>
                      <p className="text-[10px] text-rose-400 font-semibold mt-0.5">
                        You have {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""} in rituals.
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
                        className="bg-rose-650 hover:bg-rose-600 text-white font-bold text-[8px] uppercase tracking-widest h-8 rounded-full px-3"
                      >
                        Complete: {task.title.substring(0, 15)}...
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Reminder Banner */}
              {nextTask && (
                <div className="w-full p-5 rounded-3xl border border-[#D4AF7A]/20 bg-gradient-to-r from-[#D4AF7A]/5 to-[#E7CBA9]/5 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl gap-4 text-left">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-[#D4AF7A]/15 border border-[#D4AF7A]/30 flex items-center justify-center text-[#D4AF7A] shadow-inner text-sm">
                      🔔
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#E7CBA9] flex items-center gap-1.5">
                        Next Ritual <span className="text-white/20">•</span> <span>{nextTaskCountdown}</span>
                      </span>
                      <h3 className="text-sm font-semibold text-white mt-0.5">{nextTask.title}</h3>
                      <div className="flex gap-2 text-[8px] font-bold uppercase tracking-widest text-white/40 mt-1">
                        <span>⏰ {nextTaskTimeRange}</span>
                        {nextTask.duration && <span>⏳ {nextTask.duration}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      onClick={() => store.updateDayTaskInstance(todayStr, nextTask.id, { status: "in_progress" })}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-[8px] uppercase tracking-widest h-8 rounded-full px-3.5"
                    >
                      Start Focus
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => store.updateDayTaskInstance(todayStr, nextTask.id, { status: "completed", completed: true })}
                      className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] font-bold text-[8px] uppercase tracking-widest h-8 rounded-full px-3.5"
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              )}

              {/* Luxury Greeting Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between text-left gap-4 mt-2 mb-2 animate-fade-rise">
                <div>
                  <h2 className="text-3xl font-light text-white leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Good Evening, <span className="text-[#D4AF7A] font-medium">{store.settings.name || "Ankush"}</span>
                  </h2>
                  <p className="text-xs text-white/50 font-medium tracking-widest uppercase mt-1">
                    Welcome back to your command sanctuary.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#D4AF7A]">
                  <span className="size-2 bg-[#D4AF7A] rounded-full animate-pulse" />
                  Telemetry Active // Sanctuary V1.0
                </div>
              </div>

              {/* Pristine Empty State Banner */}
              {todaysTasks.length === 0 && (
                <div className="w-full p-6 rounded-3xl border border-[#D4AF7A]/25 bg-[#D4AF7A]/5 backdrop-blur-xl flex flex-col justify-center text-left">
                  <h3 className="text-xs font-bold text-[#E7CBA9] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="size-4 text-[#D4AF7A]" /> Welcome to your Cockpit
                  </h3>
                  <p className="text-xs text-white/60 font-normal mt-1 leading-relaxed">
                    Your operating environment starts clean. Plan rituals in <button type="button" onClick={() => setActiveTab("grid")} className="text-[#D4AF7A] underline font-bold cursor-pointer">Life Architecture</button> or add one below to customize today&apos;s agenda.
                  </p>
                </div>
              )}

              {/* MOBILE & TABLET LAYOUT */}
              <div className="flex lg:hidden flex-col gap-6 w-full">
                {todaysGoalWidget}
                {focusAnalyticsWidget}
                {plannerConsistencyWidget}
                {byProjectWidget}
                {todaysTasksWidget}
                {focusHourTrackerWidget}
              </div>

              {/* DESKTOP LAYOUT (3 Columns) */}
              <div className="hidden lg:grid lg:grid-cols-[320px_1fr_450px] gap-6 items-start w-full">
                {/* Left Column */}
                <div className="flex flex-col gap-6">
                  {focusHourTrackerWidget}
                  {todaysGoalWidget}
                  {byProjectWidget}
                </div>

                {/* Center Column */}
                <div className="flex flex-col gap-6">
                  {todaysTasksWidget}
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                  {focusAnalyticsWidget}
                  {plannerConsistencyWidget}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY RITUALS */}
          {activeTab === "tasks" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
              {/* Daily Rituals Workspace */}
              <div className="lg:col-span-8 flex flex-col gap-6 h-full text-left">
                <DailyTaskSystem />
              </div>

              {/* Habits Workspace */}
              <div className="lg:col-span-4 rounded-3xl liquid-glass p-6 shadow-xl flex flex-col gap-5 min-h-[400px] w-full text-left">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h2 className="text-xl font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Daily Habits</h2>
                    <p className="text-[10px] text-white/40 font-semibold mt-0.5 uppercase tracking-widest">Commit daily to build streak cycles</p>
                  </div>
                  <button type="button"
                    onClick={() => setHabitModalOpen(true)}
                    className="text-xs font-bold text-[#D4AF7A] hover:text-white flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="size-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {store.habits.length === 0 ? (
                    <div className="text-center py-5 text-white/30 font-semibold text-[9px] uppercase tracking-widest">No habits declared yet</div>
                  ) : (
                    store.habits.map((habit) => {
                      const isCompletedToday = habit.completedDates.includes(todayStr);
                      return (
                        <div
                          key={habit.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <button type="button"
                              onClick={() => store.toggleHabit(habit.id, todayStr)}
                              className={`size-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                isCompletedToday
                                  ? "bg-[#D4AF7A] border-[#D4AF7A] text-[#071B33]"
                                  : "border-white/20 hover:border-white/40"
                              }`}
                            >
                              {isCompletedToday && "✓"}
                            </button>
                            <div className="text-left">
                              <h4 className="text-xs font-semibold text-white leading-none">{habit.name}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-[#D4AF7A] flex items-center gap-0.5">
                              🔥 {habit.streak}
                            </span>
                            <button type="button"
                              onClick={() => store.deleteHabit(habit.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded-full text-rose-450 transition-all cursor-pointer"
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
            <div className="w-full text-left">
              <MonthlyPlanner />
            </div>
          )}

          {/* TAB: LIFE ARCHITECTURE */}
          {activeTab === "grid" && (
            <div className="rounded-3xl liquid-glass p-6 shadow-xl min-h-[400px] w-full text-left">
              <LifeGrid onOpenDayDetails={handleDayClick} />
            </div>
          )}

          {/* TAB: WEALTH STUDIO */}
          {activeTab === "expenses" && (
            <div className="w-full text-left">
              <FinancialOS />
            </div>
          )}

          {/* TAB: JOURNEY REPLAY */}
          {activeTab === "journey" && (
            <div className="rounded-3xl liquid-glass p-6 shadow-xl min-h-[400px] w-full text-left">
              <JourneyReplay />
            </div>
          )}

          {/* TAB: CREATOR LAB */}
          {activeTab === "engineering" && (
            <div className="rounded-3xl border border-white/5 bg-[#030d1a] p-6 shadow-2xl min-h-[400px] w-full text-left">
              <EngineeringMode />
            </div>
          )}

          {/* TAB: LIFE INTELLIGENCE CENTER */}
          {activeTab === "intelligence" && (
            <div className="rounded-3xl liquid-glass p-6 shadow-xl min-h-[500px] w-full text-left">
              <LifeEngine />
            </div>
          )}

        </div>

      </div>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto p-6 text-center text-white/30 text-[9px] font-bold uppercase tracking-widest font-mono">
        &copy; {new Date().getFullYear()} LIFE OS — Premium Architectural Cockpit
      </footer>

      {/* DIALOG 1: BACKGROUND CUSTOMIZER */}
      <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
        <DialogContent className="sm:max-w-[425px] bg-[#071b33] border border-white/10 text-white rounded-3xl backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Configure Workspace</DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-semibold">
              Adjust styling overrides to personalize workspace focus and ergonomics.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4 text-left">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-[#E7CBA9]">Image URL Override</Label>
              <Input
                value={bgInput}
                onChange={(e) => setBgInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="bg-white/3 border-white/10 rounded-xl text-slate-200 focus:border-[#D4AF7A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Or Upload File</Label>
              <div className="flex items-center justify-center border border-dashed border-white/15 rounded-xl p-4 bg-white/3 hover:bg-white/5 cursor-pointer relative transition-all">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLocalBgUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Upload className="size-4 text-[#D4AF7A]" />
                  <span>Choose local file...</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Preset Backgrounds</Label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_WALLPAPERS.map((wp) => (
                  <button type="button"
                    key={wp.title}
                    onClick={() => setBgInput(wp.url)}
                    className={`aspect-video rounded-lg bg-cover bg-center border transition-all cursor-pointer ${
                      bgInput === wp.url ? "border-[#D4AF7A] scale-105" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                    style={{ backgroundImage: `url(${wp.url})` }}
                    title={wp.title}
                  ></button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
                  <span>Blur Scale</span>
                  <span>{blurVal}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blurVal}
                  onChange={(e) => setBlurVal(parseInt(e.target.value))}
                  className="w-full accent-[#D4AF7A] bg-slate-950"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-white/40">
                  <span>Tint Value</span>
                  <span>{opacityVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacityVal}
                  onChange={(e) => setOpacityVal(parseInt(e.target.value))}
                  className="w-full accent-[#D4AF7A] bg-slate-950"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsCustomizing(false)}
              className="flex-1 rounded-full font-bold py-5 border-white/10 bg-transparent text-white/60 hover:bg-white/5 text-xs uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBgSave}
              className="flex-1 rounded-full font-bold py-5 bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] text-xs uppercase tracking-widest"
            >
              Save Overrides
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: ADD TASK */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="bg-[#071b33] border border-white/10 text-white rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wide text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Register Focus Target</DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-semibold">
              Enter details to schedule a new task ritual under today&apos;s active flow.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="flex flex-col gap-4 py-3 text-left">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-[#E7CBA9]">Ritual Title</Label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Finish LifeOS implementation..."
                className="bg-white/3 border-white/10 rounded-xl focus:border-[#D4AF7A] text-white"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Duration (Optional)</Label>
              <Input
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(e.target.value)}
                placeholder="e.g. 2 hours, 30 minutes"
                className="bg-white/3 border-white/10 rounded-xl focus:border-[#D4AF7A] text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Start Time (Optional)</Label>
              <Input
                value={newTaskStartTime}
                onChange={(e) => setNewTaskStartTime(e.target.value)}
                placeholder="e.g. 08:00 AM, 2:00 PM"
                className="bg-white/3 border-white/10 rounded-xl focus:border-[#D4AF7A] text-white"
              />
            </div>

            <Button type="submit" className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] rounded-full font-bold py-5 mt-2 uppercase tracking-widest text-xs">
              Save Ritual
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: ADD LEDGER ITEM */}
      <Dialog open={expenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <DialogContent className="bg-[#071b33] border border-white/10 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Register Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="flex flex-col gap-4 py-3 text-left">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Type</Label>
                <Select
                  value={newExpenseType}
                  onValueChange={(val) => setNewExpenseType((val as "income" | "expense") || "expense")}
                >
                  <SelectTrigger className="bg-white/3 border-white/10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#071b33] border-white/10 text-white">
                    <SelectItem value="expense">Expense (-)</SelectItem>
                    <SelectItem value="income">Income (+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Amount ($)</Label>
                <Input
                  type="number"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  placeholder="45.00"
                  className="bg-white/3 border-white/10 rounded-xl focus:border-[#D4AF7A] text-white"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Category</Label>
              <Select value={newExpenseCategory} onValueChange={(val) => setNewExpenseCategory(val || "Food")}>
                <SelectTrigger className="bg-white/3 border-white/10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#071b33] border-white/10 text-white">
                  {["Food", "Travel", "Shopping", "Education", "Bills", "Entertainment", "Salary", "Freelance", "Investment", "Other"].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Description</Label>
              <Input
                value={newExpenseDesc}
                onChange={(e) => setNewExpenseDesc(e.target.value)}
                placeholder="Dinner with team, office supplies, etc."
                className="bg-white/3 border-white/10 rounded-xl focus:border-[#D4AF7A] text-white"
              />
            </div>
            <Button type="submit" className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] rounded-full font-bold py-5 mt-2 uppercase tracking-widest text-xs">
              Add to Ledger
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: ADD HABIT */}
      <Dialog open={habitModalOpen} onOpenChange={setHabitModalOpen}>
        <DialogContent className="bg-[#071b33] border border-white/10 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Register Daily Habit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddHabit} className="flex flex-col gap-4 py-3 text-left">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-[#E7CBA9]">Habit Name</Label>
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Gym session, reading, hydration cycle..."
                className="bg-white/3 border-white/10 rounded-xl focus:border-[#D4AF7A]"
                required
              />
            </div>
            <Button type="submit" className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] rounded-full font-bold py-5 mt-2 uppercase tracking-widest text-xs">
              Save Habit
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 5: ADD PROJECT */}
      <Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
        <DialogContent className="bg-[#071b33] border border-white/10 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Create Project Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProject} className="flex flex-col gap-4 py-3 text-left">
            <div className="flex flex-col gap-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Project Name</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="LIFE OS, studio redesign..."
                className="bg-white/3 border-white/10 rounded-xl focus:border-[#D4AF7A]"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Category Tag</Label>
              <Select value={newProjectCategory} onValueChange={(val) => setNewProjectCategory(val || "Design")}>
                <SelectTrigger className="bg-white/3 border-white/10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#071b33] border-white/10 text-white">
                  {["Design", "Coding", "Meeting", "Writing", "Learning"].map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] rounded-full font-bold py-5 mt-2 uppercase tracking-widest text-xs">
              Initialize Folder
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 6: DAY DETAIL MODAL */}
      <Dialog open={dayDetailModalOpen} onOpenChange={setDayDetailModalOpen}>
        <DialogContent className="bg-[#071b33] border border-white/10 text-white rounded-3xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-light text-white flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              <CalendarIcon className="size-5 text-[#D4AF7A]" />
              Planning Board: {selectedCalendarDate}
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs font-semibold">
              Establish a milestone target and record specific events for this date.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-5 py-2 text-left">
            <div className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white/2 border border-white/5">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-[#E7CBA9] flex items-center gap-1.5">
                <Target className="size-3.5 text-[#D4AF7A]" />
                Daily Target Goal
              </Label>
              <Input
                value={dayTargetText}
                onChange={(e) => setDayTargetText(e.target.value)}
                placeholder="e.g. Solve 3 LeetCode, finish designs..."
                className="bg-white/3 border-white/10 text-xs rounded-xl focus:border-[#D4AF7A]"
              />
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="dayTargetCompleted"
                  checked={dayTargetCompleted}
                  onChange={(e) => setDayTargetCompleted(e.target.checked)}
                  className="size-4 rounded-full border-white/20 text-[#D4AF7A] focus:ring-0 bg-transparent cursor-pointer"
                />
                <Label htmlFor="dayTargetCompleted" className="text-white/60 text-xs font-semibold cursor-pointer">
                  Mark daily target as completed
                </Label>
              </div>
              <Button onClick={handleSaveDayTarget} className="w-full bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] rounded-full font-bold py-4 text-xs mt-1 uppercase tracking-widest">
                Save Daily Target
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40">Scheduled Milestones</Label>
              
              <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                {store.events.filter(e => e.date === selectedCalendarDate).length === 0 ? (
                  <div className="text-center py-4 text-white/30 font-semibold text-[8px] uppercase tracking-widest">No milestones scheduled</div>
                ) : (
                  store.events
                    .filter(e => e.date === selectedCalendarDate)
                    .map((evt) => (
                      <div
                        key={evt.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-[#D4AF7A]"></span>
                          <span className="font-semibold text-white">{evt.title}</span>
                          <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/60 font-bold uppercase tracking-widest">
                            {evt.category}
                          </span>
                        </div>
                        <button type="button"
                          onClick={() => store.deleteEvent(evt.id)}
                          className="p-1 hover:bg-white/5 rounded-full text-rose-450 transition-all cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))
                )}
              </div>

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
                  placeholder="New milestone title..."
                  className="bg-white/3 border-white/10 text-xs rounded-xl flex-1 focus:border-[#D4AF7A]"
                  required
                />
                <Select value={newEventCategory} onValueChange={(val) => setNewEventCategory(val || "Work")}>
                  <SelectTrigger className="bg-white/3 border-white/10 rounded-xl w-[90px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#071b33] border-white/10 text-white text-xs">
                    {["Work", "Study", "Personal", "Health", "Social"].map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white py-4 px-3 rounded-xl uppercase font-bold text-[9px] tracking-widest">
                  Add
                </Button>
              </form>
            </div>
          </div>

          <div className="flex gap-2.5 mt-3 border-t border-white/5 pt-3">
            <Button
              variant="outline"
              onClick={() => setDayDetailModalOpen(false)}
              className="w-full rounded-full font-bold py-5 border-white/10 bg-transparent text-white/50 hover:bg-white/5 text-xs uppercase tracking-widest"
            >
              Close Board
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
