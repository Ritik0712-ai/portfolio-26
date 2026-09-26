import { GITHUB_USERNAME, githubHeaders } from '@/lib/github';

// "What's new on this site", built from the portfolio repo's commit history.
// Commits are read with the same read-only GITHUB_TOKEN as the GitHub page
// and cached for an hour.

export const CHANGELOG_REPO = `${GITHUB_USERNAME}/portfolio-26`;

export type ChangeKind = 'new' | 'improved' | 'fixed' | 'content';

export interface Change {
  sha: string;
  title: string;
  details: string[];
  kind: ChangeKind;
  date: string; // ISO
  url: string | null;
}

export interface Changelog {
  changes: Change[];
  repoPublic: boolean;
  last30: number;
  activeDays30: number;
  weekStreak: number;
}

function classify(title: string): ChangeKind {
  const t = title.toLowerCase();
  if (/^(fix|fixes|fixed|hotfix|bugfix)\b|^fix[:(]/.test(t)) return 'fixed';
  if (/resume|blog post|content|copy|typo|^docs?\b|readme/.test(t)) return 'content';
  if (/^(add|adds|added|new|introduce|implement|feat|launch|create|build)\b|^feat[:(]/.test(t)) return 'new';
  return 'improved';
}

function clean(subject: string) {
  return subject
    .replace(/^(feat|fix|chore|refactor|perf|style|docs|content|build)(\([^)]*\))?!?:\s*/i, '')
    .replace(/^./, (c) => c.toUpperCase());
}

export async function getChangelog(): Promise<Changelog | null> {
  try {
    const [repoRes, ...pages] = await Promise.all([
      fetch(`https://api.github.com/repos/${CHANGELOG_REPO}`, { headers: githubHeaders(), next: { revalidate: 3600 } }),
      ...[1, 2, 3].map((page) =>
        fetch(`https://api.github.com/repos/${CHANGELOG_REPO}/commits?per_page=100&page=${page}`, {
          headers: githubHeaders(),
          next: { revalidate: 3600 },
        }),
      ),
    ]);
    if (!pages[0].ok) throw new Error(`GitHub commits ${pages[0].status}`);
    const repo = repoRes.ok ? await repoRes.json() : null;
    const repoPublic = repo ? !repo.private : false;

    const raw: { sha: string; html_url: string; commit: { message: string; author: { date: string }; committer: { date: string } }; parents: unknown[] }[] = [];
    for (const res of pages) {
      if (!res.ok) break;
      const batch = await res.json();
      if (!Array.isArray(batch) || !batch.length) break;
      raw.push(...batch);
      if (batch.length < 100) break;
    }

    const changes: Change[] = raw
      .filter((c) => c.parents.length < 2) // skip merge commits
      .map((c) => {
        const [subject, ...rest] = c.commit.message.split('\n');
        const details = rest
          .map((l) => l.trim())
          .filter((l) => l && !/^(co-authored-by|signed-off-by|claude-session|🤖)/i.test(l))
          .filter((l) => /^[-*•]\s+/.test(l))
          .map((l) => l.replace(/^[-*•]\s+/, ''))
          .slice(0, 6);
        return {
          sha: c.sha.slice(0, 7),
          title: clean(subject.trim()),
          details,
          kind: classify(subject.trim()),
          date: c.commit.author?.date ?? c.commit.committer.date,
          url: repoPublic ? c.html_url : null,
        };
      })
      .filter((c) => c.title && !/^(wip|merge|initial commit)\b/i.test(c.title));

    const now = Date.now();
    const recent = changes.filter((c) => now - new Date(c.date).getTime() < 30 * 86400_000);
    const days = new Set(recent.map((c) => c.date.slice(0, 10)));

    // Consecutive ISO weeks (ending this week or last) with at least one change.
    const weekOf = (iso: string) => Math.floor((new Date(iso).getTime() + 3 * 86400_000) / (7 * 86400_000));
    const weeks = new Set(changes.map((c) => weekOf(c.date)));
    let w = weekOf(new Date().toISOString());
    if (!weeks.has(w)) w -= 1;
    let weekStreak = 0;
    while (weeks.has(w)) {
      weekStreak += 1;
      w -= 1;
    }

    return { changes, repoPublic, last30: recent.length, activeDays30: days.size, weekStreak };
  } catch (err) {
    console.error('Changelog failed', err);
    return null;
  }
}
