import Link from 'next/link';
import { Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <p className="font-display font-semibold text-xl text-text-primary mb-2">Ritik Agarwal</p>
            <p className="text-sm text-text-muted font-body leading-relaxed">
              Building dependable products from idea to production. Based in India.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-body text-text-faint uppercase tracking-widest mb-4">Navigation</p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/#projects', label: 'Projects' },
                { href: '/blog', label: 'Blog' },
                { href: '/resume', label: 'Resume' },
                { href: '/now', label: 'Now' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-text-muted hover:text-text-primary font-body transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs font-body text-text-faint uppercase tracking-widest mb-4">Connect</p>
            <div className="flex flex-col gap-2">
              <a href="mailto:ritikagarwal2468@gmail.com" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
                <Mail className="w-4 h-4" />
                ritikagarwal2468@gmail.com
              </a>
              <a href="https://github.com/Ritik0712-ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
                <Github className="w-4 h-4" />
                GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://www.linkedin.com/in/ritik-agarwal-58ba012b4/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
                <Linkedin className="w-4 h-4" />
                LinkedIn
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-faint font-body">
            © {year} Ritik Agarwal. All rights reserved.
          </p>
          <p className="text-xs text-text-faint font-body">
            Built with Next.js &amp; Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
