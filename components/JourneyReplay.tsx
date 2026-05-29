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
    const targetKeys = Object.keys(store.dailyTargets).filter((date) =>
      date.startsWith(monthPrefix)
    );

    let achievements = 0; 
    let failures = 0;     

    let currentStreak = 0;
    let longestStreak = 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${monthStr}-${String(day).padStart(2, "0")}`;
      const dayTarget = store.dailyTargets[dateKey];
      if (dayTarget) {
        if (dayTarget.completed) {
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
    monthExpenses
      .filter((e) => e.type === "expense")
      .forEach((e) => {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      });

    const topCategory = Object.entries(categories).sort(
      (a, b) => b[1] - a[1]
    )[0] || ["None", 0];

    const hasData = targetKeys.length > 0 || monthExpenses.length > 0;

    return {
      hasData,
      totalTargets: targetKeys.length,
      achievements,
      failures,
      longestStreak,
      totalSpent,
      totalIncome,
      topCategoryName: topCategory[0],
      topCategoryAmount: topCategory[1],
      daysInMonth,
    };
  }, [store.dailyTargets, store.expenses, monthPrefix, year, monthStr, month]);

  // Calculate stats for Lifetime Journey
  const lifetimeData = useMemo(() => {
    let lifetimeAchievements = 0;
    let lifetimeFailures = 0;
    
    Object.values(store.dailyTargets).forEach(t => {
      if (t.completed) lifetimeAchievements++;
      else lifetimeFailures++;
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
      hasData: Object.keys(store.dailyTargets).length > 0 || store.expenses.length > 0,
      achievements: lifetimeAchievements,
      failures: lifetimeFailures,
      totalSpent: lifetimeSpent,
      totalIncome: lifetimeIncome,
      topCategoryName: topCategory[0],
      topCategoryAmount: topCategory[1],
      focusHours: lifetimeFocusHours
    };
  }, [store.dailyTargets, store.expenses, store.focusSeconds, store.focusPausedSeconds]);

  const handlePrevMonth = () => setSelectedMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setSelectedMonth(new Date(year, month + 1, 1));

  const handleExportPDF = () => {
    window.print();
  };

  const activeData = viewMode === "monthly" ? replayData : lifetimeData;

  return (
    <div className="flex flex-col gap-6 w-full print-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4 no-print">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="size-5 text-indigo-400" />
            {viewMode === "monthly" ? "Monthly Journey Replay" : "Lifetime Legacy Archives"}
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            {viewMode === "monthly" ? "Compile month-end consistency data and archive snapshot stats." : "Your total aggregated analytics and lifetime achievements."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle View Mode */}
          <div className="flex items-center bg-slate-950/40 p-1 rounded-xl border border-white/5">
            <button type="button"
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "monthly" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Monthly
            </button>
            <button type="button"
              onClick={() => setViewMode("lifetime")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "lifetime" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Lifetime
            </button>
          </div>

          {viewMode === "monthly" && (
            <div className="flex items-center gap-3 bg-slate-950/30 border border-white/5 p-1 rounded-xl">
              <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                <ChevronLeft className="size-4" />
              </button>
              <span className="font-extrabold text-xs uppercase tracking-[0.15em] text-slate-200 px-2 min-w-[120px] text-center">
                {monthLabel}
              </span>
              <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!activeData.hasData ? (
        <div className="rounded-2xl border border-white/5 bg-slate-950/20 p-12 text-center flex flex-col items-center justify-center gap-4 no-print">
          <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
            <Calendar className="size-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Telemetry Recorded</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
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
          className="max-w-3xl mx-auto w-full print-card"
        >
          {/* Replay Visual Card */}
          <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-slate-950 via-slate-950 to-indigo-950/20 p-6 shadow-2xl overflow-hidden group print-bg">
            <div className="absolute -right-20 -top-20 size-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all no-print"></div>
            <div className="absolute -left-20 -bottom-20 size-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none no-print"></div>

            <div className="absolute right-6 top-6 flex items-center gap-1.5 opacity-20 print-opacity-100">
              <Sparkles className="size-4 text-indigo-400" />
              <span className="font-extrabold text-[10px] tracking-[0.2em] text-white print-text-black uppercase">LifeOS Snapshot</span>
            </div>

            <div className="border-b border-white/5 pb-6 print-border-black">
              <span className="text-[10px] font-bold text-indigo-400 print-text-indigo-600 uppercase tracking-widest">
                {viewMode === "monthly" ? "Performance Archive" : "Lifetime Legacy"}
              </span>
              <h3 className="text-3xl font-black text-white print-text-black mt-1">
                {viewMode === "monthly" ? monthLabel : "All-Time Statistics"}
              </h3>
              <p className="text-xs text-slate-400 print-text-slate-600 font-semibold mt-1">
                {viewMode === "monthly" 
                  ? "Consistency telemetry report compiled from digital check-ins." 
                  : "Total historical aggregation of your life's telemetry."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              
              <div className="p-5 rounded-xl bg-white/5 border border-white/10 print-border-black flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-emerald-400 print-text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="size-4" /> {viewMode === "monthly" ? "Monthly Achievements" : "Lifetime Achievements"}
                </span>
                <span className="text-4xl font-extrabold text-white print-text-black tracking-tight">
                  {activeData.achievements} <span className="text-sm text-slate-500 font-semibold">Targets Hit</span>
                </span>
              </div>

              <div className="p-5 rounded-xl bg-white/5 border border-white/10 print-border-black flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-rose-400 print-text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="size-4" /> {viewMode === "monthly" ? "Unfinished Targets" : "Lifetime Misses"}
                </span>
                <span className="text-4xl font-extrabold text-white print-text-black tracking-tight">
                  {activeData.failures} <span className="text-sm text-slate-500 font-semibold">Targets Missed</span>
                </span>
              </div>

              <div className="p-5 rounded-xl bg-white/5 border border-white/10 print-border-black flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-indigo-400 print-text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                  {viewMode === "monthly" ? <Zap className="size-4" /> : <Globe className="size-4" />} 
                  {viewMode === "monthly" ? "Focus Streak" : "Lifetime Focus"}
                </span>
                <span className="text-4xl font-extrabold text-white print-text-black tracking-tight">
                  {viewMode === "monthly" ? replayData.longestStreak : lifetimeData.focusHours} 
                  <span className="text-sm text-slate-500 font-semibold">
                    {viewMode === "monthly" ? "Max Days" : "Hours"}
                  </span>
                </span>
              </div>

              <div className="p-5 rounded-xl bg-white/5 border border-white/10 print-border-black flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-yellow-400 print-text-yellow-600 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="size-4" /> Ledger Overhead
                </span>
                <span className="text-4xl font-extrabold text-white print-text-black tracking-tight">
                  ${activeData.totalSpent.toLocaleString()}{" "}
                </span>
                <span className="text-xs text-slate-400 print-text-slate-600 font-semibold mt-1">
                  Top Category: {activeData.topCategoryName} (${activeData.topCategoryAmount.toLocaleString()})
                </span>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6 print-border-black">
              <div className="flex items-center gap-2">
                {activeData.totalSpent > activeData.totalIncome && activeData.totalIncome > 0 ? (
                  <span className="text-[10px] font-black uppercase text-rose-400 print-text-rose-600 flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-full">
                    <TrendingUp className="size-3.5" /> Deficit {viewMode === "monthly" ? "Month" : "Overall"}
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase text-emerald-400 print-text-emerald-600 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                    <TrendingDown className="size-3.5" /> Financial Stability
                  </span>
                )}
                {viewMode === "monthly" && (
                  <span className="text-[10px] font-mono text-slate-500 ml-2">
                    COVERAGE: {Math.round((replayData.totalTargets / replayData.daysInMonth) * 100)}%
                  </span>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto no-print">
                <Button
                  onClick={handleExportPDF}
                  className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600 font-bold py-5 px-6 text-xs gap-2 rounded-xl shadow-lg shadow-indigo-500/20"
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
