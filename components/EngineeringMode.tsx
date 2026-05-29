"use client";

import React, { useState, useMemo } from "react";
import { useLifeStore } from "@/store/useLifeStore";
import {
  Terminal,
  Cpu,
  Code,
  BookOpen,
  Trash2,
  GitCommit,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  BookMarked,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EngineeringMode() {
  const store = useLifeStore();

  // DSA form inputs
  const [dsaTitle, setDsaTitle] = useState("");
  const [dsaDifficulty, setDsaDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Focus Debt state
  const [courseTitle, setCourseTitle] = useState("");

  // Heatmap helper: Get array of the last 12 weeks (84 days)
  const heatmapDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; completed: boolean; targetText: string }[] = [];
    const today = new Date();
    
    // We want the grid to end on today, going back 83 days
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const targetInfo = store.dailyTargets[dateStr];
      
      days.push({
        dateStr,
        dayNum: d.getDate(),
        completed: targetInfo?.completed || false,
        targetText: targetInfo?.target || "",
      });
    }
    return days;
  }, [store.dailyTargets]);

  // Group heatmap days into 12 columns (weeks) of 7 rows
  const heatmapWeeks = useMemo(() => {
    const weeks: typeof heatmapDays[] = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      weeks.push(heatmapDays.slice(i, i + 7));
    }
    return weeks;
  }, [heatmapDays]);

  // DSA analytics
  const dsaStats = useMemo(() => {
    const total = store.engineeringDsa.length;
    const easy = store.engineeringDsa.filter((p) => p.difficulty === "Easy").length;
    const medium = store.engineeringDsa.filter((p) => p.difficulty === "Medium").length;
    const hard = store.engineeringDsa.filter((p) => p.difficulty === "Hard").length;
    return { total, easy, medium, hard };
  }, [store.engineeringDsa]);

  const handleAddDsa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dsaTitle) return;
    store.addDsaProblem(dsaTitle, dsaDifficulty);
    setDsaTitle("");
  };

  const handleAdjustLanguageHours = (langName: string, amount: number) => {
    store.updateLanguageHours(langName, amount);
  };

  const handleAdjustMastery = (topic: string, score: number) => {
    store.updateMasteryScore(topic, score);
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle) return;
    store.addCourse(courseTitle);
    setCourseTitle("");
  };

  const totalCourses = store.engineeringCourses?.length || 0;
  const finishedCourses = store.engineeringCourses?.filter(c => c.status === "Finished").length || 0;
  const unfinishedCourses = totalCourses - finishedCourses;
  const focusScore = totalCourses > 0 ? Math.round((finishedCourses / totalCourses) * 100) : 100;

  return (
    <div className="flex flex-col gap-6 w-full text-emerald-400 font-mono select-none">
      
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-500/20 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Terminal className="size-5 text-emerald-400" />
            ENGINEERING MODE v1.0
          </h2>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">
            Console locked // Live compilation status OK // Theme: Neon Monospace
          </p>
        </div>
        <div className="text-[9px] border border-emerald-500/30 px-3 py-1.5 rounded bg-emerald-950/20 uppercase tracking-widest text-emerald-300 animate-pulse">
          SYS STATUS: DEV-ACTIVE
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-slate-950/80 shadow-lg shadow-emerald-950/10">
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
            <GitCommit className="size-4 text-emerald-400" />
            Target Check-in Contribution Map
          </div>
          <span className="text-[9px] text-emerald-600">84 Day Consistency Telemetry</span>
        </div>

        {/* Heatmap Grid Wrapper */}
        <div className="flex items-start gap-3 overflow-x-auto py-2">
          {/* Weekday indicator column */}
          <div className="grid grid-rows-7 gap-1 text-[8px] uppercase font-bold text-emerald-700 h-[104px] pt-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Columns (Weeks) */}
          <div className="flex gap-1">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={`week-${wIdx}`} className="grid grid-rows-7 gap-1">
                {week.map((day, dIdx) => {
                  let bgColor = "bg-slate-900/50 border border-emerald-950/25";
                  let hoverShadow = "";
                  
                  if (day.targetText) {
                    if (day.completed) {
                      bgColor = "bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]";
                      hoverShadow = "group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)]";
                    } else {
                      bgColor = "bg-emerald-900/40 border border-emerald-800/45 text-emerald-600";
                    }
                  }

                  return (
                    <div key={day.dateStr || `day-${dIdx}`} className="relative group">
                      <div
                        className={`size-3.5 rounded-[1px] transition-all cursor-pointer ${bgColor} ${hoverShadow}`}
                      />
                      
                      {/* Custom Monospace Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-slate-950 border border-emerald-500/35 text-[9px] p-2 rounded whitespace-nowrap text-left text-emerald-300 shadow-xl">
                        <p className="font-bold border-b border-emerald-500/20 pb-0.5 text-white">{day.dateStr}</p>
                        {day.targetText ? (
                          <p className="mt-1 max-w-[150px] truncate">
                            🎯 {day.targetText} [{day.completed ? "DONE" : "PENDING"}]
                          </p>
                        ) : (
                          <p className="mt-1 text-emerald-600 italic">No target recorded</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center text-[8px] text-emerald-600 mt-4 border-t border-emerald-500/10 pt-3">
          <span>{heatmapDays[0]?.dateStr} to {heatmapDays[heatmapDays.length-1]?.dateStr}</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="size-2.5 rounded-[1px] bg-slate-900 border border-emerald-950/50"></div>
            <div className="size-2.5 rounded-[1px] bg-emerald-900/40 border border-emerald-800/45"></div>
            <div className="size-2.5 rounded-[1px] bg-emerald-400 border border-emerald-300"></div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* DSA Tracker & Language Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: LeetCode DSA Tracker (Col 7) */}
        <div className="lg:col-span-7 rounded-2xl border border-emerald-500/20 bg-slate-950/80 p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <Cpu className="size-4.5" /> DSA Problem Log
            </h3>
            <span className="text-[9px] text-emerald-600">Total Solved: {dsaStats.total}</span>
          </div>

          {/* Quick Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-emerald-950/10 border border-emerald-500/10 p-2 rounded">
            <div>
              <span className="text-emerald-500">EASY</span>
              <p className="font-extrabold text-white text-lg">{dsaStats.easy}</p>
            </div>
            <div className="border-x border-emerald-500/20">
              <span className="text-yellow-500">MEDIUM</span>
              <p className="font-extrabold text-white text-lg">{dsaStats.medium}</p>
            </div>
            <div>
              <span className="text-rose-500">HARD</span>
              <p className="font-extrabold text-white text-lg">{dsaStats.hard}</p>
            </div>
          </div>

          {/* Problem Log Form */}
          <form onSubmit={handleAddDsa} className="flex gap-2 border-t border-emerald-500/10 pt-3 mt-1">
            <Input
              value={dsaTitle}
              onChange={(e) => setDsaTitle(e.target.value)}
              placeholder="e.g. Reverse Linked List II"
              className="bg-slate-950/80 border-emerald-500/20 text-emerald-200 text-xs rounded placeholder:text-emerald-950 focus:border-emerald-500"
              required
            />
            <Select
              value={dsaDifficulty}
              onValueChange={(val) => setDsaDifficulty((val as "Easy" | "Medium" | "Hard") || "Medium")}
            >
              <SelectTrigger className="bg-slate-950/80 border-emerald-500/20 text-emerald-200 text-xs rounded w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-950 border-emerald-500/20 text-emerald-200 font-mono">
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="bg-emerald-900/30 border border-emerald-500/20 hover:bg-emerald-900/50 text-emerald-300 font-bold px-4 py-2"
            >
              Log
            </Button>
          </form>

          {/* Log List */}
          <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1 mt-2">
            {store.engineeringDsa.length === 0 ? (
              <div className="text-center py-6 text-emerald-900/60 text-[9px] uppercase font-bold tracking-widest border border-dashed border-emerald-900/20 rounded">
                Awaiting DSA Solves // Terminal Empty
              </div>
            ) : (
              [...store.engineeringDsa].reverse().map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between p-2.5 rounded bg-emerald-950/10 border border-emerald-500/5 text-xs hover:bg-emerald-950/20 transition-all group"
                >
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-white truncate font-semibold" title={problem.title}>
                      {problem.title}
                    </span>
                    <span className="text-[8px] text-emerald-600 font-mono">{problem.date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : problem.difficulty === "Medium"
                          ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
                          : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <button type="button"
                      onClick={() => store.deleteDsaProblem(problem.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/5 text-rose-400 transition-all"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Language Hours Tracker (Col 5) */}
        <div className="lg:col-span-5 rounded-2xl border border-emerald-500/20 bg-slate-950/80 p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <Code className="size-4.5" /> Languages Cockpit
            </h3>
            <span className="text-[9px] text-emerald-600">Hours Tracking</span>
          </div>

          {/* Languages List */}
          <div className="space-y-4">
            {store.engineeringLanguages.map((lang) => (
              <div key={lang.name} className="flex flex-col gap-1.5 text-[10px] font-bold uppercase">
                <div className="flex justify-between items-center">
                  <span className="text-white font-black">{lang.name}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500">{lang.level}</span>
                    <span className="text-slate-400">({lang.hours}h)</span>
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => handleAdjustLanguageHours(lang.name, -1)}
                        disabled={lang.hours <= 0}
                        className="text-emerald-500 hover:text-emerald-400 disabled:opacity-30"
                      >
                        <MinusCircle className="size-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => handleAdjustLanguageHours(lang.name, 1)}
                        className="text-emerald-500 hover:text-emerald-400"
                      >
                        <PlusCircle className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Simulated Custom CSS Green Progress bar */}
                <div className="w-full bg-emerald-950/30 border border-emerald-500/10 h-2.5 rounded overflow-hidden relative flex">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    style={{ width: `${Math.min(100, (lang.hours / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Mastery Scores */}
      <div className="p-5 rounded-2xl border border-emerald-500/20 bg-slate-950/80 shadow-lg flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
          <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="size-4.5" /> Topic Mastery Assessment
          </h3>
          <span className="text-[9px] text-emerald-600">Computer Science Mastery</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {store.engineeringMastery.map((m) => (
            <div
              key={m.topic}
              className="p-3.5 rounded border border-emerald-500/10 bg-emerald-950/5 hover:border-emerald-500/20 transition-all flex flex-col gap-2 items-center text-center"
            >
              <span className="text-[9px] font-black text-emerald-500 uppercase h-6 flex items-center justify-center">
                {m.topic}
              </span>
              <span className="text-xl font-bold text-white tracking-tight">{m.score}%</span>

              {/* Adjust Score Buttons */}
              <div className="flex items-center gap-2.5 mt-1">
                <button type="button"
                  onClick={() => handleAdjustMastery(m.topic, m.score - 5)}
                  disabled={m.score <= 0}
                  className="p-0.5 text-emerald-600 hover:text-emerald-400 disabled:opacity-30"
                >
                  <MinusCircle className="size-4" />
                </button>
                <button type="button"
                  onClick={() => handleAdjustMastery(m.topic, m.score + 5)}
                  disabled={m.score >= 100}
                  className="p-0.5 text-emerald-600 hover:text-emerald-400 disabled:opacity-30"
                >
                  <PlusCircle className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Debt Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Tracker Form & List */}
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/80 p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-emerald-500/10 pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <BookMarked className="size-4.5" /> Focus Debt Ledger
            </h3>
            <span className="text-[9px] text-emerald-600">Courses & Books</span>
          </div>

          <form onSubmit={handleAddCourse} className="flex gap-2">
            <Input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. Advanced React Patterns"
              className="bg-slate-950/80 border-emerald-500/20 text-emerald-200 text-xs rounded placeholder:text-emerald-950 focus:border-emerald-500"
              required
            />
            <Button
              type="submit"
              className="bg-emerald-900/30 border border-emerald-500/20 hover:bg-emerald-900/50 text-emerald-300 font-bold px-4 py-2"
            >
              Start
            </Button>
          </form>

          <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1 mt-2">
            {totalCourses === 0 ? (
              <div className="text-center py-4 text-emerald-900/60 text-[9px] uppercase font-bold tracking-widest border border-dashed border-emerald-900/20 rounded">
                No active commitments
              </div>
            ) : (
              [...(store.engineeringCourses || [])].reverse().map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-2.5 rounded bg-emerald-950/10 border border-emerald-500/5 text-xs hover:bg-emerald-950/20 transition-all group"
                >
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <button type="button"
                      onClick={() => store.toggleCourseStatus(course.id)}
                      className={`size-4 flex items-center justify-center rounded border ${
                        course.status === "Finished" 
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                          : "border-emerald-900 hover:border-emerald-500/50"
                      }`}
                    >
                      {course.status === "Finished" && <CheckCircle className="size-3" />}
                    </button>
                    <span className={`truncate font-semibold ${course.status === "Finished" ? "text-emerald-700 line-through" : "text-white"}`} title={course.title}>
                      {course.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${course.status === "Finished" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {course.status}
                    </span>
                    <button type="button"
                      onClick={() => store.deleteCourse(course.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/5 text-rose-400 transition-all"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/80 p-5 flex flex-col justify-center items-center gap-4 shadow-lg min-h-[220px] relative overflow-hidden">
          {unfinishedCourses > 3 && (
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
          )}
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            Focus Score
          </span>
          
          <div className="flex items-baseline gap-2">
            <h3 className={`text-5xl font-black tracking-tighter ${focusScore < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {focusScore}%
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-emerald-600 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-white text-lg font-black">{finishedCourses}</span>
              <span className="text-[9px] uppercase tracking-wider">Completed</span>
            </div>
            <div className="h-8 w-px bg-emerald-500/20"></div>
            <div className="flex flex-col items-center">
              <span className="text-rose-400 text-lg font-black">{unfinishedCourses}</span>
              <span className="text-[9px] uppercase tracking-wider">Unfinished</span>
            </div>
          </div>

          <p className="text-[10px] font-semibold text-emerald-500 mt-2 text-center max-w-[80%]">
            {unfinishedCourses > 3 
              ? <span className="text-rose-400 flex items-center justify-center gap-1"><AlertTriangle className="size-3"/> High Focus Debt! Finish pending courses before starting new ones.</span>
              : "Focus Debt is manageable. Consistency is key."}
          </p>
        </div>
      </div>

    </div>
  );
}
