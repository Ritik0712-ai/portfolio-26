'use client';

import { useState } from 'react';
import { MessageSquare, User } from 'lucide-react';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';

interface Comment {
  id: string;
  blog_slug: string;
  author: string;
  content: string;
  created_at: string;
}

export default function BlogComments({ blogSlug }: { blogSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: blogSlug, name, message: content }),
    });

    if (res.ok) {
      setDone(true);
      setName('');
      setContent('');
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-16 pt-12 border-t border-border">
      <h2 className="text-xl font-display font-semibold text-text-primary mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments
      </h2>

      {comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="bg-surface border border-border rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <User className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-medium text-text-primary">{c.author}</span>
                <span className="text-xs text-text-faint ml-auto">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-text-secondary font-body">{c.content}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts…"
          rows={4}
          required
        />
        {done ? (
          <p className="text-sm text-success font-body">Comment submitted for review. Thank you!</p>
        ) : (
          <Button type="submit" loading={submitting}>Post Comment</Button>
        )}
      </form>
    </section>
  );
}
