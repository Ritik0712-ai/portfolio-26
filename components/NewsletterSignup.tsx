'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact';
}

export default function NewsletterSignup({ variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage('Thanks for subscribing! Check your inbox to confirm.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 px-4 py-2.5 font-body text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white font-body text-sm rounded hover:bg-accent-warm transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            Subscribe
          </button>
        </form>
        {message && (
          <p className={`mt-2 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-surface border border-border rounded-lg p-8 md:p-12"
    >
      <div className="max-w-xl mx-auto text-center">
        <Mail className="w-10 h-10 text-accent-warm mx-auto mb-4" />
        <h3 className="font-display text-2xl font-semibold text-text-primary mb-3">
          Stay in the loop
        </h3>
        <p className="text-text-secondary mb-6">
          Get occasional emails about new projects, blog posts, and tech thoughts.
          No spam — unsubscribe anytime.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="flex-1 px-4 py-3 font-body text-sm bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-body text-sm rounded hover:bg-accent-warm transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing…' : (
              <>
                Subscribe <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
