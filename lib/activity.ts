// Server-only helpers for the homepage activity cells. Both upstreams are
// public and unauthenticated, so responses are cached (revalidate) to stay
// well inside GitHub's 60 req/hour anonymous limit. Set GITHUB_TOKEN in
// Vercel to raise that limit if it is ever hit.

export const GITHUB_USERNAME = 'Ritik0712-ai';
export const LEETCODE_USERNAME = 'Ritik812800';

const REVALIDATE = 1800;

export interface GitHubActivity {
  profileUrl: string;
  pushesLast30Days: number;
  activeDaysLast30: number;
  daily: number[]; // 30 entries, oldest -> newest, pushes per day
  latest: {
    repo: string;
    repoUrl: string;
    message: string | null;
    url: string | null;
    at: string;
  } | null;
}

export interface LeetCodeStats {
  profileUrl: string;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'User-Agent': 'ritikagarwal.me',
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

export async function getGitHubActivity(): Promise<GitHubActivity | null> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
      { headers: githubHeaders(), next: { revalidate: REVALIDATE } }
    );
    if (!res.ok) return null;
    const events: Array<{ type: string; created_at: string; repo: { name: string } }> = await res.json();
    const pushes = events.filter((e) => e.type === 'PushEvent');

    const DAY = 86_400_000;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const start = today.getTime() - 29 * DAY;
    const daily = new Array(30).fill(0);
    for (const p of pushes) {
      const t = new Date(p.created_at);
      t.setUTCHours(0, 0, 0, 0);
      const idx = Math.round((t.getTime() - start) / DAY);
      if (idx >= 0 && idx < 30) daily[idx] += 1;
    }

    let latest: GitHubActivity['latest'] = null;
    const last = pushes[0];
    if (last) {
      // The events API no longer includes commit messages, so read the head
      // commit of that repo directly.
      let message: string | null = null;
      let url: string | null = null;
      try {
        const c = await fetch(`https://api.github.com/repos/${last.repo.name}/commits?per_page=1`, {
          headers: githubHeaders(),
          next: { revalidate: REVALIDATE },
        });
        if (c.ok) {
          const [commit] = await c.json();
          message = commit?.commit?.message?.split('\n')[0] ?? null;
          url = commit?.html_url ?? null;
        }
      } catch {
        /* message is optional */
      }
      latest = {
        repo: last.repo.name.split('/')[1] ?? last.repo.name,
        repoUrl: `https://github.com/${last.repo.name}`,
        message,
        url,
        at: last.created_at,
      };
    }

    return {
      profileUrl: `https://github.com/${GITHUB_USERNAME}`,
      pushesLast30Days: daily.reduce((a, b) => a + b, 0),
      activeDaysLast30: daily.filter(Boolean).length,
      daily,
      latest,
    };
  } catch (err) {
    console.error('GitHub activity failed', err);
    return null;
  }
}

export async function getLeetCodeStats(): Promise<LeetCodeStats | null> {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
      body: JSON.stringify({
        query:
          'query($u:String!){matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}}}}',
        variables: { u: LEETCODE_USERNAME },
      }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rows: Array<{ difficulty: string; count: number }> =
      json?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];
    const get = (d: string) => rows.find((r) => r.difficulty === d)?.count ?? 0;
    return {
      profileUrl: `https://leetcode.com/u/${LEETCODE_USERNAME}/`,
      solved: get('All'),
      easy: get('Easy'),
      medium: get('Medium'),
      hard: get('Hard'),
    };
  } catch (err) {
    console.error('LeetCode stats failed', err);
    return null;
  }
}
