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
      case 'high': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="flex flex-col size-full bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-md min-h-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-slate-950/40">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Check className="size-5 text-indigo-400" />
          Daily Execution
        </h2>
        
        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 w-8">{progress}%</span>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-[250px]">
        <AnimatePresence>
          {dailyTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                task.status === 'completed' 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <button type="button" 
                  onClick={() => toggleTask(task)}
                  className="flex-shrink-0 focus:outline-none transition-transform active:scale-90"
                >
                  {task.status === 'completed' ? (
                    <div className="size-5 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                      <Check className="size-3.5 text-emerald-400" />
                    </div>
                  ) : (
                    <div className="size-5 rounded-full border-2 border-slate-600 hover:border-indigo-400 transition-colors" />
                  )}
                </button>

                <div className="flex flex-col overflow-hidden">
                  <span className={`text-sm font-semibold truncate transition-all duration-300 ${
                    task.status === 'completed' ? 'text-slate-500 line-through decoration-emerald-500/50' : 'text-slate-200'
                  }`}>
                    {task.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 opacity-100 transition-opacity">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                
                {task.status !== 'completed' && (
                  <button type="button" 
                    onClick={() => startFocus(task.id)}
                    className="p-2.5 lg:p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 transition-colors cursor-pointer"
                    title="Focus Mode"
                  >
                    <Clock className="size-3.5" />
                  </button>
                )}
                
                <button type="button" 
                  onClick={() => deleteTask(task.id)}
                  className="p-2.5 lg:p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {dailyTasks.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 h-full">
            <AlertCircle className="size-8 opacity-20" />
            <p className="text-xs font-semibold">No active tasks for today.</p>
          </div>
        )}
      </div>

      {/* Add Task Input */}
      <div className="p-3 border-t border-white/10 bg-slate-950/50">
        <form onSubmit={handleAddTask} className="flex items-center gap-2">
          <input
            aria-label="New Task Title"
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent border-none text-sm font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none px-2"
          />
          
          <select 
            aria-label="New Task Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="bg-slate-900 border border-white/10 rounded-lg text-xs font-bold px-2 py-1.5 text-slate-400 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>

          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
          >
            <Plus className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
