"use client";

import React, { useState } from "react";
import { useLifeStore } from "@/store/useLifeStore";
import { Brain, Target, Activity, Clock, AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LifeEngine() {
  const store = useLifeStore();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [newMission, setNewMission] = useState("");

  // ==============================
  // INTELLIGENCE & TELEMETRY
  // ==============================
  
  // 1. Task Completion Rate
  const totalTasks = store.tasks.length;
  const completedTasks = store.tasks.filter((t) => t.status === "completed").length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100;

  // 2. Financial Health
  const monthlyExpenses = store.expenses.filter((e) => e.date.startsWith(currentMonth) && e.type === "expense");
  const totalExpense = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budget = store.settings.budgetLimit;
  const financialHealth = budget > 0 ? Math.max(0, 100 - (totalExpense / budget) * 100) : 100;

  // 3. Focus Debt
  const totalCourses = store.engineeringCourses.length;
  const finishedCourses = store.engineeringCourses.filter((c) => c.status === "Finished").length;
  const focusScore = totalCourses > 0 ? (finishedCourses / totalCourses) * 100 : 100;

  // 4. Life Score (Algorithm)
  const lifeScore = Math.round(
    (taskCompletionRate * 0.4) + (financialHealth * 0.3) + (focusScore * 0.3)
  );

  // Time Leak Detector
  const activeFocus = store.focusSeconds;
  const pausedFocus = store.focusPausedSeconds;
  const totalFocusTime = activeFocus + pausedFocus;
  const leakPercentage = totalFocusTime > 0 ? (pausedFocus / totalFocusTime) * 100 : 0;

  // Regret Prediction Boolean
  const isOffTrack = lifeScore < 60 || taskCompletionRate < 50;

  // Monthly Missions
  const currentMissions = store.monthlyMissions.filter((m) => m.targetMonth === currentMonth);
  const completedMissions = currentMissions.filter((m) => m.status === "Completed").length;

  const handleAddMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMission) return;
    store.addMission(newMission, currentMonth);
    setNewMission("");
  };

  return (
    <div className="flex flex-col gap-6 w-full text-slate-200">
      
      {/* Header: Global Score */}
      <div className="rounded-3xl liquid-glass p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 size-64 blur-3xl opacity-10 pointer-events-none rounded-full bg-[#D4AF7A]"></div>
        
        <div className="flex flex-col z-10 text-left">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#D4AF7A] flex items-center gap-2 mb-2">
            <Brain className="size-5" /> Global Life Score
          </h2>
          <p className="text-xs text-white/50 font-normal max-w-sm leading-relaxed">
            A unified algorithmic assessment of your operational efficiency across Tasks, Finances, and CS Mastery focus.
          </p>
        </div>

        <div className="flex items-center gap-6 z-10">
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">System Status</p>
            <p className={`text-base font-bold tracking-widest mt-1 ${lifeScore >= 80 ? 'text-[#D4AF7A]' : lifeScore >= 50 ? 'text-white' : 'text-rose-450'}`}>
              {lifeScore >= 80 ? 'OPTIMAL' : lifeScore >= 50 ? 'STABLE' : 'CRITICAL'}
            </p>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-light tracking-tight text-white">{lifeScore}</span>
            <span className="text-lg font-bold text-white/30">/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Missions & Reality Check */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Monthly Missions Board */}
          <div className="rounded-3xl liquid-glass p-6 shadow-2xl flex flex-col gap-5 text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                <Target className="size-4 text-[#D4AF7A]" /> Monthly Macro-Missions
              </h3>
              <span className="text-[9px] font-bold text-white/50 px-2.5 py-1 rounded-full bg-white/3 border border-white/5 uppercase tracking-wider">
                {completedMissions} / {currentMissions.length} COMPLETED
              </span>
            </div>

            <form onSubmit={handleAddMission} className="flex gap-2">
              <Input
                value={newMission}
                onChange={(e) => setNewMission(e.target.value)}
                placeholder="e.g., Ship SaaS MVP"
                className="bg-white/3 border-white/10 text-xs rounded-xl focus:border-[#D4AF7A] text-white font-semibold flex-1 placeholder:text-white/20"
                required
              />
              <Button type="submit" className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] rounded-full text-xs font-bold px-6 uppercase tracking-wider cursor-pointer">
                Lock Target
              </Button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              {currentMissions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/1 text-white/30 text-[10px] font-bold uppercase tracking-widest italic">
                  No active missions for this month
                </div>
              ) : (
                currentMissions.map((mission) => (
                  <div key={mission.id} className="group flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <button type="button"
                        onClick={() => store.toggleMissionStatus(mission.id)}
                        className={`size-5 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                          mission.status === "Completed"
                            ? "bg-[#D4AF7A]/25 border-[#D4AF7A] text-[#D4AF7A]"
                            : "border-white/25 hover:border-[#D4AF7A]"
                        }`}
                      >
                        {mission.status === "Completed" && <CheckCircle className="size-3.5" />}
                      </button>
                      <span className={`font-semibold text-sm ${mission.status === "Completed" ? "text-white/30 line-through" : "text-white"}`}>
                        {mission.title}
                      </span>
                    </div>
                    <button type="button"
                      onClick={() => store.deleteMission(mission.id)}
                      className="opacity-0 group-hover:opacity-100 size-8 flex items-center justify-center rounded-full hover:bg-rose-500/10 text-rose-450 transition-all cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reality vs Plan Matrix */}
          <div className="rounded-3xl liquid-glass p-6 shadow-2xl flex flex-col gap-5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-white">
              <Activity className="size-4 text-[#D4AF7A]" /> Reality vs Plan Trajectory
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Planned Velocity</span>
                <span className="text-2xl font-light text-white flex items-center gap-2 mt-1">
                  100% <TrendingUp className="size-4 text-[#D4AF7A]" />
                </span>
                <p className="text-[9px] text-white/30 font-semibold mt-1">Expected optimal execution</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/2 border border-white/5 flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Actual Velocity</span>
                <span className="text-2xl font-light text-white flex items-center gap-2 mt-1">
                  {Math.round(taskCompletionRate)}% {taskCompletionRate >= 80 ? <TrendingUp className="size-4 text-[#D4AF7A]" /> : <TrendingDown className="size-4 text-rose-400" />}
                </span>
                <p className="text-[9px] text-white/30 font-semibold mt-1">Current real-world execution</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Warnings & Leaks */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Regret Prediction Engine */}
          <div className={`rounded-3xl border p-6 shadow-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-500 text-left ${
            isOffTrack 
              ? "bg-rose-950/20 border-rose-500/20 shadow-rose-950/10" 
              : "bg-white/2 border-white/5"
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isOffTrack ? 'text-rose-400' : 'text-white/40'}`}>
              <AlertTriangle className="size-4" /> Regret Prediction Engine
            </h3>
            
            {isOffTrack ? (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-rose-250 leading-relaxed">
                  Trajectory Warning: At your current velocity ({Math.round(taskCompletionRate)}%), you are mathematically projected to miss your monthly targets.
                </p>
                <p className="text-[11px] text-rose-400/80 font-normal italic">
                  &ldquo;A year from now, you will wish you had started today.&rdquo;
                </p>
                <Button className="mt-2 bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500 text-white font-bold rounded-full py-2.5 text-xs uppercase tracking-widest cursor-pointer">
                  Course Correct
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center text-center py-4">
                <Zap className="size-8 text-[#D4AF7A] mb-2 animate-pulse" />
                <p className="text-sm font-bold text-white uppercase tracking-wider">Trajectory Optimal</p>
                <p className="text-[9px] text-[#D4AF7A] font-bold uppercase tracking-widest mt-1">
                  Zero Regrets Predicted
                </p>
              </div>
            )}
          </div>

          {/* Time Leak Detector */}
          <div className="rounded-3xl liquid-glass p-6 shadow-2xl flex flex-col gap-5 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-white">
              <Clock className="size-4 text-[#D4AF7A]" /> Time Leak Detector
            </h3>
            <p className="text-xs text-white/50 font-normal leading-relaxed">
              Analyzes focus sessions to detect paused timers & drifted focus.
            </p>

            <div className="flex items-end justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/45">Leakage Ratio</span>
                <span className={`text-3xl font-light mt-1 ${leakPercentage > 30 ? 'text-rose-400' : 'text-[#D4AF7A]'}`}>
                  {Math.round(leakPercentage)}%
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/45">Active</span>
                <span className="text-base font-semibold text-white/80">{Math.round(activeFocus / 60)}m</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/45">Paused</span>
                <span className="text-base font-semibold text-white/40">{Math.round(pausedFocus / 60)}m</span>
              </div>
            </div>

            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex mt-1 border border-white/5">
              <div className="bg-[#D4AF7A] h-full transition-all" style={{ width: `${100 - leakPercentage}%` }}></div>
              <div className="bg-rose-500 h-full transition-all" style={{ width: `${leakPercentage}%` }}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
