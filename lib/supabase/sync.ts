import { createClient } from './client';
import { useLifeStore } from '@/store/useLifeStore';

// Debounce timer reference
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 2000;

/**
 * Load user data from Supabase and hydrate the Zustand store.
 * Called on auth state change (login).
 */
export async function loadUserData(userId: string): Promise<boolean> {
  const supabase = createClient();

  // Load profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Load user data blob
  const { data: userData } = await supabase
    .from('user_data')
    .select('data')
    .eq('id', userId)
    .single();

  if (profile) {
    // Hydrate settings from profile
    useLifeStore.getState().updateSettings({
      name: profile.name || '',
      email: profile.email || '',
      bgImage: profile.bg_image || '',
      bgBlur: profile.bg_blur ?? 10,
      bgOpacity: profile.bg_opacity ?? 50,
      theme: profile.theme || 'dark',
      budgetLimit: profile.budget_limit ?? 1500,
      monthlyIncome: profile.monthly_income ?? 0,
      savingsGoal: profile.savings_goal ?? 0,
      lockedMonth: profile.locked_month || '',
      isLoggedIn: true,
    });
  }

  if (userData?.data) {
    // Hydrate all other data from the JSONB blob
    useLifeStore.getState().hydrateFromCloud(userData.data);
  }

  // Mark as logged in even if no data exists yet (new user)
  useLifeStore.getState().updateSettings({ isLoggedIn: true });

  return true;
}

/**
 * Save user data to Supabase (debounced).
 * Stores profile settings separately and everything else as a JSONB blob.
 */
export function saveUserData(userId: string) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    const supabase = createClient();
    const state = useLifeStore.getState();

    // Save profile settings
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: state.settings.name,
        email: state.settings.email,
        bg_image: state.settings.bgImage,
        bg_blur: state.settings.bgBlur,
        bg_opacity: state.settings.bgOpacity,
        theme: state.settings.theme,
        budget_limit: state.settings.budgetLimit,
        monthly_income: state.settings.monthlyIncome,
        savings_goal: state.settings.savingsGoal,
        locked_month: state.settings.lockedMonth,
      });

    if (profileError) {
      console.error('[LifeOS Sync] Profile save error:', profileError.message);
    }

    // Save all other data as JSONB blob
    const dataBlob = {
      tasks: state.tasks,
      expenses: state.expenses,
      habits: state.habits,
      events: state.events,
      dailyTargets: state.dailyTargets,
      engineeringDsa: state.engineeringDsa,
      engineeringLanguages: state.engineeringLanguages,
      engineeringMastery: state.engineeringMastery,
      engineeringCourses: state.engineeringCourses,
      monthlyMissions: state.monthlyMissions,
      projects: state.projects,
      focusSeconds: state.focusSeconds,
      focusPausedSeconds: state.focusPausedSeconds,
      focusTaskId: state.focusTaskId,
      gridTasks: state.gridTasks,
      dayTasks: state.dayTasks,
    };

    const { error: dataError } = await supabase
      .from('user_data')
      .upsert({
        id: userId,
        data: dataBlob,
        updated_at: new Date().toISOString(),
      });

    if (dataError) {
      console.error('[LifeOS Sync] Data save error:', dataError.message);
    }
  }, DEBOUNCE_MS);
}

/**
 * Cancel any pending save operations.
 */
export function cancelPendingSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
}
