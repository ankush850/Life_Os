"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLifeStore } from "@/store/useLifeStore";

export default function LandingPage() {
  const { push } = useRouter();
  const isLoggedIn = useLifeStore((state) => state.settings.isLoggedIn);
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

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (hasHydrated && isLoggedIn) {
      push("/dashboard");
    }
  }, [hasHydrated, isLoggedIn, push]);

  if (!hasHydrated || isLoggedIn) {
    return (
      <div className="min-h-screen bg-[hsl(201_100%_13%)] text-white flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="size-6 border border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[11px] uppercase tracking-[0.2em] animate-pulse">Entering Sanctuary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[hsl(201_100%_13%)] text-white font-sans selection:bg-white/20 flex flex-col">

      {/* ------------------------------------- */}
      {/* FULLSCREEN LOOPING VIDEO BACKGROUND */}
      {/* ------------------------------------- */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>

      {/* ------------------------------------- */}
      {/* NAVIGATION */}
      {/* ------------------------------------- */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-8 py-6 flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-3xl tracking-tight text-white cursor-pointer select-none"
          style={{ fontFamily: "'Instrument Serif', serif" }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          LIFE OS
        </div>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm text-foreground hover:text-foreground transition-colors font-medium">Home</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Studio</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">About</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Journal</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">Reach Us</a>
        </nav>

        {/* CTA */}
        <button
          onClick={() => push("/login?signup=true")}
          className="px-6 py-2.5 rounded-full text-sm font-medium transition-all liquid-glass hover:scale-[1.03]"
        >
          Begin Journey
        </button>
      </header>

      {/* ------------------------------------- */}
      {/* HERO COMPOSITION */}
      {/* ------------------------------------- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col items-center text-center gap-6 mt-12 md:mt-24">

          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-normal leading-[0.95] tracking-[-2.46px] text-white animate-fade-rise max-w-6xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where <em className="not-italic text-muted-foreground">dreams</em> rise<br className="hidden sm:block" />
            through the <em className="not-italic text-muted-foreground">silence.</em>
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed mt-4 animate-fade-rise-delay font-medium tracking-wide">
            LifeOS is a personal operating system for thinkers, creators, builders, and ambitious individuals seeking clarity, focus, and meaningful progress.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 animate-fade-rise-delay-2">
            <button
              onClick={() => push("/login?signup=true")}
              className="liquid-glass rounded-full px-8 py-4 text-sm font-medium text-white hover:scale-[1.03] transition-all duration-300"
            >
              Begin Journey
            </button>

            <button
              onClick={() => push("/login")}
              className="liquid-glass rounded-full px-8 py-4 text-sm font-medium text-white/80 hover:text-white hover:scale-[1.03] transition-all duration-300"
            >
              Explore LifeOS
            </button>
          </div>

        </div>
      </main>

    </div>
  );
}
