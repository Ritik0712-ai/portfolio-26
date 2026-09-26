import type { DsaProblem } from '@/types';

// Roadmap for the DSA journal: the 16 standard interview topics with the
// problem counts of the widely used "150 essential problems" list, so the
// progress bars mean something. Each journal entry counts towards exactly
// one topic — the most specific one its LeetCode tags match.

export interface RoadmapTopic {
  id: string;
  label: string;
  hi: string;
  target: number;
  tags: string[]; // LeetCode tag names or slugs, lower-case
}

export const ROADMAP: RoadmapTopic[] = [
  { id: 'arrays', label: 'Arrays & Hashing', hi: 'ऐरे और हैशिंग', target: 9, tags: ['array', 'hash table', 'hash-table', 'string', 'prefix sum', 'prefix-sum', 'counting', 'sorting', 'matrix'] },
  { id: 'two-pointers', label: 'Two Pointers', hi: 'टू पॉइंटर्स', target: 5, tags: ['two pointers', 'two-pointers'] },
  { id: 'sliding-window', label: 'Sliding Window', hi: 'स्लाइडिंग विंडो', target: 6, tags: ['sliding window', 'sliding-window'] },
  { id: 'stack', label: 'Stack', hi: 'स्टैक', target: 7, tags: ['stack', 'monotonic stack', 'monotonic-stack'] },
  { id: 'binary-search', label: 'Binary Search', hi: 'बाइनरी सर्च', target: 7, tags: ['binary search', 'binary-search'] },
  { id: 'linked-list', label: 'Linked List', hi: 'लिंक्ड लिस्ट', target: 11, tags: ['linked list', 'linked-list', 'doubly-linked list', 'doubly-linked-list'] },
  { id: 'trees', label: 'Trees', hi: 'ट्रीज़', target: 15, tags: ['tree', 'binary tree', 'binary-tree', 'binary search tree', 'binary-search-tree'] },
  { id: 'tries', label: 'Tries', hi: 'ट्राई', target: 3, tags: ['trie'] },
  { id: 'heap', label: 'Heap / Priority Queue', hi: 'हीप / प्रायोरिटी क्यू', target: 7, tags: ['heap (priority queue)', 'heap-priority-queue', 'heap'] },
  { id: 'backtracking', label: 'Backtracking', hi: 'बैकट्रैकिंग', target: 9, tags: ['backtracking'] },
  { id: 'graphs', label: 'Graphs', hi: 'ग्राफ़', target: 19, tags: ['graph', 'breadth-first search', 'breadth-first-search', 'union find', 'union-find', 'topological sort', 'topological-sort', 'shortest path', 'shortest-path', 'minimum spanning tree', 'minimum-spanning-tree'] },
  { id: 'dp', label: 'Dynamic Programming', hi: 'डायनामिक प्रोग्रामिंग', target: 23, tags: ['dynamic programming', 'dynamic-programming', 'memoization'] },
  { id: 'greedy', label: 'Greedy', hi: 'ग्रीडी', target: 8, tags: ['greedy'] },
  { id: 'intervals', label: 'Intervals', hi: 'इंटरवल्स', target: 6, tags: ['intervals', 'interval', 'line sweep', 'line-sweep'] },
  { id: 'math', label: 'Math & Geometry', hi: 'मैथ और ज्योमेट्री', target: 8, tags: ['math', 'geometry', 'number theory', 'number-theory'] },
  { id: 'bits', label: 'Bit Manipulation', hi: 'बिट मैनिपुलेशन', target: 7, tags: ['bit manipulation', 'bit-manipulation', 'bitmask'] },
];

// Most specific first; Arrays & Hashing is the catch-all.
const PRIORITY = ['tries', 'intervals', 'sliding-window', 'two-pointers', 'binary-search', 'backtracking', 'heap', 'linked-list', 'dp', 'graphs', 'trees', 'bits', 'greedy', 'stack', 'math', 'arrays'];

export function topicOf(p: Pick<DsaProblem, 'topics'>): RoadmapTopic | null {
  const tags = p.topics.map((t) => t.toLowerCase().trim());
  for (const id of PRIORITY) {
    const topic = ROADMAP.find((r) => r.id === id)!;
    if (tags.some((t) => topic.tags.includes(t))) return topic;
  }
  return null;
}

export function roadmapProgress(problems: Pick<DsaProblem, 'topics'>[]) {
  const counts = new Map<string, number>();
  let other = 0;
  for (const p of problems) {
    const t = topicOf(p);
    if (t) counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
    else other += 1;
  }
  return { topics: ROADMAP.map((r) => ({ ...r, done: counts.get(r.id) ?? 0 })), other };
}

/** Consecutive days (ending today or yesterday, IST) with at least one solve. */
export function dayStreak(problems: Pick<DsaProblem, 'solved_at'>[]) {
  const days = new Set(problems.map((p) => p.solved_at.slice(0, 10)));
  const ist = (d: Date) => new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
  let cursor = new Date();
  if (!days.has(ist(cursor))) cursor = new Date(cursor.getTime() - 86400_000);
  let streak = 0;
  while (days.has(ist(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - 86400_000);
  }
  return streak;
}

export const DSA_LANGUAGES = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
];

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
