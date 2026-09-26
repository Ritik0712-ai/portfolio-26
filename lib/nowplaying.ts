// "Now playing" for the Music apps and the homepage.
//
// Free path (recommended): Last.fm. Connect Spotify inside Last.fm once
// (Settings → Applications → Spotify scrobbling) and every track played on
// Spotify is scrobbled; Last.fm's API is free. Needs LASTFM_API_KEY +
// LASTFM_USERNAME.
//
// Optional path: Spotify's own Web API (SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET,
// SPOTIFY_REFRESH_TOKEN). Since Feb 2026 Spotify only allows this for app
// owners with Premium, so it's used only when those variables are set.

export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string | null;
  cover: string | null;
  url: string;
  playedAt: string | null;
  source: 'lastfm' | 'spotify';
}

const spotifySearch = (artist: string, title: string) =>
  `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`;

export const nowPlayingConfigured = () =>
  !!(process.env.LASTFM_API_KEY && process.env.LASTFM_USERNAME) ||
  !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_REFRESH_TOKEN);

async function fromLastfm(): Promise<NowPlaying | null> {
  const key = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USERNAME;
  if (!key || !user) return null;
  const res = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${key}&format=json&limit=1`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`Last.fm ${res.status}`);
  const data = await res.json();
  const raw = data?.recenttracks?.track;
  const t = Array.isArray(raw) ? raw[0] : raw;
  if (!t) return null;
  const images: { '#text': string; size: string }[] = t.image ?? [];
  let cover = images.find((i) => i.size === 'extralarge')?.['#text'] || images.at(-1)?.['#text'] || null;
  if (cover && cover.includes('2a96cbd8b46e442fc41c2b86b821562f')) cover = null; // Last.fm's blank placeholder
  const artist = t.artist?.['#text'] ?? t.artist?.name ?? '';
  return {
    isPlaying: t['@attr']?.nowplaying === 'true',
    title: t.name,
    artist,
    album: t.album?.['#text'] || null,
    cover,
    url: spotifySearch(artist, t.name),
    playedAt: t.date?.uts ? new Date(Number(t.date.uts) * 1000).toISOString() : null,
    source: 'lastfm',
  };
}

let spotifyToken: { value: string; exp: number } | null = null;

async function spotifyAccess() {
  if (spotifyToken && spotifyToken.exp > Date.now() + 30_000) return spotifyToken.value;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: process.env.SPOTIFY_REFRESH_TOKEN! }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Spotify token ${res.status}`);
  const j = await res.json();
  spotifyToken = { value: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return spotifyToken.value;
}

async function fromSpotify(): Promise<NowPlaying | null> {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET || !process.env.SPOTIFY_REFRESH_TOKEN) return null;
  const token = await spotifyAccess();
  const headers = { Authorization: `Bearer ${token}` };
  const cur = await fetch('https://api.spotify.com/v1/me/player/currently-playing?additional_types=track', { headers, cache: 'no-store' });
  if (cur.status === 200) {
    const j = await cur.json();
    const item = j?.item;
    if (item && j.currently_playing_type === 'track') {
      return {
        isPlaying: !!j.is_playing,
        title: item.name,
        artist: (item.artists ?? []).map((a: { name: string }) => a.name).join(', '),
        album: item.album?.name ?? null,
        cover: item.album?.images?.[0]?.url ?? null,
        url: item.external_urls?.spotify ?? spotifySearch('', item.name),
        playedAt: null,
        source: 'spotify',
      };
    }
  }
  const recent = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers, cache: 'no-store' });
  if (!recent.ok) return null;
  const r = (await recent.json())?.items?.[0];
  if (!r) return null;
  return {
    isPlaying: false,
    title: r.track.name,
    artist: (r.track.artists ?? []).map((a: { name: string }) => a.name).join(', '),
    album: r.track.album?.name ?? null,
    cover: r.track.album?.images?.[0]?.url ?? null,
    url: r.track.external_urls?.spotify,
    playedAt: r.played_at,
    source: 'spotify',
  };
}

export async function getNowPlaying(): Promise<NowPlaying | null> {
  try {
    return (await fromSpotify()) ?? (await fromLastfm());
  } catch (err) {
    console.error('Now playing failed', err);
    try {
      return await fromLastfm();
    } catch {
      return null;
    }
  }
}
