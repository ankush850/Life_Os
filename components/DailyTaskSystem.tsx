"use client";

import React, { useState, useMemo } from "react";
import { useLifeStore, Task } from "@/store/useLifeStore";
import { Plus, Check, Trash2, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyTaskSystem() {
  const { tasks, addTask, updateTask, deleteTask, setFocusTaskId, updateSettings } = useLifeStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const today = new Date().toISOString().split('T')[0];
  
  const dailyTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' || t.completedAt === today);
  }, [tasks, today]);

  const completedCount = dailyTasks.filter(t => t.status === 'completed').length;
  const progress = dailyTasks.length === 0 ? 0 : Math.round((completedCount / dailyTasks.length) * 100);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    addTask({
      title: newTaskTitle,
      category: 'Personal',
      priority,
      status: 'pending',
      due_date: today,
    });
    setNewTaskTitle("");
  };

  const toggleTask = (task: Task) => {
    const isCompleted = task.status === 'completed';
    updateTask(task.id, { 
      status: isCompleted ? 'pending' : 'completed',
      completedAt: isCompleted ? undefined : today
    });
  };

  const startFocus = (taskId: string) => {
    setFocusTaskId(taskId);
    updateSettings({ isFocusMode: true });
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'high': return 'text-rose-450 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-[#D4AF7A] bg-[#D4AF7A]/10 border-[#D4AF7A]/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="flex flex-col size-full rounded-3xl liquid-glass overflow-hidden shadow-2xl min-h-[400px]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/2">
        <h2 className="text-xl font-light text-white flex items-center gap-2.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          <Check className="size-5 text-[#D4AF7A]" />
          Daily Rituals
        </h2>
        
        {/* Progress Bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-[#D4AF7A] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] font-bold text-[#D4AF7A] w-8 text-right tracking-widest">{progress}%</span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-3 min-h-[250px] no-scrollbar">
        <AnimatePresence>
          {dailyTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                task.status === 'completed' 
                  ? 'bg-white/1 border-[#D4AF7A]/25 opacity-70' 
                  : 'bg-white/3 border-white/5 hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <button type="button" 
                  onClick={() => toggleTask(task)}
                  className="flex-shrink-0 focus:outline-none transition-transform active:scale-90 p-2.5 -m-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  {task.status === 'completed' ? (
                    <div className="size-5 rounded-full bg-[#D4AF7A] flex items-center justify-center border border-[#D4AF7A]">
                      <Check className="size-3 text-[#071B33] stroke-[3]" />
                    </div>
                  ) : (
                    <div className="size-5 rounded-full border-2 border-white/30 hover:border-[#D4AF7A] transition-colors" />
                  )}
                </button>

                <div className="flex flex-col overflow-hidden text-left">
                  <span className={`text-sm font-medium truncate transition-all duration-300 ${
                    task.status === 'completed' ? 'text-white/40 line-through decoration-[#D4AF7A]/50 font-light' : 'text-white'
                  }`}>
                    {task.title}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity">
                <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                
                {task.status !== 'completed' && (
                  <button type="button" 
                    onClick={() => startFocus(task.id)}
                    className="size-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-[#D4AF7A] hover:bg-white/10 transition-colors cursor-pointer"
                    title="Focus Session"
                  >
                    <Clock className="size-3.5" />
                  </button>
                )}
                
                <button type="button" 
                  onClick={() => deleteTask(task.id)}
                  className="size-8 flex items-center justify-center rounded-full bg-rose-500/5 border border-rose-500/10 text-rose-450 hover:bg-rose-500/15 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {dailyTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-2 h-full">
            <AlertCircle className="size-8 opacity-25" />
            <p className="text-xs tracking-widest uppercase font-semibold">Sanctuary is clean.</p>
          </div>
        )}
      </div>

      {/* Add Task Input */}
      <div className="p-4 border-t border-white/5 bg-white/2">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            aria-label="New Ritual Title"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Declare a new ritual..."
            className="w-full bg-white/3 border border-white/5 focus:border-[#D4AF7A] rounded-xl py-3 px-4 text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none transition-all"
          />
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <select 
              aria-label="Ritual Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full sm:w-auto bg-[#071b33] border border-white/10 rounded-xl text-xs font-bold px-3 py-3 text-white/60 focus:outline-none focus:border-[#D4AF7A] cursor-pointer min-h-[44px]"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="w-full sm:w-11 h-11 rounded-xl bg-[#D4AF7A] disabled:bg-white/5 hover:bg-[#E7CBA9] text-[#071B33] disabled:text-white/30 flex items-center justify-center disabled:opacity-50 transition-all cursor-pointer"
            >
              <Plus className="size-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
