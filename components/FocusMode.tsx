"use client";

import React, { useEffect } from "react";
import { useLifeStore } from "@/store/useLifeStore";
import { X, Play, Pause, Square, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FocusMode() {
  const { 
    settings, 
    updateSettings,
    focusTaskId,
    tasks,
    updateTask,
    focusSeconds,
    setFocusSeconds,
    isFocusRunning,
    setIsFocusRunning,
    resetFocusTimer
  } = useLifeStore();

  const activeTask = tasks.find(t => t.id === focusTaskId);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFocusRunning && settings.isFocusMode) {
      interval = setInterval(() => {
        setFocusSeconds(useLifeStore.getState().focusSeconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, settings.isFocusMode, setFocusSeconds]);

  if (!settings.isFocusMode) return null;

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleClose = () => {
    updateSettings({ isFocusMode: false });
    setIsFocusRunning(false);
  };

  const handleComplete = () => {
    if (activeTask) {
      updateTask(activeTask.id, { 
        status: 'completed',
        completedAt: new Date().toISOString().split('T')[0]
      });
    }
    resetFocusTimer();
    updateSettings({ isFocusMode: false });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col items-center justify-center p-8"
      >
        <button type="button" 
          onClick={handleClose}
          className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="size-6" />
        </button>

        <div className="flex flex-col items-center max-w-2xl w-full text-center space-y-12">
          {/* Active Task Info */}
          <div className="space-y-4">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-indigo-400 font-extrabold tracking-[0.3em] uppercase text-sm"
            >
              Focus Mode
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-black text-white"
            >
              {activeTask ? activeTask.title : "Unassigned Focus Session"}
            </motion.h1>
          </div>

          {/* Timer */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-[8rem] md:text-[12rem] font-mono font-black tracking-tighter leading-none text-indigo-400 drop-shadow-2xl"
          >
            {formatTime(focusSeconds)}
          </motion.div>

          {/* Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6"
          >
            <button type="button"
              onClick={() => setIsFocusRunning(!isFocusRunning)}
              className="size-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20 hover:bg-white/20 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              {isFocusRunning ? (
                <Pause className="size-8 text-white fill-white" />
              ) : (
                <Play className="size-8 text-white fill-white translate-x-1" />
              )}
            </button>

            <button type="button"
              onClick={resetFocusTimer}
              className="size-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400 transition-all text-slate-400"
              title="Reset Timer"
            >
              <Square className="size-6" />
            </button>

            {activeTask && activeTask.status !== 'completed' && (
              <button type="button"
                onClick={handleComplete}
                className="size-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 hover:bg-emerald-500/40 hover:scale-105 transition-all text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                title="Complete Task"
              >
                <CheckCircle2 className="size-10" />
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
