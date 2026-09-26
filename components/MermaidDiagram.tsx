'use client';

import { useEffect, useId, useRef, useState } from 'react';

// Renders Mermaid source into SVG on the client. mermaid is ~500 KB, so it is
// loaded from jsDelivr at runtime (not bundled) and only on case-study pages
// that actually have a diagram. Colors are read from the site's CSS tokens, and the
// diagram re-renders when the theme class on <html> changes.
const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
}

export default function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const baseId = useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    let cancelled = false;
    let renderCount = 0;

    const render = async () => {
      try {
        const mermaid = (await import(/* webpackIgnore: true */ MERMAID_URL)).default as MermaidApi;
        const css = getComputedStyle(document.documentElement);
        const token = (name: string) => css.getPropertyValue(name).trim();

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          // A concrete font stack (not a CSS var) so mermaid measures labels
          // with the same font it renders — otherwise words run together.
          fontFamily: getComputedStyle(document.body).fontFamily,
          flowchart: { curve: 'basis', padding: 12, htmlLabels: false },
          htmlLabels: false,
          themeVariables: {
            background: token('--color-bg'),
            primaryColor: token('--color-surface'),
            primaryBorderColor: token('--color-border'),
            primaryTextColor: token('--color-text-primary'),
            secondaryColor: token('--color-bg-secondary'),
            tertiaryColor: token('--color-bg-tertiary'),
            lineColor: token('--color-text-muted'),
            textColor: token('--color-text-secondary'),
            clusterBkg: token('--color-bg-secondary'),
            clusterBorder: token('--color-border'),
            edgeLabelBackground: token('--color-bg'),
            fontSize: '14px',
          },
        });

        renderCount += 1;
        const { svg } = await mermaid.render(`mmd-${baseId}-${renderCount}`, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setFailed(false);
        }
      } catch (err) {
        console.error('Mermaid render failed', err);
        if (!cancelled) setFailed(true);
      }
    };

    render();
    const observer = new MutationObserver(() => render());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [chart, baseId]);

  if (failed) {
    return (
      <pre className="text-xs font-mono text-text-muted bg-bg-secondary border border-border rounded p-4 overflow-x-auto">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Architecture diagram"
      className="min-h-[120px] overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
    />
  );
}
