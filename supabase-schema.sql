-- Supabase Database Schema for Portfolio
-- Run this in your Supabase SQL Editor
-- DISABLES RLS for simplicity

-- Drop existing tables if they exist
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS timeline_events CASCADE;
DROP TABLE IF EXISTS stats CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;

-- Create blogs table
CREATE TABLE blogs (
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
CREATE TABLE projects (
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
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  slug TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stats table (for "Numbers Don't Lie" section)
CREATE TABLE stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL,
  value INTEGER NOT NULL,
  suffix TEXT DEFAULT '',
  label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table (for "What People Say" section)
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  avatar TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  display_order INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create timeline_events table (for "Journey" section)
CREATE TABLE timeline_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  event_type TEXT DEFAULT 'default',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table (for collecting real feedback)
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  company TEXT,
  project TEXT,
  rating INTEGER DEFAULT 5,
  content TEXT NOT NULL,
  permission_display BOOLEAN DEFAULT false,
  reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default stats
INSERT INTO stats (icon, value, suffix, label, display_order) VALUES
  ('Code', 3, '+', 'Projects Shipped'),
  ('Users', 500, '+', 'Users Reached'),
  ('Globe', 1, '', 'Country'),
  ('Coffee', 100, '+', 'Cups of Coffee');

-- Insert default testimonials
INSERT INTO testimonials (name, role, company, content, rating, approved, display_order) VALUES
  ('Aryan Sharma', 'Frontend Developer', 'TechCorp', 'Ritik is one of the most dedicated developers I have worked with. His attention to detail and problem-solving skills are exceptional.', 5, true, 1),
  ('Priya Patel', 'Product Manager', 'StartupX', 'Working with Ritik was a great experience. He delivers quality work on time and is always willing to help.', 5, true, 2),
  ('Vikram Singh', 'Full Stack Dev', 'DevHub', 'Ritik brings both technical skills and creativity to every project. Highly recommended!', 5, true, 3);

-- Insert default timeline events
INSERT INTO timeline_events (icon, title, description, event_date, event_type, display_order) VALUES
  ('GraduationCap', 'Started at VIT Bhopal', 'Joined Computer Science & Engineering (4-year program).', '2025', 'education', 1),
  ('Code', 'First Real Project', 'Built StockSchool - a stock market education platform.', '2025', 'project', 2),
  ('Rocket', 'MindSpace Launch', 'Shipped MindSpace - mental health app for the Indian market.', '2025', 'project', 3),
  ('Briefcase', 'Tech Internship', 'Gaining real-world experience building production systems.', '2026', 'work', 4),
  ('Heart', 'Still Building', 'Every day is a chance to create something meaningful.', 'Present', 'current', 5);

-- Create indexes
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_comments_slug ON comments(slug);
CREATE INDEX idx_comments_approved ON comments(approved);
CREATE INDEX idx_stats_order ON stats(display_order);
CREATE INDEX idx_testimonials_order ON testimonials(display_order);
CREATE INDEX idx_testimonials_approved ON testimonials(approved);
CREATE INDEX idx_timeline_order ON timeline_events(display_order);
CREATE INDEX idx_feedback_reviewed ON feedback(reviewed);

-- DISABLE RLS (no authentication needed)
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
