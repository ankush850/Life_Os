"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useLifeStore } from "@/store/useLifeStore";
import { getRandomCombo, Combo } from "@/lib/quotes";
import { RefreshCw, Key, Mail, User, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateSettings = useLifeStore((state) => state.updateSettings);
  const isLoggedIn = useLifeStore((state) => state.settings.isLoggedIn);

  const [isSignUp, setIsSignUp] = useState(false);
  const [combo, setCombo] = useState<Combo | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize random wallpaper and quote
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

  // Read query params after hydration
  useEffect(() => {
    if (hasHydrated) {
      const signupParam = searchParams.get("signup");
      if (signupParam === "true") {
        setIsSignUp(true);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    }
  }, [hasHydrated, searchParams]);

  // Redirect if already logged in
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp) {
      if (!name) {
        setError("Please enter your name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setIsLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      setIsLoading(false);
      updateSettings({
        isLoggedIn: true,
        name: isSignUp ? name : (name || email.split("@")[0] || "User"),
        email: email,
      });
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div
      className="min-h-screen relative flex flex-col justify-between overflow-x-hidden text-white transition-all duration-1000 bg-cover bg-center"
      style={{ backgroundImage: `url(${combo.wallpaper.url})` }}
    >
      {/* Dark overlay with dynamic backdrop blur */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[5px] z-0 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md transition-all">
            <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
          </div>
          <span className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors">
            Back to Home
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="LifeOS Logo" width={32} height={32} className="rounded-lg object-contain" />
          <span className="font-extrabold text-lg tracking-tight">LifeOS</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-4 flex-1 flex items-center justify-center">
        <div className="w-full rounded-2xl border border-white/10 bg-slate-950/65 backdrop-blur-xl p-8 shadow-2xl shadow-indigo-950/50 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">
              {isSignUp ? "Create your LifeOS Account" : "Sign In to LifeOS"}
            </h2>
            <p className="text-slate-400 text-xs font-semibold">
              {isSignUp
                ? "Sign up below to launch your personal tracker."
                : "Enter your credentials to log in."}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-200 text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-indigo-500/40 text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-indigo-500/40 text-slate-100 rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">
                  Password
                </Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert("Please enter the password you registered with.")}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-indigo-500/40 text-slate-100 rounded-xl"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword" className="text-slate-300 text-[10px] uppercase font-bold tracking-wider">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-indigo-500/40 text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-6 rounded-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-indigo-950/20"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : isSignUp ? (
                <span className="flex items-center gap-2">
                  Launch My LifeOS <ArrowRight className="w-4 h-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enter Dashboard <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Separator / Mode Toggle */}
          <div className="relative flex items-center justify-center my-1 text-slate-600">
            <div className="absolute w-full border-t border-white/10"></div>
            <span className="relative px-3 bg-slate-950/20 backdrop-blur-md text-[10px] uppercase font-black tracking-wider text-slate-400">
              Or Toggle Mode
            </span>
          </div>

          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full py-3.5 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs text-slate-200"
          >
            {isSignUp ? "Already have an account? Sign In" : "Need a new workspace? Sign Up"}
          </button>
        </div>
      </main>

      {/* Quote / Background credit footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCycleInspiration}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center backdrop-blur-md transition-all animate-pulse"
            title="Cycle background and quote"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" />
          </button>
          <div className="text-left">
            <p className="text-xs text-slate-200 italic font-medium max-w-lg truncate">
              &ldquo;{combo.quote.text}&rdquo;
            </p>
            <p className="text-[10px] text-slate-400 font-bold">— {combo.quote.author}</p>
          </div>
        </div>

        <div className="text-center md:text-right text-slate-500 text-[10px] font-bold">
          Wallpaper: {combo.wallpaper.title} by {combo.wallpaper.credit} via Unsplash
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
