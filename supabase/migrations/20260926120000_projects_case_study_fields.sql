-- Case-study fields for project detail pages (applied live 26 Sep 2026).
alter table public.projects
  add column if not exists architecture text,
  add column if not exists learnings text;

comment on column public.projects.architecture is 'Mermaid flowchart source rendered on the case-study page';
comment on column public.projects.learnings is 'What I would do differently — case-study retrospective';
