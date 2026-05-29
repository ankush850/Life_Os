# LifeOS — Day-by-Day Productivity & Growth Tracker

**LifeOS** is a premium, gamified personal productivity dashboard designed to help you manage your daily goals, monthly planner milestones, expense budgets, habit streaks, and focus hours in one central workspace. It features custom inspirational backgrounds and dynamic performance metrics to keep you motivated.

---

## 🚀 Key Features

### 1. Day-by-Day Target Planner
- **Dashboard Today's Target Card:** Write today's specific target directly from the dashboard and mark it **Completed** or **Pending** in one click.
- **Interactive Calendar Grid:** Set specific targets for *each day of the month*. Cells display target descriptions, status indicators (`✓` for completed, `!` for pending), and glow green upon completion.
- **Unified Day Detail Dialog:** Click any day in the calendar to open a planner modal to write/edit daily target text, toggle completion, and manage scheduled milestones.
- **Planner Consistency Tracking:** Visualizes consistency through:
  - **Month Consistency Rate:** Completed targets relative to total days in the month (e.g. 10% consistency).
  - **Goal Success Rate:** Completed targets relative to total targets set (e.g. 85% success rate).
  - **Month Coverage:** Calendar days with set targets.

### 2. Focus Hour Tracker
- Live counting session timer that logs focus time.
- Start, pause, or reset sessions.
- Horizontal split indicator bar visualizes active vs. paused ratios.

### 3. Task Management Workspace
- Categorized (Work, Study, Health, Finance, Personal) checklist.
- Priority markers (High, Medium, Low) and project links.

### 4. Expense Tracker & Budget Alert
- Ledger to log income and expenditures.
- Categorized spending breakdown with visual progress tracking.
- **Alert Indicator:** Flashes a warning if monthly spending exceeds **85%** of your customized budget.

### 5. Daily Habit Loop
- Track habits with fire streaks (`🔥`) that increment with daily check-ins.

### 6. Custom Wallpaper & Glassmorphism
- Curated preset backgrounds that select randomly on Landing/Login.
- Customize panel: upload your own wallpapers (Base64) or input custom URLs.
- Real-time adjustment sliders for **backdrop blur** (0px - 20px) and **dark tint overlay** (0% - 100%) to ensure text accessibility.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, custom HSL styling
- **Components:** ShadCN UI (Radix Primitives)
- **Charts:** Recharts (SVG-based pie & bar analytics)
- **State Management:** Zustand with client-side localStorage persistence (keeps your data safe offline without database servers)

---

## 📂 Folder Layout

```text
├── app/
│   ├── dashboard/page.tsx  # Main Interactive Dashboard (Tabs, Timer, Ledger, Calendar)
│   ├── login/page.tsx      # Sign In & Sign Up templates
│   ├── layout.tsx          # Root Font & Document Metadata
│   └── page.tsx            # Landing Page Hero & Mockup Preview
├── components/
│   └── ui/                 # ShadCN UI components (Dialog, Progress, Input, etc.)
├── lib/
│   ├── quotes.ts           # Curated background presets & motivational quotes
│   └── utils.ts            # Styling helper functions
├── store/
│   └── useLifeStore.ts     # Global State store (Zustand & localStorage persistence)
└── public/                 # Static assets
```

---

## ⚡ Getting Started (Local Setup)

First, verify that [Node.js](https://nodejs.org) is installed on your system.

1. Open a terminal in the root project directory `g:\LIFE OS\`.
2. Install dependencies (if not already done):
   ```bash
   $env:PATH = "C:\Program Files\nodejs;" + $env:PATH
   npm.cmd install
   ```
3. Run the local development server:
   ```bash
   $env:PATH = "C:\Program Files\nodejs;" + $env:PATH
   npm.cmd run dev
   ```
   *(Note: If you get an error saying script execution is disabled on this system, make sure to add `.cmd` and run `npm.cmd run dev` to bypass the policy).*
4. Open your browser and navigate to:
    * **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ Login & SignUp
The application starts completely empty with zero database pre-fills. You can enter any custom email and password to log in or switch to the Sign Up view to create your own personal LifeOS workspace profile.
