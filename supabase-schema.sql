-- Supabase Database Schema for Portfolio
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (idempotent)

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'Tech',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  full_description TEXT,
  image TEXT,
  demo_url TEXT,
  repo_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  slug TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);

-- Enable Row Level Security (RLS)
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read blogs" ON blogs;
DROP POLICY IF EXISTS "Allow public read projects" ON projects;
DROP POLICY IF EXISTS "Allow public read comments" ON comments;
DROP POLICY IF EXISTS "Allow public insert blogs" ON blogs;
DROP POLICY IF EXISTS "Allow public insert projects" ON projects;
DROP POLICY IF EXISTS "Allow public insert comments" ON comments;
DROP POLICY IF EXISTS "Allow public update blogs" ON blogs;
DROP POLICY IF EXISTS "Allow public delete blogs" ON blogs;
DROP POLICY IF EXISTS "Allow public update projects" ON projects;
DROP POLICY IF EXISTS "Allow public delete projects" ON projects;
DROP POLICY IF EXISTS "Allow public update comments" ON comments;
DROP POLICY IF EXISTS "Allow public delete comments" ON comments;

-- Allow public read access
CREATE POLICY "Allow public read blogs" ON blogs FOR SELECT USING (true);
CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read comments" ON comments FOR SELECT USING (approved = true);

-- Allow public insert (for admin panel - anon role)
CREATE POLICY "Allow public insert blogs" ON blogs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert projects" ON projects FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public insert comments" ON comments FOR INSERT TO anon WITH CHECK (true);

-- Allow public update/delete
CREATE POLICY "Allow public update blogs" ON blogs FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete blogs" ON blogs FOR DELETE TO anon USING (true);
CREATE POLICY "Allow public update projects" ON projects FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete projects" ON projects FOR DELETE TO anon USING (true);
CREATE POLICY "Allow public update comments" ON comments FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete comments" ON comments FOR DELETE TO anon USING (true);
