// Update this whenever public/resume.pdf is replaced.
export const resumeUpdated = '2026-09-06';

// Key points shown in the in-app résumé viewers. The full version lives in
// public/resume.pdf. Keep the two in sync.
export const resumeHighlights = {
  name: 'Ritik Agarwal',
  title: 'Software Developer | B.Tech CSE @ VIT Bhopal',
  email: 'ritikagarwal2468@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ritik-agarwal-58ba012b4/',
  github: 'https://github.com/Ritik0712-ai',
  summary:
    'CS undergrad who likes turning ideas into shipped products. Works across the full stack, from frontend to backend, and is currently focused on DSA and system design.',
  education: {
    school: 'Vellore Institute of Technology, Bhopal',
    degree: 'B.Tech in Computer Science & Engineering',
    detail: '2nd Year | Expected Graduation: 2028',
  },
  skills: [
    { label: 'Languages', items: 'Java, JavaScript, TypeScript, Python, C/C++, SQL' },
    { label: 'Frontend', items: 'React.js, Next.js, Tailwind CSS' },
    { label: 'Backend', items: 'Node.js, Express.js, REST APIs, WebSockets' },
    { label: 'Databases', items: 'MongoDB, MySQL, PostgreSQL, Firebase' },
  ],
  projects: [
    {
      name: 'Mindspace',
      tagline: 'AI-Powered Productivity & Mental Wellness Platform',
      stack: 'React.js • Node.js • MongoDB • AI/NLP APIs',
      points: [
        'Full-stack platform for journaling, habit tracking, and AI-driven mood analysis',
        'Cut API response times by 40% with caching and database indexing',
      ],
    },
    {
      name: 'StockSchool',
      tagline: 'Interactive Stock Market Learning Platform',
      stack: 'Next.js • TypeScript • Tailwind CSS • Chart.js',
      points: [
        'Teaches market basics through simulated trading, quizzes, and live data',
        'Live candlestick charts and a gamified learning path with leaderboards',
      ],
    },
  ],
};
