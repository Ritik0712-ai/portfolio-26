'use client';
import { T, useLang } from '@/lib/i18n';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function Contact() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setDone(true);
      setForm({ name: '', email: '', message: '' });
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to send message');
    }
    setLoading(false);
  };

  return (
    <section id="contact" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="max-w-lg">
          <p className="text-xs font-mono text-text-faint uppercase tracking-[0.3em] mb-4"><T en="Contact" hi="संपर्क" /></p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-text-primary mb-4">
            <T en="Let's work together" hi="चलिए साथ काम करें" />
          </h2>
          <p className="text-text-secondary font-body leading-relaxed mb-8">
            <T en="Have a project in mind, an opportunity, or just want to say hello? My inbox is always open." hi="कोई प्रोजेक्ट, कोई मौका, या बस हैलो कहना है? मेरा इनबॉक्स हमेशा खुला है।" />
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-1.5">
                <T en="Name" hi="नाम" /> <span className="text-error">*</span>
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('Your name', 'आपका नाम')}
                className="w-full px-3 py-2.5 font-body text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-1.5">
                <T en="Email" hi="ईमेल" /> <span className="text-error">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 font-body text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-text-secondary mb-1.5">
                <T en="Message" hi="संदेश" /> <span className="text-error">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder={t("What's on your mind?", 'आप क्या कहना चाहते हैं?')}
                className="w-full px-3 py-2.5 font-body text-sm bg-surface border border-border rounded text-text-primary placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
              />
            </div>

            {done && (
              <div className="p-3 bg-success/10 border border-success/20 rounded text-sm text-success font-body">
                <T en="Message sent! I'll get back to you soon." hi="संदेश भेज दिया गया! मैं जल्द जवाब दूँगा।" />
              </div>
            )}
            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded text-sm text-error font-body">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-body font-medium rounded hover:bg-accent-warm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Send className="w-4 h-4" /> <T en="Send Message" hi="संदेश भेजें" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-text-muted font-body">
              <T en="Prefer email directly?" hi="सीधे ईमेल करना चाहते हैं?" />{' '}
              <a href="mailto:ritikagarwal2468@gmail.com" className="text-accent hover:text-accent-warm transition-colors">
                ritikagarwal2468@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
