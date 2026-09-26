// Update this whenever public/resume.pdf is replaced.
export const resumeUpdated = '2026-09-06';

// Content for the interactive résumé (components/resume/InteractiveResume.tsx).
// Mirrors public/resume.pdf. Keep the two in sync.
export const resume = {
  name: 'Ritik Agarwal',
  title: 'Software Developer',
  subtitle: 'B.Tech CSE @ VIT Bhopal',
  email: 'ritikagarwal2468@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ritik-agarwal-58ba012b4/',
  github: 'https://github.com/Ritik0712-ai',
  about:
    'Passionate CS undergrad who loves turning ideas into real, shipped products. Comfortable across the full stack — from pixel-perfect frontends to performant backend systems. Currently deep-diving into DSA and system design to crack top-tier SDE roles. Fast learner, team player, and always down to solve interesting engineering problems.',
  education: {
    school: 'Vellore Institute of Technology, Bhopal',
    degree: 'B.Tech in Computer Science & Engineering',
    year: '3rd Year',
    graduation: 'Expected Graduation: 2028',
  },
  skills: [
    { label: 'Languages', items: ['Java', 'JavaScript (ES6+)', 'TypeScript', 'Python', 'C/C++', 'SQL'] },
    { label: 'Frontend', items: ['React.js', 'Next.js', 'Tailwind CSS', 'HTML5', 'CSS3', 'Responsive UI/UX Design'] },
    { label: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs', 'JWT Authentication', 'WebSockets'] },
    { label: 'Databases', items: ['MongoDB', 'MySQL', 'PostgreSQL', 'Firebase'] },
    { label: 'Tools & Misc', items: ['Git', 'GitHub', 'VS Code', 'Linux', 'Postman', 'Figma', 'Vercel', 'Agile/Scrum'] },
  ],
  projects: [
    {
      name: 'Mindspace',
      tagline: 'AI-Powered Productivity & Mental Wellness Platform',
      stack: ['React.js', 'Node.js', 'MongoDB', 'AI/NLP APIs'],
      stats: [
        { value: '40%', label: 'faster APIs' },
        { value: '100+', label: 'concurrent users' },
      ],
      points: [
        "Built a full-stack platform combining journaling, habit tracking, and AI-driven mood analysis to support users' mental wellness journeys.",
        'Designed an intelligent dashboard that surfaces personalized insights and weekly progress reports using NLP-based sentiment analysis.',
        'Implemented secure user authentication, real-time data sync, and a responsive, accessible UI supporting 100+ concurrent users.',
        'Optimised API response times by 40% through caching strategies and database indexing — smooth performance at scale.',
      ],
    },
    {
      name: 'StockSchool',
      tagline: 'Interactive Stock Market Learning Platform',
      stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Finance APIs', 'Chart.js'],
      stats: [
        { value: '0', label: 'runtime type errors' },
        { value: 'Live', label: 'market data' },
      ],
      points: [
        'Developed an end-to-end educational platform that teaches stock market fundamentals through simulated trading, quizzes, and live market data.',
        'Integrated real-time stock feeds via third-party Finance APIs, rendering dynamic candlestick charts and portfolio analytics dashboards.',
        'Built a gamified learning path system with progress tracking and leaderboards, increasing average user session duration significantly.',
        'Architected a clean, modular codebase with TypeScript across the full stack — zero runtime type errors in production.',
      ],
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
