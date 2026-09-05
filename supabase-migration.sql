-- ============================================================
-- Portfolio Migration: Old Money CMS
-- Additive only — never drops or recreates existing tables
-- Run in Supabase SQL Editor
-- ============================================================

BEGIN;

-- 0. Create timeline table if it doesn't exist
CREATE TABLE IF NOT EXISTS timeline (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  category TEXT DEFAULT 'work',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Create admin_users allowlist table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add case-study fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS problem TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS approach TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technical_decisions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS outcomes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Rename existing columns for clarity (optional, safe since old code won't reference them)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS short_description TEXT;

-- 3. Ensure blogs has required fields
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 4. Add indexes for published content queries
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(display_order) NULLS LAST;

-- 5. Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 6. Admin users policies
CREATE POLICY "Admin users can read admin_users"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Only admin users can manage admin_users"
  ON admin_users FOR ALL
  USING (auth.uid() = id);

-- 7. Blogs policies
CREATE POLICY "Anyone can read published blogs"
  ON blogs FOR SELECT
  USING (published = true OR auth.uid() = (SELECT id FROM admin_users LIMIT 1));

CREATE POLICY "Admin can insert blogs"
  ON blogs FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can update blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can delete blogs"
  ON blogs FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- 8. Projects policies
CREATE POLICY "Anyone can read published projects"
  ON projects FOR SELECT
  USING (published = true OR auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can insert projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can update projects"
  ON projects FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can delete projects"
  ON projects FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- 9. Testimonials policies (only approved ones public)
CREATE POLICY "Anyone can read approved testimonials"
  ON testimonials FOR SELECT
  USING (approved = true OR auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Anyone can submit testimonials (for review)"
  ON testimonials FOR INSERT
  WITH CHECK (approved = false);

CREATE POLICY "Admin can update testimonials"
  ON testimonials FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can delete testimonials"
  ON testimonials FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- 10. Stats policies (read-only for public)
CREATE POLICY "Anyone can read stats"
  ON stats FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage stats"
  ON stats FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- 11. Timeline policies (read-only for public)
CREATE POLICY "Anyone can read timeline"
  ON timeline_events FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage timeline"
  ON timeline_events FOR ALL
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- 12. Feedback policies (submit only for public)
CREATE POLICY "Anyone can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read feedback"
  ON feedback FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can update feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can delete feedback"
  ON feedback FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- 13. Comments policies
CREATE POLICY "Anyone can read approved comments"
  ON comments FOR SELECT
  USING (approved = true OR auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Anyone can submit comments"
  ON comments FOR INSERT
  WITH CHECK (approved = false);

CREATE POLICY "Admin can moderate comments"
  ON comments FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Admin can delete comments"
  ON comments FOR DELETE
  USING (auth.uid() IN (SELECT id FROM admin_users));

COMMIT;

-- ============================================================
-- SETUP STEPS (run after this migration):
--
-- 1. In Supabase dashboard, create an auth user for yourself:
--    Authentication → Users → Add User → Email + Password
--
-- 2. Get that user's UUID from the auth.users table, then:
--
--    INSERT INTO admin_users (id) VALUES ('your-uuid-here');
--
-- 3. Create the Storage bucket:
--    Storage → New Bucket → Name: "portfolio-media"
--    Make it public: false (private, only owner uploads)
--
-- 4. Add environment variables to .env.local:
--    (remove ADMIN_PASSWORD, use Supabase auth instead)
--    NEXT_PUBLIC_SUPABASE_URL=your-url
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
--
-- 5. In Vercel, add the same env vars in project settings.
-- ============================================================
