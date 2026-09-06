'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
}

export default function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? url || window.location.href : url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Copy Link',
      action: () => handleCopyLink(),
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-faint font-body uppercase tracking-wider">
        Share
      </span>
      <div className="flex items-center gap-1">
        {shareLinks.map((link) => (
          link.href ? (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-muted hover:text-text-primary transition-colors rounded border border-border hover:border-rule"
              aria-label={`Share on ${link.name}`}
              title={link.name}
            >
              {link.name === 'Copy Link' && copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </a>
          ) : (
            <button
              key={link.name}
              onClick={link.action}
              className="p-2 text-text-muted hover:text-text-primary transition-colors rounded border border-border hover:border-rule"
              aria-label={link.name}
              title={link.name}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          )
        ))}
      </div>
    </div>
  );
}
