-- The projects table predates the editorial redesign and was missing four
-- columns the current code requires. /api/projects orders by display_order,
-- so every homepage load 500'd and the Selected Work section silently
-- rendered its "No featured projects yet" empty state instead.
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS short_description text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS cover_image       text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS gallery           text[] DEFAULT '{}';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS display_order     integer DEFAULT 0;

-- Carry over the legacy single-image column so nothing is lost.
UPDATE public.projects SET cover_image = image WHERE cover_image IS NULL AND image IS NOT NULL;
