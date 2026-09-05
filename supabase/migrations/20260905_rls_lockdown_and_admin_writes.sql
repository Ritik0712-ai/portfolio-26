-- ============================================================
-- RLS lockdown + admin write policies
--
-- Fixes three separate problems:
--   1. comments / timeline_events / feedback had RLS OFF entirely
--      -> anyone with the (public) anon key could read every
--         stored email address and modify any row.
--   2. blogs' only SELECT policy was scoped TO authenticated,
--      so anonymous visitors could not read the blog at all.
--   3. NO table had INSERT/UPDATE/DELETE policies, so with RLS on
--      the admin portal could not write anything. Every admin
--      route uses the anon key + the signed-in user's session,
--      never a service-role key, so admin writes must be granted
--      explicitly via auth.uid().
-- ============================================================

-- Admin allowlist check. SECURITY DEFINER so it can read
-- admin_users regardless of that table's own policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
$$;

-- Close the three fully-exposed tables
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback        ENABLE ROW LEVEL SECURITY;

-- Remove the old read-only / mis-scoped policies
DROP POLICY IF EXISTS "Allow authenticated reads on blogs"       ON public.blogs;
DROP POLICY IF EXISTS "Allow public reads on projects"           ON public.projects;
DROP POLICY IF EXISTS "Allow public reads on stats"              ON public.stats;
DROP POLICY IF EXISTS "Allow public reads on testimonials"       ON public.testimonials;
DROP POLICY IF EXISTS "Allow authenticated reads on admin_users" ON public.admin_users;

-- admin_users: a user may only confirm their own membership
CREATE POLICY "own admin row readable" ON public.admin_users
  FOR SELECT TO authenticated USING (id = auth.uid());

-- blogs
CREATE POLICY "public reads published blogs" ON public.blogs
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin manages blogs" ON public.blogs
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- projects
CREATE POLICY "public reads published projects" ON public.projects
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "admin manages projects" ON public.projects
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- stats
CREATE POLICY "public reads stats" ON public.stats
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manages stats" ON public.stats
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- testimonials
CREATE POLICY "public reads approved testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "admin manages testimonials" ON public.testimonials
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- timeline_events
CREATE POLICY "public reads timeline_events" ON public.timeline_events
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin manages timeline_events" ON public.timeline_events
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- comments: public may read approved ones and submit unapproved ones.
-- The WITH CHECK stops a submitter from self-approving their comment.
CREATE POLICY "public reads approved comments" ON public.comments
  FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "anyone may submit a comment" ON public.comments
  FOR INSERT TO anon, authenticated WITH CHECK (approved = false);
CREATE POLICY "admin manages comments" ON public.comments
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- feedback: write-only for the public, so stored emails stay private
CREATE POLICY "anyone may submit feedback" ON public.feedback
  FOR INSERT TO anon, authenticated WITH CHECK (reviewed = false);
CREATE POLICY "admin manages feedback" ON public.feedback
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Cover images are rendered from /storage/v1/object/public/... in
-- app/api/admin/upload/route.ts, which only resolves on a public
-- bucket. Without this every uploaded image 400s.
UPDATE storage.buckets SET public = true WHERE id = 'portfolio-media';
