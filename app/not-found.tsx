import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-display font-semibold text-text-faint mb-4">404</p>
      <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">Page not found</h1>
      <p className="text-text-muted font-body text-sm mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-body font-medium text-sm rounded hover:bg-accent-warm transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
