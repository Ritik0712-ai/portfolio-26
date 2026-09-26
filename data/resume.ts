// Update this whenever the content below changes, then rebuild the PDF:
//   npm run resume:pdf
export const resumeUpdated = '2026-09-26';

// Single source for the résumé: the interactive version
// (components/resume/InteractiveResume.tsx) renders it directly, and
// scripts/build-resume-pdf.mjs prints the ATS-friendly public/resume.pdf
// from it. Plain data only — the build script imports this file directly.
export const resume = {
  name: 'Ritik Agarwal',
  title: 'Full-Stack Developer',
  subtitle: 'B.Tech CSE @ VIT Bhopal',
  location: 'India',
  email: 'ritikagarwal2468@gmail.com',
  website: 'https://www.ritikagarwal.me',
  linkedin: 'https://www.linkedin.com/in/ritik-agarwal-58ba012b4/',
  github: 'https://github.com/Ritik0712-ai',
  leetcode: 'https://leetcode.com/u/Ritik812800/',
  about:
    'Full-stack developer and 3rd-year CS student who builds and deploys complete products — frontend, APIs, database and hosting — and writes up the decisions behind them. Currently a full-stack web development intern at Labmentix, practising DSA and system design on the side.',
  education: {
    school: 'Vellore Institute of Technology, Bhopal',
    degree: 'B.Tech in Computer Science & Engineering',
    period: 'Sep 2024 – 2028',
    year: '3rd Year',
    graduation: 'Expected Graduation: 2028',
  },
  experience: [
    {
      role: 'Full-Stack Web Development Intern',
      org: 'Labmentix',
      period: 'Jun 2026 – Present',
      points: [
        'Building and shipping features across the frontend, APIs and database of a production web codebase.',
      ],
    },
    {
      role: 'Senior Marketing Manager',
      org: 'AIESEC in Bhopal',
      period: 'Feb 2026 – Present',
      points: [
        'Promoted from Junior Marketing Manager (Feb 2026) to Senior Marketing Manager (Aug 2026) within six months.',
        'Serve on the Governing Board of the marketing department.',
      ],
    },
  ],
  skills: [
    { label: 'Languages', items: ['TypeScript', 'JavaScript', 'Java', 'Python', 'C/C++', 'SQL'] },
    { label: 'Frontend', items: ['React', 'Next.js', 'Vite', 'Tailwind CSS'] },
    { label: 'Backend', items: ['Node.js', 'Express', 'REST APIs', 'JWT Auth', 'Better Auth'] },
    { label: 'Databases', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Drizzle ORM'] },
    { label: 'Cloud & AI', items: ['Groq / Gemini APIs', 'Supabase', 'Neon', 'Vercel', 'Render', 'Cloudflare R2', 'Git & GitHub'] },
  ],
  projects: [
    {
      name: 'TripSync',
      tagline: 'AI Trip Planner with Real-World Constraints',
      stack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Neon', 'Drizzle ORM', 'Better Auth', 'Groq / Gemini APIs', 'Tailwind CSS'],
      demo: 'https://tripsync-hazel.vercel.app',
      repo: 'https://github.com/Ritik0712-ai/TripSync',
      stats: [
        { value: '3', label: 'access roles' },
        { value: '₹0', label: 'running cost' },
      ],
      points: [
        'Generates day-by-day itineraries that respect opening hours, meal times, travel time between stops and a fixed budget; output is validated as structured JSON and stored as relational rows.',
        'Routed generation through an LLM provider chain (Groq, then Gemini) ordered by an environment variable, so a provider outage is a restart rather than a redeploy.',
        'Fixed an "infinite recursion detected in policy" failure between two row-level-security policies by moving access control into one owner/editor/viewer check that every route calls.',
        'Migrated mid-build from Supabase to Neon Postgres with Drizzle ORM and Better Auth without losing working features.',
      ],
    },
    {
      name: 'Voxora',
      tagline: 'Multilingual Text-to-Speech that Translates First',
      stack: ['React', 'Vite', 'Node.js', 'Express', 'PostgreSQL', 'Neon', 'JWT Auth', 'Cloudflare R2'],
      demo: 'https://voxora-tau.vercel.app',
      repo: 'https://github.com/Ritik0712-ai/Voxora',
      stats: [
        { value: '15', label: 'languages' },
        { value: '30', label: 'neural voices' },
      ],
      points: [
        'Built a translate-then-synthesise pipeline so the chosen language is the one you hear — 30 neural voices across 15 languages including Hindi, Bengali and Tamil.',
        'Diagnosed a production-only failure: server-side translation was IP rate-limited (HTTP 429/403); moved translation to the browser so each visitor uses their own IP, keeping a server fallback.',
        'Moved generated audio from an ephemeral filesystem to Cloudflare R2 behind a storage interface; verified by deleting local files and confirming playback still returned HTTP 200.',
        'Runs entirely on free tiers with no billing account; speech providers are swappable through one environment variable.',
      ],
    },
    {
      name: 'MindSpace',
      tagline: 'Anonymous Mental-Wellness Platform',
      stack: ['React', 'Node.js', 'MongoDB', 'NLP APIs'],
      demo: 'https://mindspace-app-flame.vercel.app',
      repo: 'https://github.com/Ritik0712-ai/mindspace-app',
      stats: [
        { value: 'E2E', label: 'encrypted entries' },
        { value: 'Free', label: 'basic tier' },
      ],
      points: [
        'Anonymous-first platform for people who cannot afford ₹1,500–3,000 therapy sessions: no real name needed and end-to-end encrypted journal entries.',
        'Journaling and habit tracking feed an NLP sentiment-analysis layer that turns entries into personalised weekly insights.',
        'Added an anonymous peer-support feed alongside secure authentication and real-time data sync.',
      ],
    },
  ],
  certifications: [
    {
      title: 'The Bits and Bytes of Computer Networking',
      issuer: 'Google (Coursera)',
      date: 'Jul 2026',
      url: 'https://coursera.org/share/8f88a3132e5e0a9ebf4064aec61c3d78',
    },
  ],
  coursework: [
    'Data Structures & Algorithms',
    'Object-Oriented Programming',
    'Database Management Systems',
    'Operating Systems',
    'Computer Networks',
    'System Design (Self-Study)',
  ],
};
