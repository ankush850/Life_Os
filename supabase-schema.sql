-- ============================================================
-- LIFE OS — Supabase Database Schema
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Profiles table (linked to auth.users)
-- Stores user settings separately for fast access
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  bg_image TEXT DEFAULT '',
  bg_blur INTEGER DEFAULT 10,
  bg_opacity INTEGER DEFAULT 50,
  theme TEXT DEFAULT 'dark',
  budget_limit NUMERIC DEFAULT 1500,
  monthly_income NUMERIC DEFAULT 0,
  savings_goal NUMERIC DEFAULT 0,
  locked_month TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User data table (stores entire app state as JSONB)
-- This is the "catch-all" that syncs with Zustand store
CREATE TABLE IF NOT EXISTS user_data (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures each user can ONLY access their own data
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see, update, and create their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Data: users can only see, update, and create their own data
CREATE POLICY "Users can view own data"
  ON user_data FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON user_data FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = id);
