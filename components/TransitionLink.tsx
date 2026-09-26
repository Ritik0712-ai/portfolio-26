'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ComponentProps, type MouseEvent } from 'react';

// Minimal View Transitions API wiring for the App Router (the same idea as
// the next-view-transitions package, without the dependency). A click starts
// document.startViewTransition(), pushes the route, and the transition
// finishes once the new pathname has rendered. Elements that share a
// `view-transition-name` on both pages (project cover + title) morph between
// them. Browsers without the API, modified clicks and reduced-motion users
// get a normal navigation.

let finishPending: (() => void) | null = null;

export function ViewTransitionsListener() {
  const pathname = usePathname();
  useEffect(() => {
    if (finishPending) {
      // Let the new page paint before the transition snapshots it.
      const done = finishPending;
      finishPending = null;
      requestAnimationFrame(() => done());
    }
  }, [pathname]);
  return null;
}

type Props = ComponentProps<typeof Link>;

export default function TransitionLink({ href, onClick, ...props }: Props) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const url = typeof href === 'string' ? href : href.pathname ?? '';
    const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => unknown };
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      !doc.startViewTransition ||
      !url.startsWith('/') ||
      url === window.location.pathname ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    e.preventDefault();
    doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          finishPending = resolve;
          router.push(url);
          setTimeout(() => {
            if (finishPending === resolve) {
              finishPending = null;
              resolve();
            }
          }, 1500);
        })
    );
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
