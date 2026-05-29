"use client";

import React, { useState, useMemo } from "react";
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
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-20 pointer-events-none rounded-full ${lifeScore >= 80 ? 'bg-emerald-500' : lifeScore >= 50 ? 'bg-indigo-500' : 'bg-rose-500'}`}></div>
        
        <div className="flex flex-col z-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5" /> Global Life Score
          </h2>
          <p className="text-xs text-slate-400 font-semibold max-w-sm leading-relaxed">
            A unified algorithmic assessment of your operational efficiency across Tasks, Finances, and Engineering focus.
          </p>
        </div>

        <div className="flex items-center gap-6 z-10">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">System Status</p>
            <p className={`text-lg font-black ${lifeScore >= 80 ? 'text-emerald-400' : lifeScore >= 50 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {lifeScore >= 80 ? 'OPTIMAL' : lifeScore >= 50 ? 'STABLE' : 'CRITICAL'}
            </p>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-black tracking-tighter text-white">{lifeScore}</span>
            <span className="text-xl font-bold text-slate-500">/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Missions & Reality Check */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Monthly Missions Board */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-lg flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white">
                <Target className="w-4 h-4 text-emerald-400" /> Monthly Macro-Missions
              </h3>
              <span className="text-[10px] font-bold text-slate-400 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                {completedMissions} / {currentMissions.length} COMPLETED
              </span>
            </div>

            <form onSubmit={handleAddMission} className="flex gap-2">
              <Input
                value={newMission}
                onChange={(e) => setNewMission(e.target.value)}
                placeholder="e.g., Ship SaaS MVP"
                className="bg-slate-950/50 border-white/20 text-xs rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white font-bold"
                required
              />
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold px-5">
                Lock Target
              </Button>
            </form>

            <div className="flex flex-col gap-2 mt-2">
              {currentMissions.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-white/10 rounded-xl bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  No active missions for {currentMonth}
                </div>
              ) : (
                currentMissions.map((mission) => (
                  <div key={mission.id} className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => store.toggleMissionStatus(mission.id)}
                        className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all ${
                          mission.status === "Completed"
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "border-slate-600 hover:border-emerald-500/50"
                        }`}
                      >
                        {mission.status === "Completed" && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                      <span className={`font-bold text-sm ${mission.status === "Completed" ? "text-slate-500 line-through" : "text-white"}`}>
                        {mission.title}
                      </span>
                    </div>
                    <button
                      onClick={() => store.deleteMission(mission.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reality vs Plan Matrix */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-lg flex flex-col gap-5">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white">
              <Activity className="w-4 h-4 text-indigo-400" /> Reality vs Plan Trajectory
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Planned Velocity</span>
                <span className="text-2xl font-black text-white flex items-center gap-2 mt-1">
                  100% <TrendingUp className="w-4 h-4 text-emerald-400" />
                </span>
                <p className="text-[9px] text-slate-500 font-semibold mt-1">Expected optimal execution</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Actual Velocity</span>
                <span className="text-2xl font-black text-white flex items-center gap-2 mt-1">
                  {Math.round(taskCompletionRate)}% {taskCompletionRate >= 80 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                </span>
                <p className="text-[9px] text-slate-500 font-semibold mt-1">Current real-world execution</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Warnings & Leaks */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Regret Prediction Engine */}
          <div className={`rounded-2xl border backdrop-blur-xl p-6 shadow-lg flex flex-col gap-4 relative overflow-hidden transition-all duration-500 ${
            isOffTrack 
              ? "bg-rose-950/30 border-rose-500/30 shadow-rose-900/20" 
              : "bg-slate-900/60 border-white/10"
          }`}>
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isOffTrack ? 'text-rose-400' : 'text-slate-300'}`}>
              <AlertTriangle className="w-4 h-4" /> Regret Prediction Engine
            </h3>
            
            {isOffTrack ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-rose-200 leading-relaxed">
                  ⚠️ Trajectory Warning: At your current velocity ({Math.round(taskCompletionRate)}%), you are mathematically projected to miss your monthly targets.
                </p>
                <p className="text-xs text-rose-400/80 font-semibold italic">
                  &ldquo;A year from now, you will wish you had started today.&rdquo;
                </p>
                <Button className="mt-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20">
                  Course Correct Now
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-center text-center py-4">
                <Zap className="w-8 h-8 text-emerald-400 mb-2" />
                <p className="text-sm font-bold text-emerald-100">Trajectory Optimal</p>
                <p className="text-[10px] text-emerald-400/70 font-semibold uppercase tracking-widest">
                  Zero Regrets Predicted
                </p>
              </div>
            )}
          </div>

          {/* Time Leak Detector */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 shadow-lg flex flex-col gap-5">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-white">
              <Clock className="w-4 h-4 text-orange-400" /> Time Leak Detector
            </h3>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Analyzes your focus sessions to detect wasted capital (paused timers & drifted focus).
            </p>

            <div className="flex items-end justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Leakage Ratio</span>
                <span className={`text-3xl font-black mt-1 ${leakPercentage > 30 ? 'text-rose-400' : 'text-orange-400'}`}>
                  {Math.round(leakPercentage)}%
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active</span>
                <span className="text-lg font-black text-emerald-400">{Math.round(activeFocus / 60)}m</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Paused</span>
                <span className="text-lg font-black text-rose-400">{Math.round(pausedFocus / 60)}m</span>
              </div>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex mt-1 border border-white/5">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${100 - leakPercentage}%` }}></div>
              <div className="bg-rose-500 h-full transition-all" style={{ width: `${leakPercentage}%` }}></div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
