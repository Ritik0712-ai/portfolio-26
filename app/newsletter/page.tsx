import Link from 'next/link';

const messages: Record<string, { title: string; body: string }> = {
  confirmed: {
    title: "You're subscribed",
    body: "I'll email you when I publish something new. Every email has an unsubscribe link.",
  },
  unsubscribed: {
    title: 'Unsubscribed',
    body: "You're off the list and your address has been deleted. No hard feelings.",
  },
  invalid: {
    title: 'That link has expired',
    body: 'It may have already been used. Try subscribing again from the homepage.',
  },
  error: {
    title: 'Something went wrong',
    body: 'Please try again in a moment.',
  },
};

export default async function NewsletterStatePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const m = messages[state ?? ''] ?? messages.invalid;

  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-display font-semibold text-text-primary mb-3">
          {m.title}
        </h1>
        <p className="text-text-secondary font-body text-sm mb-8">{m.body}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white font-body font-medium text-sm rounded hover:bg-accent-warm transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
