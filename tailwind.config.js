/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'var(--background)',
          primary: '#0F0F1A',
          secondary: '#F9FAFB',
        },
        card: {
          DEFAULT: 'var(--card)',
          primary: '#1A1A2E',
          secondary: '#FFFFFF',
        },
        primary: '#7C3AED',
        accent: '#06B6D4',
        'text-primary': {
          DEFAULT: 'var(--text-primary)',
          dark: '#F9FAFB',
          light: '#1F2937',
        },
        'text-muted': {
          DEFAULT: 'var(--text-muted)',
          dark: '#6B7280',
          light: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
