import { NextResponse } from 'next/server';
import { getNowPlaying, nowPlayingConfigured } from '@/lib/nowplaying';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!nowPlayingConfigured()) return NextResponse.json({ configured: false });
  const track = await getNowPlaying();
  return NextResponse.json(
    { configured: true, track },
    { headers: { 'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40' } },
  );
}
