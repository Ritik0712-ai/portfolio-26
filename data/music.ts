// Ritik's picks for the RitikOS Music app — pulled from his Spotify top and
// recently played tracks (26 Sep 2026). Swap or add entries any time: the id
// is the part after /track/ in an open.spotify.com link. A whole playlist or
// album also works: set kind to 'playlist' or 'album'.
export interface MusicItem {
  id: string;
  kind: 'track' | 'playlist' | 'album';
  title: string;
  artist: string;
  album?: string;
  cover: string;
}

const cover = (hash: string) => `https://i.scdn.co/image/ab67616d00001e02${hash}`;

export const musicPicks: MusicItem[] = [
  { id: '0RsH8g8DxdYZgdGcod5I36', kind: 'track', title: 'Bairan', artist: 'Banjaare', album: 'Bairan', cover: cover('cdce9a38222807fa703b4396') },
  { id: '7iDAgeOdEZ9x9wDiB6SRHl', kind: 'track', title: 'Palka Pe Rakhu', artist: 'Sahil Dahiya Wrld, Dimple Jaatni', album: 'Palka Pe Rakhu', cover: cover('c512742d94d0e3c61c8875b2') },
  { id: '2iVj11OdEBNIGUv9f7jGPK', kind: 'track', title: 'Taare', artist: 'Farak, 10A, Saswat Balan', album: 'Deewar Ke Uss Paar', cover: cover('a81b61a834db74333eb53a2e') },
  { id: '51Ggv32i87ei9RYT0mkcVY', kind: 'track', title: 'Safar', artist: 'Bayaan, Sherazam', album: 'Safar', cover: cover('dace28f8bd8585a21fc58088') },
  { id: '2Hj6hoghTJWS0EP0CiCrgv', kind: 'track', title: 'Tasalli', artist: 'Vanitaa Pande, Prateek Gandhi', album: 'Tasalli', cover: cover('38a5a6f1d5f012a1a35d655f') },
  { id: '2sryZMs4aLRCLbXiOl69lP', kind: 'track', title: 'Main Rang Sharbaton Ka - Reprise', artist: 'Arijit Singh, Pritam', album: 'Phata Poster Nikhla Hero', cover: cover('351c76c32572c7a0ba818fac') },
  { id: '5hnDpsh6MfV5kP3Q0wznOO', kind: 'track', title: 'Aham Brahmasmi', artist: 'Hrutul, Tirth Thakkar', album: 'YOUFORIA chp. Kaliyudh', cover: cover('59be2e39b522e049428dacbb') },
  { id: '0hsMEUrNxOErFvXQDqK7Ha', kind: 'track', title: 'Bhajan Jamming - Ram Ram Jai Raja Ram', artist: 'Backstage Siblings', album: 'Bhajan Jamming', cover: cover('688dfb20ac68e204f28b4895') },
  { id: '62e6Y5w4iF64mrEoJYfK2b', kind: 'track', title: 'Shiv Damru Sound', artist: 'Sanskar Bhakti', album: 'Shiv Damru Sound', cover: cover('1472a3c225c287f7ad9912de') },
];

export const spotifyEmbed = (item: MusicItem, dark = true) =>
  `https://open.spotify.com/embed/${item.kind}/${item.id}?utm_source=generator${dark ? '&theme=0' : ''}`;

export const spotifyLink = (item: MusicItem) => `https://open.spotify.com/${item.kind}/${item.id}`;
