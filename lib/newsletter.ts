import { Resend } from 'resend';
import { siteUrl } from '@/lib/metadata';

// onboarding@resend.dev only delivers to the Resend account owner's own
// address. Verify a domain in Resend and set NEWSLETTER_FROM to something like
// 'Ritik Agarwal <hello@ritikagarwal.me>' before this reaches real subscribers.
const FROM = process.env.NEWSLETTER_FROM || 'Ritik Agarwal <onboarding@resend.dev>';

function client() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function shell(bodyHtml: string, unsubscribeUrl?: string) {
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;line-height:1.6">
${bodyHtml}
<hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0" />
<p style="font-size:12px;color:#777">
  You're receiving this because you subscribed at <a href="${siteUrl}" style="color:#777">${siteUrl.replace(/^https?:\/\//, '')}</a>.
  ${unsubscribeUrl ? `<br /><a href="${unsubscribeUrl}" style="color:#777">Unsubscribe</a>` : ''}
</p>
</div>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

export async function sendConfirmationEmail(email: string, confirmToken: string) {
  const resend = client();
  if (!resend) return { ok: false, reason: 'RESEND_API_KEY not set' };

  const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${confirmToken}`;
  const { error } = await resend.emails.send({
    from: FROM,
    to: [email],
    subject: 'Confirm your subscription',
    html: shell(`
      <h2 style="margin:0 0 12px">One more step</h2>
      <p>Tap the button below to confirm you'd like an email when I publish something new. If you didn't request this, just ignore it — nothing will be sent.</p>
      <p style="margin:24px 0">
        <a href="${confirmUrl}" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Confirm subscription</a>
      </p>
      <p style="font-size:13px;color:#666">Or paste this into your browser:<br />${confirmUrl}</p>
    `),
  });
  return error ? { ok: false, reason: error.message } : { ok: true };
}

type Post = { title: string; slug: string; excerpt?: string | null };
type Recipient = { email: string; unsubscribe_token: string };

/**
 * Sends one email per recipient so each carries its own unsubscribe link.
 * Resend's free tier allows 100/day, so this is chunked and failures are
 * collected rather than thrown — a single bad address must not abort the run.
 */
export async function sendNewPostEmails(post: Post, recipients: Recipient[]) {
  const resend = client();
  if (!resend) return { sent: 0, failed: 0, reason: 'RESEND_API_KEY not set' };

  const postUrl = `${siteUrl}/blog/${post.slug}`;
  let sent = 0;
  let failed = 0;

  for (const r of recipients) {
    const unsubscribeUrl = `${siteUrl}/api/newsletter/unsubscribe?token=${r.unsubscribe_token}`;
    const { error } = await resend.emails.send({
      from: FROM,
      to: [r.email],
      subject: post.title,
      headers: {
        // One-click unsubscribe, so Gmail shows a native unsubscribe control
        // instead of people reaching for the spam button.
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      html: shell(`
        <h2 style="margin:0 0 12px">${escapeHtml(post.title)}</h2>
        ${post.excerpt ? `<p>${escapeHtml(post.excerpt)}</p>` : ''}
        <p style="margin:24px 0">
          <a href="${postUrl}" style="background:#1a1a1a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Read the post</a>
        </p>
      `, unsubscribeUrl),
    });
    if (error) { failed++; console.error('Newsletter send failed for a recipient:', error.message); }
    else sent++;
  }

  return { sent, failed };
}
