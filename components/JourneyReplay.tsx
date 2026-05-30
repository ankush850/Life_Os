"use client";

import React, { useState, useMemo } from "react";
import { useLifeStore } from "@/store/useLifeStore";
import {
  Award,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Download,
  Calendar,
  Zap,
  DollarSign,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function JourneyReplay() {
  const store = useLifeStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"monthly" | "lifetime">("monthly");

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const monthStr = String(month + 1).padStart(2, "0");
  const monthPrefix = `${year}-${monthStr}`;

  const monthLabel = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Calculate stats for Monthly Journey
  const replayData = useMemo(() => {
    const activeDaysThisMonth: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${monthStr}-${String(d).padStart(2, "0")}`;
      const hasLegacy = !!(store.dailyTargets[dateStr]?.target);
      const hasTasks = !!(store.dayTasks[dateStr]?.length);
      if (hasLegacy || hasTasks) {
        activeDaysThisMonth.push(dateStr);
      }
    }

    let achievements = 0; 
    let failures = 0;     

    let currentStreak = 0;
    let longestStreak = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${monthStr}-${String(day).padStart(2, "0")}`;
      const dayTarget = store.dailyTargets[dateKey];
      const dayTasks = store.dayTasks[dateKey] || [];
      
      const hasLegacy = !!(dayTarget && dayTarget.target);
      const hasTasks = dayTasks.length > 0;
      
      if (hasLegacy || hasTasks) {
        const legacyCompleted = hasLegacy && dayTarget.completed;
        const tasksCompleted = hasTasks && dayTasks.every(t => t.completed);
        
        if (legacyCompleted || tasksCompleted) {
          achievements++;
          currentStreak++;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else {
          failures++;
          currentStreak = 0;
        }
      } else {
        currentStreak = 0;
      }
    }

    const monthExpenses = store.expenses.filter((exp) =>
      exp.date.startsWith(monthPrefix)
    );
    const totalSpent = monthExpenses
      .filter((e) => e.type === "expense")
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalIncome = monthExpenses
      .filter((e) => e.type === "income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const categories: Record<string, number> = {};
    monthExpenses.reduce((acc, e) => { if (e.type === "expense") acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, categories);

    const topCategory = Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    )[0] || ["None", 0];

    const hasData = activeDaysThisMonth.length > 0 || monthExpenses.length > 0;

    return {
      hasData,
      totalTargets: activeDaysThisMonth.length,
      achievements,
      failures,
      longestStreak,
      totalSpent,
      totalIncome,
      topCategoryName: topCategory[0],
      topCategoryAmount: topCategory[1],
      daysInMonth,
    };
  }, [store.dailyTargets, store.dayTasks, store.expenses, monthPrefix, year, monthStr, month]);

  // Calculate stats for Lifetime Journey
  const lifetimeData = useMemo(() => {
    let lifetimeAchievements = 0;
    let lifetimeFailures = 0;
    
    // Find all unique dates across dailyTargets and dayTasks
    const allDates = new Set([
      ...Object.keys(store.dailyTargets).filter(date => store.dailyTargets[date]?.target),
      ...Object.keys(store.dayTasks).filter(date => store.dayTasks[date]?.length)
    ]);
    
    allDates.forEach(date => {
      const dayTarget = store.dailyTargets[date];
      const dayTasks = store.dayTasks[date] || [];
      
      const hasLegacy = !!(dayTarget && dayTarget.target);
      const hasTasks = dayTasks.length > 0;
      
      const legacyCompleted = hasLegacy && dayTarget.completed;
      const tasksCompleted = hasTasks && dayTasks.every(t => t.completed);
      
      if (legacyCompleted || tasksCompleted) {
        lifetimeAchievements++;
      } else {
        lifetimeFailures++;
      }
    });

    const lifetimeSpent = store.expenses.filter(e => e.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
    const lifetimeIncome = store.expenses.filter(e => e.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
    
    const categories: Record<string, number> = {};
    store.expenses
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      });
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0] || ["None", 0];

    const lifetimeFocusHours = Math.round((store.focusSeconds + store.focusPausedSeconds) / 3600);

    return {
      hasData: allDates.size > 0 || store.expenses.length > 0,
      achievements: lifetimeAchievements,
      failures: lifetimeFailures,
      totalSpent: lifetimeSpent,
      totalIncome: lifetimeIncome,
      topCategoryName: topCategory[0],
      topCategoryAmount: topCategory[1],
      focusHours: lifetimeFocusHours
    };
  }, [store.dailyTargets, store.dayTasks, store.expenses, store.focusSeconds, store.focusPausedSeconds]);

  const handlePrevMonth = () => setSelectedMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setSelectedMonth(new Date(year, month + 1, 1));

  const handleExportPDF = () => {
    window.print();
  };

  const activeData = viewMode === "monthly" ? replayData : lifetimeData;

  return (
    <div className="flex flex-col gap-6 w-full print-container text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4 no-print">
        <div>
          <h2 className="text-xl font-light text-white flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <Award className="size-5 text-[#D4AF7A]" />
            {viewMode === "monthly" ? "Monthly Journey Replay" : "Lifetime Legacy Archives"}
          </h2>
          <p className="text-xs text-white/50 font-normal mt-1">
            {viewMode === "monthly" ? "Compile month-end consistency data and archive snapshot stats." : "Your total aggregated analytics and lifetime achievements."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-white/2 p-1 rounded-full border border-white/5">
            <button type="button"
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${viewMode === "monthly" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
            >
              Monthly
            </button>
            <button type="button"
              onClick={() => setViewMode("lifetime")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${viewMode === "lifetime" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
            >
              Lifetime
            </button>
          </div>

          {viewMode === "monthly" && (
            <div className="flex items-center gap-3 bg-white/2 border border-white/5 p-1 rounded-full">
              <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all cursor-pointer">
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-bold text-xs uppercase tracking-widest text-white/80 px-2 min-w-[120px] text-center">
                {monthLabel}
              </span>
              <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all cursor-pointer">
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!activeData.hasData ? (
        <div className="rounded-3xl border border-white/5 bg-white/1 p-12 text-center flex flex-col items-center justify-center gap-4 no-print">
          <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
            <Calendar className="size-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Telemetry Recorded</h3>
            <p className="text-xs text-white/40 font-semibold mt-1 max-w-sm mx-auto italic">
              We cannot compile a replay card without metrics. Check-in daily targets or transactions to unlock summary snapshots.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          key={viewMode + monthPrefix}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto w-full print-card text-left"
        >
          {/* Replay Visual Card */}
          <div className="relative rounded-3xl liquid-glass p-8 shadow-2xl overflow-hidden group print-bg">
            <div className="absolute -right-20 -top-20 size-48 bg-[#D4AF7A]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D4AF7A]/10 transition-all no-print"></div>
            <div className="absolute -left-20 -bottom-20 size-48 bg-[#E7CBA9]/3 rounded-full blur-3xl pointer-events-none no-print"></div>

            <div className="absolute right-6 top-6 flex items-center gap-1.5 opacity-20 print-opacity-100">
              <Sparkles className="size-4 text-[#D4AF7A]" />
              <span className="font-bold text-[10px] tracking-[0.2em] text-white print-text-black uppercase">LifeOS Snapshot</span>
            </div>

            <div className="border-b border-white/5 pb-6 print-border-black">
              <span className="text-[10px] font-bold text-[#D4AF7A] print-text-indigo-600 uppercase tracking-widest">
                {viewMode === "monthly" ? "Performance Archive" : "Lifetime Legacy"}
              </span>
              <h3 className="text-3xl font-light text-white print-text-black mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {viewMode === "monthly" ? monthLabel : "All-Time Statistics"}
              </h3>
              <p className="text-xs text-white/50 print-text-slate-600 font-semibold mt-1">
                {viewMode === "monthly" 
                  ? "Consistency telemetry report compiled from digital check-ins." 
                  : "Total historical aggregation of your life's telemetry."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              
              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 print-border-black flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-[#D4AF7A] uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="size-4 text-[#D4AF7A]" /> {viewMode === "monthly" ? "Monthly Achievements" : "Lifetime Achievements"}
                </span>
                <span className="text-4xl font-light text-white print-text-black tracking-tight">
                  {activeData.achievements} <span className="text-xs text-white/30 font-bold uppercase tracking-wider">Targets Hit</span>
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 print-border-black flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-rose-455 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-rose-450" /> {viewMode === "monthly" ? "Unfinished Targets" : "Lifetime Misses"}
                </span>
                <span className="text-4xl font-light text-white print-text-black tracking-tight">
                  {activeData.failures} <span className="text-xs text-white/30 font-bold uppercase tracking-wider">Targets Missed</span>
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 print-border-black flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-[#D4AF7A] uppercase tracking-widest flex items-center gap-1.5">
                  {viewMode === "monthly" ? <Zap className="size-4 text-[#D4AF7A]" /> : <Globe className="size-4 text-[#D4AF7A]" />} 
                  {viewMode === "monthly" ? "Focus Streak" : "Lifetime Focus"}
                </span>
                <span className="text-4xl font-light text-white print-text-black tracking-tight">
                  {viewMode === "monthly" ? replayData.longestStreak : lifetimeData.focusHours} 
                  <span className="text-xs text-white/30 font-bold uppercase tracking-wider">
                    {viewMode === "monthly" ? "Max Days" : "Hours"}
                  </span>
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white/2 border border-white/5 print-border-black flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-[#D4AF7A] uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign className="size-4 text-[#D4AF7A]" /> Ledger Overhead
                </span>
                <span className="text-4xl font-light text-white print-text-black tracking-tight">
                  ${activeData.totalSpent.toLocaleString()}{" "}
                </span>
                <span className="text-xs text-white/40 print-text-slate-600 font-semibold mt-1">
                  Top Category: {activeData.topCategoryName} (${activeData.topCategoryAmount.toLocaleString()})
                </span>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 print-border-black">
              <div className="flex items-center gap-2">
                {activeData.totalSpent > activeData.totalIncome && activeData.totalIncome > 0 ? (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-rose-400 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full">
                    <TrendingUp className="size-3.5" /> Deficit {viewMode === "monthly" ? "Month" : "Overall"}
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF7A] flex items-center gap-1 bg-[#D4AF7A]/10 border border-[#D4AF7A]/20 px-3.5 py-1.5 rounded-full">
                    <TrendingDown className="size-3.5 text-[#D4AF7A]" /> Financial Stability
                  </span>
                )}
                {viewMode === "monthly" && (
                  <span className="text-[10px] font-mono text-white/30 ml-2">
                    COVERAGE: {Math.round((replayData.totalTargets / replayData.daysInMonth) * 100)}%
                  </span>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto no-print">
                <Button
                  onClick={handleExportPDF}
                  className="flex-1 sm:flex-none bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] font-bold py-5 px-6 text-xs gap-2 rounded-full shadow-lg uppercase tracking-widest cursor-pointer transition-colors"
                >
                  <Download className="size-4" /> Export as PDF
                </Button>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}
