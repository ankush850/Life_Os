"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLifeStore } from "@/store/useLifeStore";
import { createClient } from "@/lib/supabase/client";
import { Key, Mail, User, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

function LoginContent() {
  const { push } = useRouter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateSettings = useLifeStore((state) => state.updateSettings);
  const isLoggedIn = useLifeStore((state) => state.settings.isLoggedIn);

  const [isSignUp, setIsSignUp] = useState(() => searchParams.get("signup") === "true");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useLifeStore.persist.hasHydrated()) {
      setHasHydrated(true);
    } else {
      const unsubFinish = useLifeStore.persist.onFinishHydration(() => {
        setHasHydrated(true);
      });
      return () => unsubFinish();
    }
  }, []);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (hasHydrated && isLoggedIn) {
      push("/dashboard");
    }
  }, [hasHydrated, isLoggedIn, push]);

  if (!hasHydrated || isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#071B33] text-[#D4AF7A] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="size-6 border border-[#D4AF7A] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[11px] uppercase tracking-[0.2em] animate-pulse">Authenticating...</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp) {
      if (!name) {
        setError("Please enter your name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      // ── Sign Up ──
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (signUpError) {
        setIsLoading(false);
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // Create profile row in Supabase
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: name,
          email: email,
        });

        // Create empty user_data row
        await supabase.from('user_data').upsert({
          id: data.user.id,
          data: {},
        });

        // Update local store
        updateSettings({
          isLoggedIn: true,
          name: name,
          email: email,
        });

        setIsLoading(false);
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      // ── Sign In ──
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setIsLoading(false);
        setError(signInError.message);
        return;
      }

      // SupabaseProvider will handle loading data via onAuthStateChange
      setIsLoading(false);
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    setIsLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccessMessage("Password reset link sent! Check your email.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071B33] via-[#0B2447] to-[#102A43] text-white flex select-none font-sans overflow-hidden">
      
      {/* Shared Ambient Starry Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-[40vw] bg-indigo-500/10 rounded-full filter blur-[120px] animate-pulse duration-[8s]" />
        <div className="absolute bottom-1/4 right-1/4 size-[50vw] bg-purple-500/5 rounded-full filter blur-[150px] animate-pulse duration-[12s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] opacity-25" />
        
        {/* Dynamic floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => {
            const delay = (i % 5) * 1.5;
            const left = (i * 7.7) % 100;
            const top = (i * 13.3) % 100;
            const scale = 0.5 + (i % 3) * 0.4;
            return (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-[#D4AF7A] rounded-full opacity-30 animate-pulse"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${3 + (i % 4)}s`,
                  transform: `scale(${scale})`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="w-full h-screen flex relative z-10">
        
        {/* LEFT COLUMN: Inspirational Storytelling */}
        <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden border-r border-white/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 z-10 w-max group cursor-pointer">
            <div className="size-10 rounded-xl bg-white/5 group-hover:bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md transition-all">
              <ArrowLeft className="size-5 text-[#D4AF7A] group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-2xl tracking-widest uppercase font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Life OS
            </span>
          </Link>

          {/* Inspirational Content */}
          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex items-center gap-3 mb-6 text-[#D4AF7A]">
                <Sparkles className="size-5" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Sanctuary Awaits</span>
              </div>
              <h1 className="text-6xl font-light leading-tight tracking-tight mb-6 text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Where <em className="italic text-[#D4AF7A]">dreams</em> are engineered into reality.
              </h1>
              <p className="text-white/50 text-sm leading-relaxed tracking-wide font-light max-w-md">
                Step back into your private operating environment. We design systems for thinkers, creators, builders, and visionaries seeking clarity in a noisy world.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 text-[10px] text-white/30 font-semibold uppercase tracking-[0.15em] font-mono">
            © {new Date().getFullYear()} LifeOS — Craftsmanship & Quiet Focus
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
          
          {/* Mobile Back Button */}
          <Link href="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2 group z-20">
            <div className="size-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <ArrowLeft className="size-4 text-white" />
            </div>
          </Link>

          {/* Glass Authentication Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="w-full max-w-md p-8 sm:p-10 flex flex-col gap-8 shadow-2xl shadow-black/50 relative overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "32px"
            }}
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#D4AF7A]/10 blur-[50px] pointer-events-none" />

            <div className="flex flex-col gap-2 text-left relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? "signup" : "signin"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl font-normal tracking-tight text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {isSignUp ? "Create Your LifeOS" : "Welcome Back"}
                  </h2>
                  <p className="text-white/50 text-xs font-light tracking-wide leading-relaxed">
                    {isSignUp
                      ? "Build a system that works for your goals, habits, learning, and growth."
                      : "Continue building your future."}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-200 text-center relative z-10">
                {error}
              </motion.div>
            )}

            {successMessage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-200 text-center relative z-10">
                {successMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="flex flex-col gap-2 overflow-hidden"
                  >
                    <Label htmlFor="name" className="text-white/40 text-[9px] uppercase font-bold tracking-widest ml-1">
                      Full Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-3.5 size-4 text-white/30 group-focus-within:text-[#D4AF7A] transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Creator Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-12 h-12 bg-black/20 border-white/10 focus:border-[#D4AF7A]/50 focus:ring-1 focus:ring-[#D4AF7A]/50 text-white rounded-2xl text-sm transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-white/40 text-[9px] uppercase font-bold tracking-widest ml-1">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 size-4 text-white/30 group-focus-within:text-[#D4AF7A] transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="visionary@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-black/20 border-white/10 focus:border-[#D4AF7A]/50 focus:ring-1 focus:ring-[#D4AF7A]/50 text-white rounded-2xl text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-white/40 text-[9px] uppercase font-bold tracking-widest">
                    Password
                  </Label>
                  {!isSignUp && (
                    <button type="button" onClick={handlePasswordReset} className="text-[9px] font-bold text-[#D4AF7A] hover:text-white transition-colors uppercase tracking-wider">
                      Recover
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Key className="absolute left-4 top-3.5 size-4 text-white/30 group-focus-within:text-[#D4AF7A] transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 bg-black/20 border-white/10 focus:border-[#D4AF7A]/50 focus:ring-1 focus:ring-[#D4AF7A]/50 text-white rounded-2xl text-sm transition-all"
                  />
                </div>
              </div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col gap-2 overflow-hidden"
                  >
                    <Label htmlFor="confirmPassword" className="text-white/40 text-[9px] uppercase font-bold tracking-widest ml-1">
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-3.5 size-4 text-white/30 group-focus-within:text-[#D4AF7A] transition-colors" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 h-12 bg-black/20 border-white/10 focus:border-[#D4AF7A]/50 focus:ring-1 focus:ring-[#D4AF7A]/50 text-white rounded-2xl text-sm transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 h-14 rounded-2xl font-bold bg-[#D4AF7A] hover:bg-[#E7CBA9] text-[#071B33] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,122,0.3)] text-xs uppercase tracking-widest"
              >
                {isLoading ? (
                  <div className="size-5 rounded-full border-2 border-[#071B33] border-t-transparent animate-spin"></div>
                ) : isSignUp ? (
                  <span className="flex items-center gap-2">
                    Initialize System <ArrowRight className="size-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Sanctuary <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative z-10 flex flex-col gap-4 mt-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-full border-t border-white/5"></div>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-center text-xs font-medium text-white/40 hover:text-white transition-colors"
              >
                {isSignUp ? (
                  <span>Already built your system? <span className="text-[#D4AF7A] font-bold">Sign In</span></span>
                ) : (
                  <span>Need a new workspace? <span className="text-[#D4AF7A] font-bold">Sign Up</span></span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#071B33] text-[#D4AF7A] flex items-center justify-center">
        <div className="size-8 rounded-full border-4 border-[#D4AF7A] border-t-transparent animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
