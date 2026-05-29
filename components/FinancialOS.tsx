"use client";

import React, { useState } from "react";
import { useLifeStore } from "@/store/useLifeStore";
import { Wallet, ShieldCheck, Lock, TrendingUp, AlertTriangle, Plus, Trash2, PieChart, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function FinancialOS() {
  const { settings, updateSettings, expenses, addExpense, deleteExpense } = useLifeStore();
  
  // Local state for Budget Lock form
  const [incomeInput, setIncomeInput] = useState(settings.monthlyIncome > 0 ? settings.monthlyIncome.toString() : "");
  const [savingsInput, setSavingsInput] = useState(settings.savingsGoal > 0 ? settings.savingsGoal.toString() : "");
  
  // Local state for Expense form
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");
  const [expenseDesc, setExpenseDesc] = useState("");

  const currentMonthStr = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const isBudgetLocked = settings.lockedMonth === currentMonthStr;

  // Monthly Calculations
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr) && e.type === "expense");
  const totalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  const income = isBudgetLocked ? settings.monthlyIncome : (parseFloat(incomeInput) || 0);
  const savingsTarget = isBudgetLocked ? settings.savingsGoal : (parseFloat(savingsInput) || 0);
  const availableBudget = Math.max(0, income - savingsTarget);
  const remainingBudget = availableBudget - totalExpenses;

  // Days calculations
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysLeft = Math.max(1, daysInMonth - currentDay + 1);

  // Daily Allowance
  const dailyAllowance = remainingBudget / daysLeft;
  
  // Predictor
  const avgDailySpend = currentDay > 1 ? totalExpenses / (currentDay - 1) : totalExpenses;
  const projectedSpend = totalExpenses + (avgDailySpend * daysLeft);
  const willOverspend = projectedSpend > availableBudget;

  // Score (0-100)
  const calculateScore = () => {
    if (!isBudgetLocked) return 0;
    let score = 100;
    if (willOverspend) score -= 30;
    if (income > 0 && savingsTarget / income < 0.2) score -= 20; // Recommend 20% savings
    if (totalExpenses > availableBudget) score -= 40;
    return Math.max(0, score);
  };
  const healthScore = calculateScore();

  const handleLockBudget = () => {
    if (!incomeInput || !savingsInput) return;
    updateSettings({
      monthlyIncome: parseFloat(incomeInput),
      savingsGoal: parseFloat(savingsInput),
      lockedMonth: currentMonthStr
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount) return;
    addExpense({
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      description: expenseDesc,
      type: "expense",
      date: new Date().toISOString().split('T')[0]
    });
    setExpenseAmount("");
    setExpenseDesc("");
  };

  // Forecast
  const projectedMonthlySavings = income - projectedSpend;
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="flex flex-col gap-4 size-full">
      
      {/* 1. Header & Budget Lock System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Budget Lock Card */}
        <div className="lg:col-span-1 rounded-2xl bg-slate-900/60 border border-white/10 p-4 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-indigo-500" />
          
          <div className="flex items-center gap-2 mb-6">
            {isBudgetLocked ? <Lock className="size-5 text-emerald-400" /> : <ShieldCheck className="size-5 text-indigo-400" />}
            <h2 className="text-lg font-black text-white">Budget Lock</h2>
          </div>

          {!isBudgetLocked ? (
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="expected-income" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Expected Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input id="expected-income" 
                    type="number" 
                    value={incomeInput}
                    onChange={e => setIncomeInput(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="5000"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Savings Goal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" 
                    value={savingsInput}
                    onChange={e => setSavingsInput(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="1000"
                  />
                </div>
              </div>

              <button type="button" 
                onClick={handleLockBudget}
                disabled={!incomeInput || !savingsInput}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                Lock Current Month
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 h-full justify-center">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <ShieldCheck className="size-8 text-emerald-400 mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Month Locked</span>
                <p className="text-xs font-semibold text-slate-300 mt-2 leading-relaxed">
                  Your budget is locked. Discipline is the bridge between goals and accomplishment.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold text-slate-400">Income</span>
                  <span className="text-sm font-black text-emerald-400">{formatCurrency(income)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs font-bold text-slate-400">Savings Goal</span>
                  <span className="text-sm font-black text-indigo-400">{formatCurrency(savingsTarget)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded-lg border border-white/10">
                  <span className="text-xs font-bold text-slate-400">Play Budget</span>
                  <span className="text-sm font-black text-white">{formatCurrency(availableBudget)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Intelligence Engine - Core Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Daily Spending Allowance */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 size-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Wallet className="size-3.5" /> Daily Allowance
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl font-black tracking-tighter text-white">
                {isBudgetLocked ? formatCurrency(Math.max(0, dailyAllowance)) : "$0.00"}
              </h3>
              <span className="text-xs font-bold text-slate-500">/day</span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-4">
              {isBudgetLocked 
                ? `You have ${formatCurrency(remainingBudget)} left to spend across ${daysLeft} days.`
                : "Lock your budget to calculate daily allowance."}
            </p>
            
            {/* Mini Progress */}
            {isBudgetLocked && (
              <div className="mt-4 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalExpenses / availableBudget) * 100)}%` }}
                  className={`h-full rounded-full ${willOverspend ? 'bg-rose-500' : 'bg-indigo-500'}`}
                />
              </div>
            )}
          </div>

          {/* Financial Health Score */}
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Financial Health Score</span>
            
            <div className="relative size-32 flex items-center justify-center">
              <svg className="size-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <motion.circle 
                  cx="64" cy="64" r="56" fill="none" 
                  stroke={healthScore > 75 ? "#34d399" : healthScore > 40 ? "#fbbf24" : "#fb7185"}
                  strokeWidth="12"
                  strokeDasharray="351.86"
                  initial={{ strokeDashoffset: 351.86 }}
                  animate={{ strokeDashoffset: 351.86 - (351.86 * (isBudgetLocked ? healthScore : 0)) / 100 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-black text-white">{isBudgetLocked ? healthScore : "--"}</span>
                <span className="text-[10px] font-bold text-slate-500">/ 100</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Lower Section: Predictor & Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Tracker */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-white/10 p-4 backdrop-blur-xl shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Expense Tracker</h3>
            <span className="text-xs font-bold text-rose-400">Total: {formatCurrency(totalExpenses)}</span>
          </div>

          <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-3 bg-slate-950/40 p-4 rounded-xl border border-white/5">
            <input
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="Amount"
              className="w-full sm:w-28 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50"
            />
            <input
              type="text"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              placeholder="Description (Optional)"
              className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500/50"
            />
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full sm:w-36 bg-slate-900 border border-white/10 rounded-lg text-xs font-bold px-3 py-2 text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              {["Food", "Travel", "Shopping", "Education", "Bills", "Entertainment", "Other"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!expenseAmount}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2 rounded-lg transition-colors flex items-center justify-center w-full sm:w-12"
            >
              <Plus className="size-5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2 mt-2 pr-1">
            {currentMonthExpenses.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-semibold text-xs">No expenses logged this month. Keep it up!</div>
            ) : (
              currentMonthExpenses.slice().reverse().map(exp => (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={exp.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/10 text-slate-300">
                      <PieChart className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{exp.description || exp.category}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">{exp.category} &bull; {exp.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-rose-400">-{formatCurrency(exp.amount)}</span>
                    <button type="button"
                      onClick={() => deleteExpense(exp.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Intelligence Module */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          
          {/* Overspending Predictor */}
          <div className={`rounded-2xl border p-5 backdrop-blur-xl shadow-lg relative overflow-hidden transition-colors ${
            !isBudgetLocked ? "bg-slate-900/60 border-white/10" :
            willOverspend ? "bg-rose-950/30 border-rose-500/30" : "bg-emerald-950/20 border-emerald-500/20"
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <Info className="size-3.5" /> Predictor
            </span>
            
            {isBudgetLocked ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  {willOverspend ? (
                    <AlertTriangle className="size-8 text-rose-400" />
                  ) : (
                    <TrendingUp className="size-8 text-emerald-400" />
                  )}
                  <h3 className={`text-lg font-black ${willOverspend ? "text-rose-400" : "text-emerald-400"}`}>
                    {willOverspend ? "Overspend Risk" : "On Track"}
                  </h3>
                </div>
                <p className="text-xs font-semibold text-slate-300 leading-relaxed">
                  Projected monthly spend: <strong className="text-white">{formatCurrency(projectedSpend)}</strong>.
                  {willOverspend 
                    ? ` At your current pace, you will exceed your play budget by ${formatCurrency(projectedSpend - availableBudget)}.` 
                    : ` You are on track to stay under budget by ${formatCurrency(availableBudget - projectedSpend)}.`}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-500 font-semibold py-4 text-center">Lock budget to activate predictor.</p>
            )}
          </div>

          {/* Wealth Forecast */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg flex-1 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-4">
              <TrendingUp className="size-3.5" /> Savings Forecast
            </span>
            
            {isBudgetLocked ? (
              <div className="flex flex-col gap-4 flex-1 justify-center">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-slate-400">3 Months</span>
                  <span className="text-lg font-black text-white">{formatCurrency(projectedMonthlySavings * 3)}</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-slate-400">6 Months</span>
                  <span className="text-lg font-black text-indigo-300">{formatCurrency(projectedMonthlySavings * 6)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400">1 Year</span>
                  <span className="text-xl font-black text-emerald-400">{formatCurrency(projectedMonthlySavings * 12)}</span>
                </div>
                <p className="text-[9px] text-slate-500 uppercase tracking-wide text-center mt-2 font-bold">Based on projected monthly savings of {formatCurrency(projectedMonthlySavings)}</p>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-slate-500 font-semibold text-center">Lock budget to see wealth projections.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
