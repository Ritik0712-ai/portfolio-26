import { createClient } from '@/lib/supabase/server';
import { nowData } from '@/data/now';
import { skillGroups } from '@/data/skills';
import { GITHUB_USERNAME, LEETCODE_USERNAME } from '@/lib/activity';

// Everything the assistant is allowed to know. It is rebuilt from the live
// database at most every 10 minutes per server instance, so admin edits to
// projects, timeline, certifications and posts flow into answers on their own.
let cached: { text: string; at: number } | null = null;
const TTL = 10 * 60 * 1000;

const PROFILE = `
Name: Ritik Agarwal
Currently: B.Tech Computer Science & Engineering student at VIT Bhopal (started Sep 2024, graduating 2028), based in India.
Positioning: Full-stack developer who builds dependable products from idea to production — clean architecture, thoughtful UX, maintainable code.
Availability: Open to internships and projects.
Other involvement: Governing Board member in the marketing department of AIESEC in Bhopal; has been involved with the Fintech Club at VIT.
LeetCode: just started practising DSA on LeetCode (profile linked on the site).
Interests: Building tech products for the Indian market (fintech for financial literacy, mental-health access, developer tools); system design; DSA.
Contact: email ritikagarwal2468@gmail.com, contact form at /contact, GitHub https://github.com/${GITHUB_USERNAME}, LinkedIn https://www.linkedin.com/in/ritik-agarwal-58ba012b4/, LeetCode https://leetcode.com/u/${LEETCODE_USERNAME}/
Site pages: /projects (case studies), /blog, /now, /uses, /resume, /contact, /feedback (leave a testimonial).
`.trim();

function block(title: string, body: string) {
  return `## ${title}\n${body.trim()}\n`;
}

export async function getAskContext(): Promise<string> {
  if (cached && Date.now() - cached.at < TTL) return cached.text;

  const supabase = await createClient();
  const [projects, timeline, certs, blogs] = await Promise.all([
    supabase
      .from('projects')
      .select('title, slug, short_description, role, problem, approach, technical_decisions, outcomes, learnings, technologies, demo_url, repo_url')
      .eq('published', true)
      .order('display_order', { ascending: true }),
    supabase.from('timeline_events').select('title, description, event_date').order('display_order', { ascending: true }),
    supabase.from('certifications').select('title, issuer, issue_date').eq('published', true),
    supabase.from('blogs').select('title, slug, excerpt, created_at').eq('published', true).order('created_at', { ascending: false }).limit(10),
  ]);

  const projectText = (projects.data ?? [])
    .map((p) => {
      const decisions = (p.technical_decisions ?? [])
        .map((d: { decision: string }) => `- ${d.decision}`)
        .join('\n');
      const outcomes = (p.outcomes ?? [])
        .map((o: { outcome: string; result: string }) => `- ${[o.outcome, o.result].filter(Boolean).join(': ')}`)
        .join('\n');
      return [
        `### ${p.title} (/projects/${p.slug})`,
        p.short_description && `Summary: ${p.short_description}`,
        p.role && `Role: ${p.role}`,
        p.technologies?.length && `Stack: ${p.technologies.join(', ')}`,
        p.problem && `Problem: ${p.problem}`,
        p.approach && `Approach: ${p.approach}`,
        decisions && `Key decisions:\n${decisions}`,
        outcomes && `Outcomes:\n${outcomes}`,
        p.learnings && `What he'd do differently: ${p.learnings}`,
        p.demo_url && `Live demo: ${p.demo_url}`,
        p.repo_url && `Code: ${p.repo_url}`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const timelineText = (timeline.data ?? [])
    .map((t) => `- ${t.event_date}: ${t.title}${t.description ? ` — ${t.description}` : ''}`)
    .join('\n');
  const certText = (certs.data ?? [])
    .map((c) => `- ${c.title} (${c.issuer}${c.issue_date ? `, ${c.issue_date}` : ''})`)
    .join('\n');
  const blogText = (blogs.data ?? [])
    .map((b) => `- "${b.title}" (/blog/${b.slug})${b.excerpt ? ` — ${b.excerpt}` : ''}`)
    .join('\n');
  const skillText = skillGroups.map((g) => `- ${g.title}: ${g.skills.join(', ')}`).join('\n');
  const nowText = [
    `Focus: ${nowData.focus}`,
    `Building: ${nowData.currentlyBuilding.join('; ')}`,
    `Learning: ${nowData.currentlyLearning.join('; ')}`,
    `Reading: ${nowData.currentlyReading.join('; ')}`,
    `(as of ${nowData.lastUpdated})`,
  ].join('\n');

  const text = [
    block('Profile', PROFILE),
    block('Skills', skillText),
    block('Projects', projectText || 'None listed.'),
    block('Experience timeline', timelineText || 'None listed.'),
    block('Certifications', certText || 'None listed.'),
    block('Now', nowText),
    block('Blog posts', blogText || 'None yet.'),
  ].join('\n');

  cached = { text, at: Date.now() };
  return text;
}
