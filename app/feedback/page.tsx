'use client';

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { pageMetadata } from '@/lib/metadata';

export const generateMetadata = () => pageMetadata({ title: 'Feedback', path: '/feedback' });

export default function FeedbackPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '', email: '', role: '', company: '', project: '',
    rating: 5, content: '', permission_display: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        toast('Feedback submitted — thank you!', 'success');
      } else {
        toast('Something went wrong. Please try again.', 'error');
      }
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-2">Leave Feedback</p>
          <h1 className="text-4xl font-display font-semibold text-text-primary mb-2">Share your experience</h1>
          <p className="text-text-secondary font-body text-sm">
            Worked with me? I&apos;d love to hear what you thought.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-12 bg-surface border border-border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-success" />
            </div>
            <h2 className="text-xl font-display font-semibold text-text-primary mb-2">Thank you!</h2>
            <p className="text-text-muted font-body text-sm">Your feedback means a lot to me.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Your name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-3 py-2.5 font-body text-sm bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent" />
              <input type="email" placeholder="Email (optional)" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-3 py-2.5 font-body text-sm bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Your role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full px-3 py-2.5 font-body text-sm bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent" />
              <input placeholder="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                className="w-full px-3 py-2.5 font-body text-sm bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-2">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setForm({...form, rating: n})}
                    className="p-1 text-xl transition-colors">
                    <Star className={`w-6 h-6 ${n <= form.rating ? 'fill-accent-warm text-accent-warm' : 'text-text-faint'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-1.5">Project (optional)</label>
              <input placeholder="Which project or context?" value={form.project} onChange={e => setForm({...form, project: e.target.value})}
                className="w-full px-3 py-2.5 font-body text-sm bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-1.5">Your feedback *</label>
              <textarea required rows={4} placeholder="What was it like working with me?" value={form.content}
                onChange={e => setForm({...form, content: e.target.value})}
                className="w-full px-3 py-2.5 font-body text-sm bg-bg border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
            </div>
            <label className="flex items-start gap-2 text-sm text-text-muted font-body cursor-pointer">
              <input type="checkbox" checked={form.permission_display} onChange={e => setForm({...form, permission_display: e.target.checked})}
                className="mt-0.5 w-4 h-4 rounded border-border accent-accent" />
              I give permission to display my feedback on this website (with my name and role)
            </label>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-accent text-white font-body font-medium rounded hover:bg-accent-warm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
