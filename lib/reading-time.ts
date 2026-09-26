// The admin editor stores reading time as a bare number ("9"); older posts
// may already carry a unit. Always render it as "9 min read".
export function formatReadingTime(value: string | number | null | undefined) {
  const s = String(value ?? '').trim();
  return /^\d+$/.test(s) ? `${s} min read` : s;
}
