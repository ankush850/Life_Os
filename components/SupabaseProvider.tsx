"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadUserData, saveUserData, cancelPendingSave } from "@/lib/supabase/sync";
import { useLifeStore } from "@/store/useLifeStore";

/**
 * SupabaseProvider — wraps the app to handle:
 * 1. Auth state changes (login/logout detection)
 * 2. Loading user data from Supabase on login
 * 3. Auto-syncing Zustand store changes to Supabase (debounced)
 */
export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const userIdRef = useRef<string | null>(null);
  const unsubStoreRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Check for existing session on mount
    const initSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        userIdRef.current = user.id;
        await loadUserData(user.id);
        startStoreSync(user.id);
      }
    };

    initSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const userId = session.user.id;
        userIdRef.current = userId;
        await loadUserData(userId);
        startStoreSync(userId);
      }

      if (event === "SIGNED_OUT") {
        userIdRef.current = null;
        cancelPendingSave();
        stopStoreSync();

        // Reset store to logged-out state
        useLifeStore.getState().updateSettings({ isLoggedIn: false });
      }
    });

    return () => {
      subscription.unsubscribe();
      cancelPendingSave();
      stopStoreSync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Subscribe to Zustand store changes and auto-save to Supabase.
   */
  function startStoreSync(_userId: string) {
    // Clean up existing subscription if any
    stopStoreSync();

    unsubStoreRef.current = useLifeStore.subscribe(() => {
      if (userIdRef.current) {
        saveUserData(userIdRef.current);
      }
    });
  }

  function stopStoreSync() {
    if (unsubStoreRef.current) {
      unsubStoreRef.current();
      unsubStoreRef.current = null;
    }
  }

  return <>{children}</>;
}
