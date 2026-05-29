# LifeOS 🚀

LifeOS is a premium, highly interactive personal operating system and unified dashboard built to seamlessly manage your tasks, finances, algorithmic engineering growth, and daily focus limits—all in one place. 

Designed with a sleek, glassmorphic UI and an emphasis on ultra-fast keyboard-friendly navigation.

## 🌟 Core Features

- **Daily Cockpit & Focus Timer**: Track your daily targets and log deep work hours. A visual telemetry grid tracks your consistency over the last 84 days.
- **Financial Engine**: Lock in a monthly budget and track your expenses. The engine automatically predicts if you are going to overspend and provides a Financial Health Score.
- **Engineering Mode**: Track your coding growth. Contains a DSA/LeetCode log, a Language Hours tracker, a Computer Science topic mastery assessor, and a "Focus Debt" ledger to ensure you finish the courses you start.
- **Planner & Tasks**: A robust, zero-friction task list and event planner.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI/Styling**: React 19, Tailwind CSS, Glassmorphism aesthetics
- **State Management**: Zustand (Persisted via LocalStorage)
- **Animations & Charts**: Framer Motion, Recharts
- **Icons**: Lucide React

## 🚀 Running Locally

Follow these steps to run LifeOS on your local machine:

1. **Install Dependencies**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Dashboard**
   Open your browser and navigate to:
   👉 **http://localhost:3000**

## 🗺️ Roadmap & Phases

- **Phase 1: Core Planning (Completed)**
  - Daily Task System, Monthly Planner, Focus Mode HUD.
- **Phase 2: Financial OS (Completed)**
  - Budget Lock System, Expense Tracker, Predictor & Health Score.
- **Phase 3: Engineering & Knowledge (Completed)**
  - System Design, DBMS, DSA trackers, Language Progress, Focus Debt Ledger.
- **Phase 4: Life Engine & Intelligence (Upcoming)**
  - Monthly Missions, Life Score Engine, Reality vs Plan Dashboard, Regret Prediction.
- **Phase 5: Legacy & History (Upcoming)**
  - Year in Review, PDF Export, Lifetime Statistics.

## 🔒 Data Privacy

LifeOS is designed to be **100% private**. 
There is no backend database. All your tasks, financial data, and engineering progress are saved directly into your browser's **Local Storage** (using Zustand Persist). Your data never leaves your machine.

## 📂 Project Structure

- `/app` - Next.js App Router pages (`/dashboard`, `/login`, etc.)
- `/components` - Reusable UI elements (FinancialOS, EngineeringMode, etc.)
- `/store` - Zustand global state logic (`useLifeStore.ts`)

---
*Built for extreme focus and continuous growth.*
