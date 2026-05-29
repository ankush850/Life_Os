import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'Work' | 'Study' | 'Health' | 'Finance' | 'Personal' | string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string;
  project?: string;
  completedAt?: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: 'Food' | 'Travel' | 'Shopping' | 'Education' | 'Bills' | 'Entertainment' | string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDates: string[]; // List of YYYY-MM-DD
}

export interface PlannerEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'Completed' | 'In progress' | 'Upcoming';
  category: string;
}

export interface DailyTarget {
  target: string;
  completed: boolean;
}

// Engineering Mode Schemas
export interface DsaProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  date: string; // YYYY-MM-DD
}

export interface LanguageProgress {
  name: string;
  hours: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface TopicMastery {
  topic: string;
  score: number; // 0-100 percentage
}

export interface Course {
  id: string;
  title: string;
  status: 'Started' | 'Finished';
}

export interface MonthlyMission {
  id: string;
  title: string;
  status: 'Pending' | 'Completed';
  targetMonth: string; // YYYY-MM
}

interface UserSettings {
  name: string;
  email: string;
  bgImage: string; // URL or Base64
  bgBlur: number; // in pixels (0-20)
  bgOpacity: number; // overlay black tint (0-100)
  theme: 'light' | 'dark';
  isLoggedIn: boolean;
  budgetLimit: number;
  isFocusMode: boolean;
  monthlyIncome: number;
  savingsGoal: number;
  lockedMonth: string;
}

interface LifeState {
  // Settings & Profile
  settings: UserSettings;
  updateSettings: (fields: Partial<UserSettings>) => void;
  logout: () => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, fields: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Habits
  habits: Habit[];
  addHabit: (name: string) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;

