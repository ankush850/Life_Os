"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLifeStore } from "@/store/useLifeStore";
import { getRandomCombo, Combo } from "@/lib/quotes";
import { motion } from "framer-motion";
import {
  ArrowRight,
  RefreshCw,
  Clock,
  Terminal,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const isLoggedIn = useLifeStore((state) => state.settings.isLoggedIn);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setCombo(getRandomCombo());
    if (useLifeStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsubFinish = useLifeStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsubFinish();
    }
  }, []);

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
      if (isLoggedIn) {
        router.push("/dashboard");
      }
    }
  }, [hasHydrated, isLoggedIn, router]);

  const handleCycleInspiration = () => {
    setCombo(getRandomCombo());
  };

  if (!hasHydrated || !isMounted || !combo || isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-slate-400 flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-indigo-400 animate-pulse">Initializing LifeOS HUD...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between overflow-x-hidden text-slate-300 transition-all duration-1000 bg-cover bg-center font-sans"
      style={{ backgroundImage: `url(${combo.wallpaper.url})` }}
    >
      {/* Cinematic Pitch-black ambient filter with blur */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[6px] z-0 pointer-events-none" />

      {/* Futuristic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0 opacity-40" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="LifeOS Logo" width={28} height={28} className="rounded-md object-contain" />
          <span className="font-extrabold text-sm uppercase tracking-[0.25em] text-white">
            LifeOS
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-xs uppercase font-bold tracking-widest text-slate-400 hover:text-white transition-all duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/login?signup=true"
            className="px-5 py-2.5 rounded bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] text-xs font-bold uppercase tracking-widest transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Deploy OS
          </Link>
        </div>
      </header>

      {/* Main Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-16 flex-1">
        {/* Left Column: Cinematic Headline */}
        <div className="flex-1 flex flex-col items-start max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-500/5 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
            SYS-ACTIVE // TELEMETRY OK
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] text-white mb-6"
          >
            A cinematic operating <br />
            system for{" "}
            <span className="font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              managing life.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 font-light leading-relaxed max-w-lg mb-10 tracking-wide"
          >
            A minimal cockpit designed for personal engineering. Organise tasks, log expenses, schedule daily target milestones, and review consistency trends on a clean, dark interface. Starts completely empty. No distractions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap gap-4 w-full sm:w-auto"
          >
            <Link
              href="/login?signup=true"
              className="px-7 py-4 rounded bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              Start Building Your System
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleCycleInspiration}
              className="px-6 py-4 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-2 backdrop-blur-md transform hover:-translate-y-0.5"
            >
              <RefreshCw className="w-3 h-3 text-slate-400 animate-spin-slow" />
              Cycle HUD Preset
            </button>
          </motion.div>
        </div>

        {/* Right Column: Premium Mockup Cockpit (Pristine Empty State) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="flex-1 w-full max-w-lg lg:max-w-xl relative flex justify-center"
        >
          {/* Glassmorphic border container */}
          <div className="w-full rounded-lg border border-white/10 bg-black/60 backdrop-blur-2xl p-5 shadow-2xl relative overflow-hidden group">
            {/* HUD Scan Line Effect */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.5)] pointer-events-none animate-scan z-20"></div>

            {/* Simulated browser header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-5 text-[10px] uppercase font-mono tracking-widest text-slate-500">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/5"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/5"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-white/5"></div>
              </div>
              <span className="text-[9px] text-slate-400 font-light">SYSTEM-HUD-BOOT-V1</span>
            </div>

            {/* Pristine Empty Mockup Interface */}
            <div className="grid grid-cols-12 gap-4 text-slate-400 font-mono">
              {/* Left Wing (Focus, Target) */}
              <div className="col-span-4 flex flex-col gap-4">
                <div className="p-3 rounded border border-white/5 bg-white/2 backdrop-blur-md flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[8px] tracking-wider text-indigo-400 font-bold uppercase">
                    <Clock className="w-3 h-3" /> FOCUS.LOG
                  </div>
                  <span className="text-lg font-light text-white tracking-wide">0.0h</span>
                  <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Ready for check-in</span>
                </div>

                <div className="p-3 rounded border border-white/5 bg-white/2 backdrop-blur-md flex-grow flex flex-col justify-between min-h-[120px]">
                  <div className="text-[8px] tracking-wider text-indigo-400 font-bold uppercase">DAILY.TARGET</div>
                  <div className="text-[9px] text-slate-600 font-light leading-relaxed my-2 italic">
                    “Start building your system.”
                  </div>
                  <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest">No target set</div>
                </div>
              </div>

              {/* Center Wing (Planning Grid / Empty Grid Structure) */}
              <div className="col-span-8 flex flex-col gap-4">
                <div className="p-3.5 rounded border border-white/5 bg-white/2 backdrop-blur-md flex flex-col justify-between h-full min-h-[196px]">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[8px] tracking-wider text-indigo-400 font-bold uppercase">LIFE.GRID</span>
                    <span className="text-[8px] text-slate-500 uppercase">{new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  </div>
                  {/* Empty Cells Scaffolding */}
                  <div className="grid grid-cols-7 gap-1.5 my-3 flex-1 items-center justify-center">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-[2px] border border-white/5 flex items-center justify-center text-[7px] font-bold ${
                          i === 12 ? "border-indigo-500/50 bg-indigo-500/5 text-indigo-400" : "bg-black/10"
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="text-[7px] text-center text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Click day cell to edit targets
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom hud alert */}
            <div className="mt-4 p-2.5 rounded border border-indigo-500/10 bg-indigo-500/5 flex items-center justify-between text-[8px] font-mono tracking-widest uppercase text-indigo-400">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> Awaiting Telemetry</span>
              <span>0% Month Consistency</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Quote Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-8 py-8 border-t border-white/5">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
            <span className="text-indigo-400 font-bold text-[9px] uppercase tracking-[0.25em]">Motivational Core</span>
            <p className="text-sm italic font-light text-slate-100 max-w-2xl leading-relaxed">
              &ldquo;{combo.quote.text}&rdquo;
            </p>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">— {combo.quote.author}</span>
          </div>

          <div className="flex flex-col items-center md:items-end text-slate-500 text-[10px] font-mono tracking-widest uppercase gap-1">
            <span>HUD PRESET: {combo.wallpaper.title}</span>
            <span>By {combo.wallpaper.credit}</span>
          </div>
        </div>
        <div className="text-center text-slate-600 text-[9px] font-mono tracking-widest uppercase mt-8">
          &copy; {new Date().getFullYear()} LifeOS — Futuristic Command Cockpit
        </div>
      </footer>
    </div>
  );
}
