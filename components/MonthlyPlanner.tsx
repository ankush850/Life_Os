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
      <button type="button"
        key={dateStr}
        onClick={() => setSelectedDate(dateStr)}
        className={`relative h-12 sm:h-24 p-1.5 sm:p-2 border transition-all flex flex-col text-left overflow-hidden cursor-pointer ${
          isSelected 
            ? "border-[#D4AF7A]/50 bg-[#D4AF7A]/10 shadow-[inset_0_0_15px_rgba(212,175,122,0.15)]" 
            : isToday 
              ? "border-white/20 bg-white/5" 
              : "border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <span className={`text-[10px] sm:text-xs font-bold ${isToday ? "text-[#D4AF7A]" : "text-white/40"}`}>
          {day}
        </span>
        
        {/* Desktop Event Title List */}
        <div className="hidden sm:flex flex-1 overflow-y-auto mt-1 flex-col gap-1 w-full no-scrollbar">
          {dayEvents.map(e => (
            <div key={e.id} className="text-[9px] font-semibold bg-white/5 px-1.5 py-0.5 rounded-lg truncate text-white/70 border border-white/5">
              {e.title}
            </div>
          ))}
        </div>

        {/* Mobile Event Indicator Dots */}
        <div className="flex sm:hidden justify-center gap-0.5 mt-auto w-full">
          {dayEvents.slice(0, 3).map(e => (
            <div key={e.id} className="size-1 rounded-full bg-[#D4AF7A]" />
          ))}
          {dayEvents.length > 3 && (
            <div className="size-1 rounded-full bg-white/30" />
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Calendar View */}
      <div className="flex-1 flex flex-col liquid-glass rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-white flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <CalendarIcon className="size-5 text-[#D4AF7A]" />
            Monthly Planner
          </h2>
          <div className="flex items-center gap-2 bg-white/2 p-1 rounded-full border border-white/5">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer">
              <ChevronLeft className="size-4" />
            </button>
            <span className="font-bold text-xs tracking-widest uppercase min-w-[140px] text-center text-white/80">
              {monthLabel}
            </span>
            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors cursor-pointer">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0 rounded-2xl overflow-hidden border border-white/5 bg-white/1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="p-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/2 border border-white/5">
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
            className="w-full lg:w-80 flex flex-col liquid-glass border border-[#D4AF7A]/20 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 bg-[#D4AF7A]/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#D4AF7A]">Selected Date</span>
                <h3 className="text-lg font-light text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedDate(null)} className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 max-h-[300px] lg:max-h-none">
              {getEventsForDate(selectedDate).map(e => (
                <div key={e.id} className="p-3.5 rounded-2xl bg-white/2 border border-white/5 flex flex-col gap-1 group hover:border-[#D4AF7A]/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{e.category}</span>
                    <button type="button" onClick={() => deleteEvent(e.id)} className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-[#fb7185] transition-opacity cursor-pointer">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-white">{e.title}</p>
                </div>
              ))}
              
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center text-white/30 text-xs font-semibold py-8 italic">
                  No events for this day.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-white/1">
              <form onSubmit={handleAddEvent} className="flex flex-col gap-3">
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  placeholder="Event or Reminder..."
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF7A]/50 focus:ring-0"
                />
                <div className="flex items-center gap-2">
                  <select 
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value)}
                    className="flex-1 bg-[#071b33] border border-white/10 rounded-xl text-xs font-bold p-2.5 text-white/60 focus:outline-none focus:border-[#D4AF7A]/50"
                  >
                    <option>Task</option>
                    <option>Goal</option>
                    <option>Note</option>
                    <option>Reminder</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!newEventTitle.trim()}
                    className="flex-1 bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] disabled:opacity-50 text-xs font-bold py-2.5 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-widest"
                  >
                    <Plus className="size-3.5" /> Add
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
