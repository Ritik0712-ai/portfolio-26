import { ToastProvider } from '@/components/ui/Toast';

// Wraps every /admin route, including /admin/login, so it must NOT
// contain an auth guard: redirecting an unauthenticated visitor to
// /admin/login from here sends the login page to itself forever.
// The guard lives in (protected)/layout.tsx, which covers every admin
// route except login.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
