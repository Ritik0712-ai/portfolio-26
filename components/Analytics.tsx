import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from '@vercel/analytics';

// Inject Vercel Speed Insights
if (typeof window !== 'undefined') {
  injectSpeedInsights();
}

// Inject Vercel Analytics
if (typeof window !== 'undefined') {
  inject();
}

export default function Analytics() {
  return null;
}
