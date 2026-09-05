'use client';

import React, { useState, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, Link, Image, List, ListOrdered, Quote, Code, Eye, Edit3 } from 'lucide-react';
import { Button } from './Button';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  error?: string;
  label?: string;
  hint?: string;
  onImageUpload?: () => Promise<string | null>;
}

type Mode = 'edit' | 'preview' | 'split';

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content in Markdown…',
  minHeight = '400px',
  error,
  label,
  hint,
  onImageUpload,
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<Mode>('edit');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAt = useCallback((before: string, after = '', placeholder = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  }, [value, onChange]);

  const toolbar = [
    { icon: Bold, label: 'Bold', action: () => insertAt('**', '**', 'bold text') },
    { icon: Italic, label: 'Italic', action: () => insertAt('*', '*', 'italic text') },
    { icon: Link, label: 'Link', action: () => insertAt('[', '](url)', 'link text') },
    {
      icon: Image, label: 'Image', action: async () => {
        if (onImageUpload) {
          const url = await onImageUpload();
          if (url) insertAt(`![alt](${url})`, '');
        }
      },
    },
    { icon: List, label: 'Bullet list', action: () => insertAt('\n- ', '', 'item') },
    { icon: ListOrdered, label: 'Numbered list', action: () => insertAt('\n1. ', '', 'item') },
    { icon: Quote, label: 'Blockquote', action: () => insertAt('\n> ', '', 'quote') },
    { icon: Code, label: 'Code block', action: () => insertAt('\n```\n', '\n```\n', 'code') },
  ];

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-body font-medium text-text-secondary">
          {label}
          {false && <span className="text-error ml-0.5">*</span>}
        </label>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap">
        {toolbar.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.label}
            onClick={tool.action}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-secondary rounded transition-colors"
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="ml-auto flex rounded overflow-hidden border border-border">
          {([['edit', Edit3], ['split', Eye], ['preview', Eye]] as const).map(([m, Icon]) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={[
                'px-3 py-1.5 text-xs font-body flex items-center gap-1.5 transition-colors',
                mode === m ? 'bg-accent text-white' : 'bg-surface text-text-muted hover:text-text-primary',
              ].join(' ')}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className={['flex rounded border overflow-hidden', error ? 'border-error' : 'border-border'].join(' ')}>
        {mode === 'edit' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={[
              'flex-1 w-full px-4 py-3 font-mono text-sm bg-surface text-text-primary',
              'placeholder:text-text-faint resize-y',
              'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset',
            ].join(' ')}
            style={{ minHeight }}
          />
        )}

        {mode === 'preview' && (
          <div
            className="flex-1 w-full px-6 py-4 bg-surface overflow-auto prose-editorial"
            style={{ minHeight }}
          >
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p className="text-text-faint italic">Nothing to preview yet.</p>
            )}
          </div>
        )}

        {mode === 'split' && (
          <>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 w-1/2 px-4 py-3 font-mono text-sm bg-surface text-text-primary placeholder:text-text-faint resize-y focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset border-r border-border"
              style={{ minHeight }}
            />
            <div className="flex-1 w-1/2 px-6 py-4 bg-surface overflow-auto prose-editorial" style={{ minHeight }}>
              {value ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              ) : (
                <p className="text-text-faint italic">Start writing to see preview…</p>
              )}
            </div>
          </>
        )}
      </div>

      {hint && !error && <p className="text-xs text-text-faint">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
