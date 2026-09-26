import { LEETCODE_USERNAME } from '@/lib/activity';

// LeetCode's public GraphQL endpoint (no login, free). Used by the admin
// "Sync from LeetCode" button to pull recently accepted problems as drafts.

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`LeetCode ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

export interface LeetCodeSolve {
  title: string;
  slug: string;
  number: number | null;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  topics: string[];
  url: string;
  solvedAt: string; // YYYY-MM-DD
  language: string | null;
}

const LANG: Record<string, string> = { cpp: 'cpp', java: 'java', python: 'python', python3: 'python', javascript: 'javascript', typescript: 'typescript', c: 'c', golang: 'go' };

export async function recentSolves(limit = 20): Promise<LeetCodeSolve[]> {
  const { recentAcSubmissionList } = await gql<{ recentAcSubmissionList: { title: string; titleSlug: string; timestamp: string; lang: string }[] }>(
    'query($u:String!,$n:Int!){recentAcSubmissionList(username:$u,limit:$n){title titleSlug timestamp lang}}',
    { u: LEETCODE_USERNAME, n: limit },
  );
  // One entry per problem (latest accepted submission wins).
  const unique = new Map<string, { title: string; titleSlug: string; timestamp: string; lang: string }>();
  for (const s of recentAcSubmissionList ?? []) if (!unique.has(s.titleSlug)) unique.set(s.titleSlug, s);

  const out: LeetCodeSolve[] = [];
  for (const s of unique.values()) {
    const { question } = await gql<{ question: { questionFrontendId: string; difficulty: string; topicTags: { name: string }[] } | null }>(
      'query($s:String!){question(titleSlug:$s){questionFrontendId difficulty topicTags{name}}}',
      { s: s.titleSlug },
    );
    const d = new Date(Number(s.timestamp) * 1000 + 5.5 * 3600_000);
    out.push({
      title: s.title,
      slug: s.titleSlug,
      number: question ? Number(question.questionFrontendId) || null : null,
      difficulty: (question?.difficulty as LeetCodeSolve['difficulty']) ?? null,
      topics: question?.topicTags.map((t) => t.name) ?? [],
      url: `https://leetcode.com/problems/${s.titleSlug}/`,
      solvedAt: d.toISOString().slice(0, 10),
      language: LANG[s.lang] ?? null,
    });
  }
  return out;
}
