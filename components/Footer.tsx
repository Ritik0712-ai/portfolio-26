import Link from 'next/link';
import { Github, Linkedin, Mail, ExternalLink, Code2 } from 'lucide-react';
import { T } from '@/lib/i18n';

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
              <T en="Building dependable products from idea to production. Based in India." hi="आइडिया से प्रोडक्शन तक भरोसेमंद प्रोडक्ट्स बनाता हूँ। भारत से।" />
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-body text-text-faint uppercase tracking-widest mb-4"><T en="Navigation" hi="नेविगेशन" /></p>
            <div className="flex flex-col gap-2">
              {[
                { href: '/', label: 'Home', hi: 'होम' },
                { href: '/#projects', label: 'Projects', hi: 'प्रोजेक्ट्स' },
                { href: '/blog', label: 'Blog', hi: 'ब्लॉग' },
                { href: '/dsa', label: 'DSA journal', hi: 'DSA जर्नल' },
                { href: '/resume', label: 'Resume', hi: 'रिज़्यूमे' },
                { href: '/now', label: 'Now', hi: 'अभी' },
                { href: '/uses', label: 'Uses', hi: 'मेरे टूल्स' },
                { href: '/changelog', label: "What's new", hi: 'नया क्या है' },
                { href: '/contact', label: 'Contact', hi: 'संपर्क' },
                { href: '/feedback', label: 'Leave a testimonial', hi: 'टेस्टिमोनियल दें' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-text-muted hover:text-text-primary font-body transition-colors">
                  <T en={link.label} hi={link.hi} />
                </Link>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs font-body text-text-faint uppercase tracking-widest mb-4"><T en="Connect" hi="जुड़ें" /></p>
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
              <a href="https://leetcode.com/u/Ritik812800/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary font-body transition-colors">
                <Code2 className="w-4 h-4" />
                LeetCode
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-faint font-body">
            © {year} Ritik Agarwal. <T en="All rights reserved." hi="सर्वाधिकार सुरक्षित।" />
          </p>
          <p className="text-xs text-text-faint font-body">
            <T en="Built with Next.js & Supabase" hi="Next.js और Supabase से बना" />
          </p>
        </div>
      </div>
    </footer>
  );
}
