// OPTIONAL — only if you have Spotify Premium (Spotify's Web API requires it
// for app owners since Feb 2026). The free route is Last.fm; see README notes.
//
// 1. Create an app at https://developer.spotify.com/dashboard
//    Redirect URI: http://127.0.0.1:8888/callback
// 2. SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... node scripts/spotify-token.mjs
// 3. Open the printed link, approve, and copy the refresh token it prints into
//    Vercel as SPOTIFY_REFRESH_TOKEN (plus the client id and secret).

import http from 'node:http';

const id = process.env.SPOTIFY_CLIENT_ID;
const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}
const redirect = 'http://127.0.0.1:8888/callback';
const scope = 'user-read-currently-playing user-read-recently-played';
const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect)}`;

http
  .createServer(async (req, res) => {
    const code = new URL(req.url, redirect).searchParams.get('code');
    if (!code) return res.end('Waiting for Spotify…');
    const r = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect }),
    });
    const j = await r.json();
    res.end(j.refresh_token ? 'Done — go back to the terminal.' : `Error: ${JSON.stringify(j)}`);
    console.log(j.refresh_token ? `\nSPOTIFY_REFRESH_TOKEN=${j.refresh_token}\n` : j);
    process.exit(0);
  })
  .listen(8888, '127.0.0.1', () => console.log(`Open this link and approve:\n\n${url}\n`));