  // Planner
  events: PlannerEvent[];
  addEvent: (event: Omit<PlannerEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  // Daily Targets (Planner of each day for tracker performance)
  dailyTargets: Record<string, DailyTarget>; // key: YYYY-MM-DD
  setDailyTarget: (date: string, target: string) => void;
  toggleDailyTarget: (date: string) => void;

  // Engineering Mode Tracker States
  engineeringDsa: DsaProblem[];
  addDsaProblem: (title: string, difficulty: 'Easy' | 'Medium' | 'Hard') => void;
  deleteDsaProblem: (id: string) => void;

  engineeringLanguages: LanguageProgress[];
  updateLanguageHours: (name: string, hoursToAdd: number) => void;

  engineeringMastery: TopicMastery[];
  updateMasteryScore: (topic: string, score: number) => void;

  engineeringCourses: Course[];
  addCourse: (title: string) => void;
  toggleCourseStatus: (id: string) => void;
  deleteCourse: (id: string) => void;

  // Intelligence Engine
  monthlyMissions: MonthlyMission[];
  addMission: (title: string, targetMonth: string) => void;
  toggleMissionStatus: (id: string) => void;
  deleteMission: (id: string) => void;

  // Focus Timer
  focusSeconds: number;
  focusPausedSeconds: number;
  isFocusRunning: boolean;
  setFocusSeconds: (seconds: number) => void;
  setFocusPausedSeconds: (seconds: number) => void;
  setIsFocusRunning: (running: boolean) => void;
  resetFocusTimer: () => void;
  focusTaskId: string | null;
  setFocusTaskId: (taskId: string | null) => void;

  // Projects
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => void;
  deleteProject: (id: string) => void;

  // Utilities
  clearAllData: () => void;
}

const initialSettings: UserSettings = {
  name: '',
  email: '',
  bgImage: '',
  bgBlur: 10,
  bgOpacity: 50, // default dark-tint cinematic overlay
  theme: 'dark', // default dark-theme
  isLoggedIn: false,
  budgetLimit: 1500,
  isFocusMode: false,
  monthlyIncome: 0,
  savingsGoal: 0,
  lockedMonth: "",
};

const defaultLanguages: LanguageProgress[] = [
  { name: 'JavaScript', hours: 0, level: 'Beginner' },
  { name: 'TypeScript', hours: 0, level: 'Beginner' },
  { name: 'Rust', hours: 0, level: 'Beginner' },
  { name: 'Go', hours: 0, level: 'Beginner' },
  { name: 'Python', hours: 0, level: 'Beginner' },
];

const defaultMasteries: TopicMastery[] = [
  { topic: 'System Design', score: 0 },
  { topic: 'Algorithms & DSA', score: 0 },
  { topic: 'DBMS & SQL', score: 0 },
  { topic: 'Operating Systems', score: 0 },
  { topic: 'Computer Networks', score: 0 },
];

export const useLifeStore = create<LifeState>()(
  persist(
    (set) => ({
      // Settings & Profile
      settings: initialSettings,
      updateSettings: (fields) =>
        set((state) => ({
          settings: { ...state.settings, ...fields },
        })),
      logout: () =>
        set((state) => ({
          settings: { ...state.settings, isLoggedIn: false },
        })),

      // Tasks (Start completely empty)
      tasks: [],
      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, { ...task, id: Math.random().toString(36).substring(2, 9) }],
        })),
      updateTask: (id, fields) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...fields } : t)),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      // Expenses (Start completely empty)
      expenses: [],
      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: Math.random().toString(36).substring(2, 9) }],
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      // Habits (Start completely empty)
      habits: [],
      addHabit: (name) =>
        set((state) => ({
          habits: [...state.habits, { id: Math.random().toString(36).substring(2, 9), name, streak: 0, completedDates: [] }],
        })),
      toggleHabit: (id, date) =>
        set((state) => {
          return {
            habits: state.habits.map((h) => {
              if (h.id !== id) return h;
              const exists = h.completedDates.includes(date);
              let newDates = [...h.completedDates];
              if (exists) {
                newDates = newDates.filter((d) => d !== date);
              } else {
                newDates.push(date);
              }

              const newStreak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;

              return {
                ...h,
                completedDates: newDates,
                streak: newStreak,
              };
            }),
          };
        }),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),

      // Planner
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: Math.random().toString(36).substring(2, 9) }],
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      // Daily Targets
      dailyTargets: {},
      setDailyTarget: (date, target) =>
        set((state) => ({
          dailyTargets: {
            ...state.dailyTargets,
            [date]: {
              target,
              completed: state.dailyTargets[date]?.completed || false,
            },
          },
        })),
      toggleDailyTarget: (date) =>
        set((state) => {
          const current = state.dailyTargets[date];
          if (!current) return state;
          return {
            dailyTargets: {
              ...state.dailyTargets,
              [date]: {
                ...current,
                completed: !current.completed,
              },
            },
          };
        }),

      // Engineering Modes
      engineeringDsa: [],
      addDsaProblem: (title, difficulty) =>
        set((state) => ({
          engineeringDsa: [
            ...state.engineeringDsa,
            {
              id: Math.random().toString(36).substring(2, 9),
              title,
              difficulty,
              date: new Date().toISOString().split('T')[0],
            },
          ],
        })),
      deleteDsaProblem: (id) =>
        set((state) => ({
          engineeringDsa: state.engineeringDsa.filter((p) => p.id !== id),
        })),

      engineeringLanguages: defaultLanguages,
      updateLanguageHours: (name, hoursToAdd) =>
        set((state) => ({
          engineeringLanguages: state.engineeringLanguages.map((lang) => {
            if (lang.name !== name) return lang;
            const newHours = lang.hours + hoursToAdd;
            let level = lang.level;
            if (newHours >= 100) level = 'Expert';
            else if (newHours >= 50) level = 'Advanced';
            else if (newHours >= 20) level = 'Intermediate';
            return { ...lang, hours: newHours, level };
          }),
        })),

      engineeringMastery: defaultMasteries,
      updateMasteryScore: (topic, score) =>
        set((state) => ({
          engineeringMastery: state.engineeringMastery.map((m) =>
            m.topic === topic ? { ...m, score: Math.min(100, Math.max(0, score)) } : m
          ),
        })),

      engineeringCourses: [],
      addCourse: (title) =>
        set((state) => ({
          engineeringCourses: [
            ...state.engineeringCourses,
            { id: Math.random().toString(36).substring(2, 9), title, status: 'Started' },
          ],
        })),
      toggleCourseStatus: (id) =>
        set((state) => ({
          engineeringCourses: state.engineeringCourses.map((c) =>
            c.id === id ? { ...c, status: c.status === 'Started' ? 'Finished' : 'Started' } : c
          ),
        })),
      deleteCourse: (id) =>
        set((state) => ({
          engineeringCourses: state.engineeringCourses.filter((c) => c.id !== id),
        })),

      // Intelligence Engine
      monthlyMissions: [],
      addMission: (title, targetMonth) =>
        set((state) => ({
          monthlyMissions: [
            ...state.monthlyMissions,
            { id: Math.random().toString(36).substring(2, 9), title, status: 'Pending', targetMonth },
          ],
        })),
      toggleMissionStatus: (id) =>
        set((state) => ({
          monthlyMissions: state.monthlyMissions.map((m) =>
            m.id === id ? { ...m, status: m.status === 'Pending' ? 'Completed' : 'Pending' } : m
          ),
        })),
      deleteMission: (id) =>
        set((state) => ({
          monthlyMissions: state.monthlyMissions.filter((m) => m.id !== id),
        })),

      // Focus Timer
      focusSeconds: 0,
      focusPausedSeconds: 0,
      isFocusRunning: false,
      setFocusSeconds: (seconds) => set({ focusSeconds: seconds }),
      setFocusPausedSeconds: (seconds) => set({ focusPausedSeconds: seconds }),
      setIsFocusRunning: (running) => set({ isFocusRunning: running }),
      resetFocusTimer: () => set({ focusSeconds: 0, focusPausedSeconds: 0, isFocusRunning: false }),
      focusTaskId: null,
      setFocusTaskId: (taskId) => set({ focusTaskId: taskId }),

      // Projects
      projects: [],
      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, { ...project, id: Math.random().toString(36).substring(2, 9) }],
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      // Clear all
      clearAllData: () =>
        set(() => ({
          tasks: [],
          expenses: [],
          habits: [],
          events: [],
          dailyTargets: {},
          engineeringDsa: [],
          engineeringLanguages: defaultLanguages,
          engineeringMastery: defaultMasteries,
          engineeringCourses: [],
          monthlyMissions: [],
          projects: [],
          focusSeconds: 0,
          focusPausedSeconds: 0,
          isFocusRunning: false,
        })),
    }),
    {
      name: 'life-os-store',
      // only persist client states
      partialize: (state) => ({
        settings: state.settings,
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
      }),
    }
  )
);
