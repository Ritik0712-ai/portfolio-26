-- Activity log table for admin actions tracking
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON activity_log(resource_type, resource_id);

-- Scheduled publish column for blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_blogs_scheduled ON blogs(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;

-- Scheduled publish column for projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_projects_scheduled ON projects(scheduled_publish_at) WHERE scheduled_publish_at IS NOT NULL;

-- Enable RLS on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Admin users can view their own activity
CREATE POLICY "Admins can view own activity log" ON activity_log
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM admin_users)
  );

-- Admin users can insert their own activity
CREATE POLICY "Admins can insert own activity log" ON activity_log
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users) AND user_id = auth.uid()
  );
