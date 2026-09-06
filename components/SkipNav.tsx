'use client';

export default function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-surface focus:border focus:border-border focus:rounded focus:text-text-primary focus:text-sm focus:font-body focus:shadow-lg"
    >
      Skip to content
    </a>
  );
}
