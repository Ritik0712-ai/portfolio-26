import { isValidElement, type ReactNode } from 'react';

/** Plain text of rendered markdown children (handles **bold**, `code`, links…). */
export function nodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return '';
}

/** Markdown heading source → the same plain text the renderer sees. */
export function markdownHeadingText(src: string): string {
  return src
    .replace(/\s+#+\s*$/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim();
}

/**
 * Anchor id for a heading. Used by both the post renderer and the table of
 * contents so they always agree. Keeps letters/numbers in any script, so
 * Hindi headings get real ids too.
 */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-');
}
