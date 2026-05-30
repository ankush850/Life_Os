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
    <div className="flex flex-col gap-6 w-full text-white/80 font-mono select-none text-left">
      
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="size-5 text-[#D4AF7A]" />
            CREATOR LAB v1.0
          </h2>
          <p className="text-[10px] text-white/40 font-semibold mt-1">
            Console locked // Live compilation status OK // Theme: Executive Slate & Gold Monospace
          </p>
        </div>
        <div className="text-[9px] border border-[#D4AF7A]/30 px-3 py-1.5 rounded-full bg-[#D4AF7A]/5 uppercase tracking-widest text-[#D4AF7A]">
          SYS STATUS: DEV-ACTIVE
        </div>
      </div>

      {/* GitHub-style Heatmap */}
      <div className="p-5 rounded-3xl liquid-glass shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF7A]">
            <GitCommit className="size-4 text-[#D4AF7A]" />
            Target Check-in Contribution Map
          </div>
          <span className="text-[9px] text-white/30">84 Day Consistency Telemetry</span>
        </div>

        {/* Heatmap Grid Wrapper */}
        <div className="flex items-start gap-3 overflow-x-auto py-2 no-scrollbar">
          {/* Weekday indicator column */}
          <div className="grid grid-rows-7 gap-1 text-[8px] uppercase font-bold text-white/20 h-[104px] pt-1">
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
                  let bgColor = "bg-white/5 border border-white/5";
                  let hoverShadow = "";
                  
                  if (day.targetText) {
                    if (day.completed) {
                      bgColor = "bg-[#D4AF7A] border border-[#E7CBA9] shadow-[0_0_8px_rgba(212,175,122,0.3)]";
                      hoverShadow = "group-hover:shadow-[0_0_12px_rgba(212,175,122,0.6)]";
                    } else {
                      bgColor = "bg-[#D4AF7A]/25 border border-[#D4AF7A]/30 text-[#D4AF7A]";
                    }
                  }

                  return (
                    <div key={day.dateStr || `day-${dIdx}`} className="relative group">
                      <div
                        className={`size-3.5 rounded-[2px] transition-all cursor-pointer ${bgColor} ${hoverShadow}`}
                      />
                      
                      {/* Custom Monospace Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 bg-[#071b33] border border-[#D4AF7A]/35 text-[9px] p-2.5 rounded-lg whitespace-nowrap text-left text-white shadow-2xl">
                        <p className="font-bold border-b border-white/10 pb-0.5 text-white">{day.dateStr}</p>
                        {day.targetText ? (
                          <p className="mt-1 max-w-[150px] truncate text-white/80">
                            🎯 {day.targetText} [{day.completed ? "DONE" : "PENDING"}]
                          </p>
                        ) : (
                          <p className="mt-1 text-white/30 italic">No target recorded</p>
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
        <div className="flex justify-between items-center text-[8px] text-white/35 mt-4 border-t border-white/5 pt-3">
          <span>{heatmapDays[0]?.dateStr} to {heatmapDays[heatmapDays.length-1]?.dateStr}</span>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="size-2.5 rounded-[1px] bg-white/5 border border-white/5"></div>
            <div className="size-2.5 rounded-[1px] bg-[#D4AF7A]/25 border border-[#D4AF7A]/30"></div>
            <div className="size-2.5 rounded-[1px] bg-[#D4AF7A] border border-[#E7CBA9]"></div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* DSA Tracker & Language Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: LeetCode DSA Tracker (Col 7) */}
        <div className="lg:col-span-7 rounded-3xl liquid-glass p-6 flex flex-col gap-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[#D4AF7A]">
              <Cpu className="size-4.5" /> DSA Problem Log
            </h3>
            <span className="text-[9px] text-white/40">Total Solved: {dsaStats.total}</span>
          </div>

          {/* Quick Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-white/2 border border-white/5 p-3.5 rounded-2xl">
            <div>
              <span className="text-white/60">EASY</span>
              <p className="font-bold text-white text-lg mt-0.5">{dsaStats.easy}</p>
            </div>
            <div className="border-x border-white/10">
              <span className="text-[#D4AF7A]">MEDIUM</span>
              <p className="font-bold text-white text-lg mt-0.5">{dsaStats.medium}</p>
            </div>
            <div>
              <span className="text-rose-400">HARD</span>
              <p className="font-bold text-white text-lg mt-0.5">{dsaStats.hard}</p>
            </div>
          </div>

          {/* Problem Log Form */}
          <form onSubmit={handleAddDsa} className="flex gap-2 border-t border-white/5 pt-3 mt-1">
            <Input
              value={dsaTitle}
              onChange={(e) => setDsaTitle(e.target.value)}
              placeholder="e.g. Reverse Linked List II"
              className="bg-white/3 border-white/10 text-white text-xs rounded-xl placeholder:text-white/20 focus:border-[#D4AF7A]/50 focus:ring-0"
              required
            />
            <Select
              value={dsaDifficulty}
              onValueChange={(val) => setDsaDifficulty((val as "Easy" | "Medium" | "Hard") || "Medium")}
            >
              <SelectTrigger className="bg-white/3 border border-white/10 text-white text-xs rounded-xl w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#071b33] border border-white/10 text-white font-mono">
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] font-bold px-5 py-2 rounded-full uppercase text-xs tracking-wider cursor-pointer"
            >
              Log
            </Button>
          </form>

          {/* Log List */}
          <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1 mt-2 no-scrollbar">
            {store.engineeringDsa.length === 0 ? (
              <div className="text-center py-6 text-white/30 text-[9px] uppercase font-bold tracking-widest border border-dashed border-white/10 rounded-2xl italic">
                Awaiting DSA Solves // Terminal Empty
              </div>
            ) : (
              [...store.engineeringDsa].reverse().map((problem) => (
                <div
                  key={problem.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/5 text-xs hover:border-[#D4AF7A]/30 transition-all group"
                >
                  <div className="flex items-center gap-2.5 max-w-[70%]">
                    <span className="size-1.5 rounded-full bg-[#D4AF7A] animate-pulse"></span>
                    <span className="text-white truncate font-semibold" title={problem.title}>
                      {problem.title}
                    </span>
                    <span className="text-[8px] text-white/30 font-mono">{problem.date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        problem.difficulty === "Easy"
                          ? "bg-white/5 border border-white/10 text-white/60"
                          : problem.difficulty === "Medium"
                          ? "bg-[#D4AF7A]/10 border border-[#D4AF7A]/30 text-[#D4AF7A]"
                          : "bg-rose-500/10 border border-rose-500/30 text-rose-450"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                    <button type="button"
                      onClick={() => store.deleteDsaProblem(problem.id)}
                      className="opacity-0 group-hover:opacity-100 size-8 flex items-center justify-center rounded-full hover:bg-rose-500/10 text-rose-450 transition-all cursor-pointer"
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
        <div className="lg:col-span-5 rounded-3xl liquid-glass p-6 flex flex-col gap-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[#D4AF7A]">
              <Code className="size-4.5" /> Languages Cockpit
            </h3>
            <span className="text-[9px] text-white/40">Hours Tracking</span>
          </div>

          {/* Languages List */}
          <div className="space-y-4">
            {store.engineeringLanguages.map((lang) => (
              <div key={lang.name} className="flex flex-col gap-1.5 text-[10px] font-bold uppercase">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold tracking-wider">{lang.name}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#D4AF7A] text-[9px] bg-[#D4AF7A]/10 px-2 py-0.5 rounded-full border border-[#D4AF7A]/20">{lang.level}</span>
                    <span className="text-white/40">({lang.hours}h)</span>
                    <div className="flex gap-1">
                      <button type="button"
                        onClick={() => handleAdjustLanguageHours(lang.name, -1)}
                        disabled={lang.hours <= 0}
                        className="text-white/40 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <MinusCircle className="size-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => handleAdjustLanguageHours(lang.name, 1)}
                        className="text-[#D4AF7A] hover:text-[#E7CBA9] cursor-pointer"
                      >
                        <PlusCircle className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom progress bar */}
                <div className="w-full bg-white/5 border border-white/5 h-2 rounded-full overflow-hidden relative flex">
                  <div
                    className="bg-[#D4AF7A] h-full transition-all duration-300 shadow-[0_0_8px_rgba(212,175,122,0.3)]"
                    style={{ width: `${Math.min(100, (lang.hours / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Mastery Scores */}
      <div className="p-5 rounded-3xl liquid-glass shadow-2xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[#D4AF7A]">
            <BookOpen className="size-4.5" /> Topic Mastery Assessment
          </h3>
          <span className="text-[9px] text-white/40">Computer Science Mastery</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {store.engineeringMastery.map((m) => (
            <div
              key={m.topic}
              className="p-4 rounded-2xl border border-white/5 bg-white/2 hover:border-[#D4AF7A]/30 transition-all flex flex-col gap-2.5 items-center text-center"
            >
              <span className="text-[9px] font-bold text-[#D4AF7A] uppercase tracking-wider h-6 flex items-center justify-center">
                {m.topic}
              </span>
              <span className="text-xl font-bold text-white tracking-tight">{m.score}%</span>

              {/* Adjust Score Buttons */}
              <div className="flex items-center gap-2.5 mt-1">
                <button type="button"
                  onClick={() => handleAdjustMastery(m.topic, m.score - 5)}
                  disabled={m.score <= 0}
                  className="p-0.5 text-white/40 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  <MinusCircle className="size-4" />
                </button>
                <button type="button"
                  onClick={() => handleAdjustMastery(m.topic, m.score + 5)}
                  disabled={m.score >= 100}
                  className="p-0.5 text-[#D4AF7A] hover:text-[#E7CBA9] disabled:opacity-30 cursor-pointer"
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
        <div className="rounded-3xl liquid-glass p-6 flex flex-col gap-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-[#D4AF7A]">
              <BookMarked className="size-4.5" /> Focus Debt Ledger
            </h3>
            <span className="text-[9px] text-white/40">Courses & Books</span>
          </div>

          <form onSubmit={handleAddCourse} className="flex gap-2">
            <Input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. Advanced React Patterns"
              className="bg-white/3 border-white/10 text-white text-xs rounded-xl placeholder:text-white/20 focus:border-[#D4AF7A]/50 focus:ring-0"
              required
            />
            <Button
              type="submit"
              className="bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] font-bold px-5 py-2 rounded-full uppercase text-xs tracking-wider cursor-pointer"
            >
              Start
            </Button>
          </form>

          <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1 mt-2 no-scrollbar">
            {totalCourses === 0 ? (
              <div className="text-center py-4 text-white/30 text-[9px] uppercase font-bold tracking-widest border border-dashed border-white/10 rounded-2xl italic">
                No active commitments
              </div>
            ) : (
              [...(store.engineeringCourses || [])].reverse().map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/5 text-xs hover:border-[#D4AF7A]/30 transition-all group"
                >
                  <div className="flex items-center gap-2 max-w-[70%] text-left">
                    <button type="button"
                      onClick={() => store.toggleCourseStatus(course.id)}
                      className={`size-4 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                        course.status === "Finished" 
                          ? "bg-[#D4AF7A]/25 border-[#D4AF7A] text-[#D4AF7A]" 
                          : "border-white/20 hover:border-[#D4AF7A]"
                      }`}
                    >
                      {course.status === "Finished" && <CheckCircle className="size-3 text-[#D4AF7A]" />}
                    </button>
                    <span className={`truncate font-semibold ${course.status === "Finished" ? "text-white/30 line-through" : "text-white"}`} title={course.title}>
                      {course.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${course.status === "Finished" ? "bg-[#D4AF7A]/10 text-[#D4AF7A] border border-[#D4AF7A]/20" : "bg-white/5 text-white/40"}`}>
                      {course.status}
                    </span>
                    <button type="button"
                      onClick={() => store.deleteCourse(course.id)}
                      className="opacity-0 group-hover:opacity-100 size-8 flex items-center justify-center rounded-full hover:bg-rose-500/10 text-rose-455 transition-all cursor-pointer"
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
        <div className="rounded-3xl liquid-glass p-6 flex flex-col justify-center items-center gap-4 shadow-2xl min-h-[220px] relative overflow-hidden">
          {unfinishedCourses > 3 && (
            <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
          )}
          <span className="text-[9px] font-bold text-white/45 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            Focus Score
          </span>
          
          <div className="flex items-baseline gap-2">
            <h3 className={`text-5xl font-light tracking-tight ${focusScore < 50 ? 'text-rose-400' : 'text-[#D4AF7A]'}`}>
              {focusScore}%
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-white/30 mt-2">
            <div className="flex flex-col items-center">
              <span className="text-white text-lg font-bold">{finishedCourses}</span>
              <span className="text-[9px] uppercase tracking-widest mt-1">Completed</span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-rose-450 text-lg font-bold">{unfinishedCourses}</span>
              <span className="text-[9px] uppercase tracking-widest mt-1">Unfinished</span>
            </div>
          </div>

          <p className="text-[10px] font-semibold text-white/40 mt-2 text-center max-w-[80%]">
            {unfinishedCourses > 3 
              ? <span className="text-rose-400 flex items-center justify-center gap-1"><AlertTriangle className="size-3"/> High Focus Debt! Finish pending commitments first.</span>
              : "Focus Debt is manageable. Consistency is key."}
          </p>
        </div>
      </div>

    </div>
  );
}
