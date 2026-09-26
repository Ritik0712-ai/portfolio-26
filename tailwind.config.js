// Colours are CSS variables (hex values that switch with the theme), so
// Tailwind can't apply opacity modifiers like `bg-accent/30` to them by
// itself — those classes silently generated no CSS. color-mix() with the
// <alpha-value> placeholder makes every modifier work.
const withAlpha = (name) => `color-mix(in srgb, var(${name}) calc(<alpha-value> * 100%), transparent)`;

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
        bg: withAlpha('--color-bg'),
        'bg-secondary': withAlpha('--color-bg-secondary'),
        'bg-tertiary': withAlpha('--color-bg-tertiary'),
        surface: withAlpha('--color-surface'),
        'surface-hover': withAlpha('--color-surface-hover'),
        'text-primary': withAlpha('--color-text-primary'),
        'text-secondary': withAlpha('--color-text-secondary'),
        'text-muted': withAlpha('--color-text-muted'),
        'text-faint': withAlpha('--color-text-faint'),
        accent: withAlpha('--color-accent'),
        'accent-warm': withAlpha('--color-accent-warm'),
        'accent-warm-light': withAlpha('--color-accent-warm-light'),
        border: withAlpha('--color-border'),
        'border-subtle': withAlpha('--color-border-subtle'),
        rule: withAlpha('--color-rule'),
        success: withAlpha('--color-success'),
        warning: withAlpha('--color-warning'),
        error: withAlpha('--color-error'),
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
      boxShadow: {
        sm: '0 1px 2px var(--color-shadow)',
        DEFAULT: '0 2px 6px var(--color-shadow)',
        md: '0 4px 12px var(--color-shadow-md)',
        lg: '0 8px 24px var(--color-shadow-lg)',
      },
      maxWidth: {
        prose: '65ch',
      },
      typography: {
        editorial: {
          css: {
            '--tw-prose-body': 'var(--color-text-secondary)',
            '--tw-prose-headings': 'var(--color-text-primary)',
            '--tw-prose-links': 'var(--color-accent)',
            '--tw-prose-bold': 'var(--color-text-primary)',
            '--tw-prose-code': 'var(--color-accent-warm)',
            '--tw-prose-quotes': 'var(--color-text-muted)',
          },
        },
      },
    },
  },
  plugins: [],
};
