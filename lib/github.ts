// GitHub data for /github and the homepage activity tile.
//
// With GITHUB_TOKEN set (a fine-grained, read-only token), numbers come from
// the GraphQL API and include private repositories and private contributions
// — as counts only; private repo names are never listed. Without a token it
// falls back to the public REST API (public repos only, 60 requests/hour).
//
// Callers cache the result for 60 seconds (route-level revalidate), so the
// site is at most a minute behind GitHub.

export const GITHUB_USERNAME = 'Ritik0712-ai';

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RepoSummary {
  id: number;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: string | null;
  pushedAt: string;
}

export interface GitHubOverview {
  authenticated: boolean;
  fetchedAt: string;
  profile: {
    login: string;
    name: string | null;
    bio: string | null;
    avatar: string;
    url: string;
    followers: number;
    following: number;
  };
  repos: { total: number; public: number; private: number | null };
  contributions: { totalLastYear: number; weeks: ContributionDay[][] } | null;
  recentRepos: RepoSummary[];
}

const LEVELS: Record<string, ContributionDay['level']> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': 'ritikagarwal.me',
    Accept: 'application/vnd.github+json',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return headers;
}

const QUERY = `
query($login: String!) {
  user(login: $login) {
    login name bio avatarUrl url
    followers { totalCount }
    following { totalCount }
    all: repositories(ownerAffiliations: OWNER) { totalCount }
    pub: repositories(ownerAffiliations: OWNER, privacy: PUBLIC) { totalCount }
    recent: repositories(ownerAffiliations: OWNER, privacy: PUBLIC, first: 6, orderBy: { field: PUSHED_AT, direction: DESC }) {
      nodes {
        databaseId name description url stargazerCount forkCount pushedAt
        primaryLanguage { name color }
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

async function fromGraphQL(): Promise<GitHubOverview | null> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_USERNAME } }),
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    console.error('GitHub GraphQL failed', res.status, await res.text().catch(() => ''));
    return null;
  }
  const json = await res.json();
  const u = json?.data?.user;
  if (!u) {
    console.error('GitHub GraphQL returned no user', json?.errors);
    return null;
  }
  const cal = u.contributionsCollection?.contributionCalendar;
  return {
    authenticated: true,
    fetchedAt: new Date().toISOString(),
    profile: {
      login: u.login,
      name: u.name,
      bio: u.bio,
      avatar: u.avatarUrl,
      url: u.url,
      followers: u.followers.totalCount,
      following: u.following.totalCount,
    },
    repos: { total: u.all.totalCount, public: u.pub.totalCount, private: u.all.totalCount - u.pub.totalCount },
    contributions: cal
      ? {
          totalLastYear: cal.totalContributions,
          weeks: cal.weeks.map((w: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }) =>
            w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 }))
          ),
        }
      : null,
    recentRepos: u.recent.nodes.map((r: {
      databaseId: number; name: string; description: string | null; url: string; stargazerCount: number;
      forkCount: number; pushedAt: string; primaryLanguage: { name: string; color: string } | null;
    }) => ({
      id: r.databaseId,
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount,
      forks: r.forkCount,
      language: r.primaryLanguage?.name ?? null,
      languageColor: r.primaryLanguage?.color ?? null,
      pushedAt: r.pushedAt,
    })),
  };
}

async function fromREST(): Promise<GitHubOverview | null> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, { headers: githubHeaders(), next: { revalidate: 60 } }),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=6`, { headers: githubHeaders(), next: { revalidate: 60 } }),
  ]);
  if (!userRes.ok) {
    console.error('GitHub REST failed', userRes.status);
    return null;
  }
  const u = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];
  return {
    authenticated: false,
    fetchedAt: new Date().toISOString(),
    profile: {
      login: u.login,
      name: u.name,
      bio: u.bio,
      avatar: u.avatar_url,
      url: u.html_url,
      followers: u.followers,
      following: u.following,
    },
    repos: { total: u.public_repos, public: u.public_repos, private: null },
    contributions: null,
    recentRepos: (Array.isArray(repos) ? repos : []).map((r: {
      id: number; name: string; description: string | null; html_url: string; stargazers_count: number;
      forks_count: number; language: string | null; pushed_at: string;
    }) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      url: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language,
      languageColor: null,
      pushedAt: r.pushed_at,
    })),
  };
}

export async function getGitHubOverview(): Promise<GitHubOverview | null> {
  try {
    if (process.env.GITHUB_TOKEN) {
      const viaGraphQL = await fromGraphQL();
      if (viaGraphQL) return viaGraphQL;
    }
    return await fromREST();
  } catch (err) {
    console.error('getGitHubOverview failed', err);
    return null;
  }
}
