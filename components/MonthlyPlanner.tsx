"use client";

import React, { useState } from "react";
import { useLifeStore } from "@/store/useLifeStore";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MonthlyPlanner() {
  const { events, addEvent, deleteEvent } = useLifeStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState("Task");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !selectedDate) return;

    addEvent({
      title: newEventTitle,
      date: selectedDate,
      category: newEventCategory,
    });
    setNewEventTitle("");
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => e.date === dateStr);
  };

  // Generate calendar grid
  const gridCells = [];
  
  // Empty cells before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    gridCells.push(<div key={`empty-${i}`} className="p-2 border border-white/5 bg-slate-950/20 opacity-30" />);
  }

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = getEventsForDate(dateStr);
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const isSelected = selectedDate === dateStr;

    gridCells.push(
      <button
        key={dateStr}
        onClick={() => setSelectedDate(dateStr)}
        className={`relative h-24 p-2 border transition-all flex flex-col text-left overflow-hidden ${
          isSelected 
            ? "border-indigo-500/50 bg-indigo-500/10 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]" 
            : isToday 
              ? "border-white/20 bg-slate-900/60" 
              : "border-white/5 bg-slate-950/40 hover:bg-slate-900/80 hover:border-white/10"
        }`}
      >
        <span className={`text-xs font-bold ${isToday ? "text-indigo-400" : "text-slate-400"}`}>
          {day}
        </span>
        
        <div className="flex-1 overflow-y-auto mt-1 flex flex-col gap-1 w-full no-scrollbar">
          {dayEvents.map(e => (
            <div key={e.id} className="text-[9px] font-semibold bg-white/10 px-1.5 py-0.5 rounded truncate text-slate-300">
              {e.title}
            </div>
          ))}
        </div>
      </button>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Calendar View */}
      <div className="flex-1 flex flex-col bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Monthly Planner
          </h2>
          <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-xl border border-white/5">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm tracking-widest uppercase min-w-[140px] text-center text-slate-200">
              {monthLabel}
            </span>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 rounded-xl overflow-hidden border border-white/10 bg-slate-950/80">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="p-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-900/50 border border-white/5">
              {d}
            </div>
          ))}
          {gridCells}
        </div>
      </div>

      {/* Side Panel for selected date */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full lg:w-80 flex flex-col bg-slate-900/80 border border-indigo-500/20 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 bg-indigo-500/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Selected Date</span>
                <h3 className="text-lg font-black text-white">
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
              </div>
              <button onClick={() => setSelectedDate(null)} className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 max-h-[300px] lg:max-h-none">
              {getEventsForDate(selectedDate).map(e => (
                <div key={e.id} className="p-3 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col gap-1 group">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{e.category}</span>
                    <button onClick={() => deleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{e.title}</p>
                </div>
              ))}
              
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center text-slate-500 text-xs font-semibold py-8">
                  No events for this day.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-slate-950/80">
              <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="Event or Reminder..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
                />
                <div className="flex items-center gap-2">
                  <select 
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value)}
                    className="flex-1 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold px-2 py-2 text-slate-400 focus:outline-none focus:border-indigo-500/50"
                  >
                    <option>Task</option>
                    <option>Goal</option>
                    <option>Note</option>
                    <option>Reminder</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!newEventTitle.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
