import { NextResponse } from 'next/server';
import { getDsaProblems } from '@/lib/public-data';

export const dynamic = 'force-dynamic';

// Published DSA journal entries — used by RitikOS apps (live updates).
export async function GET() {
  const problems = await getDsaProblems();
  return NextResponse.json({ problems });
}
