'use client';

import { useEffect, useState } from 'react';
import { Shield, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface SessionUser {
  id: string;
  email: string;
}

interface SessionData {
  user: SessionUser | null;
  isAdmin: boolean;
}

export default function AdminInvitePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Fetch session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data: SessionData = await res.json();

        if (!data.user) {
          setCheckingSession(false);
          return;
        }

        setUser(data.user);
        setIsAdmin(data.isAdmin);
      } catch (err) {
        console.error('Failed to fetch session:', err);
      } finally {
        setCheckingSession(false);
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const handleAddAsAdmin = async () => {
    if (!user?.email) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || 'Failed to add admin', 'error');
        return;
      }

      setIsAdmin(true);
      toast('You have been added as an admin!', 'success');
    } catch {
      toast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Checking session...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 border border-warning/20 mb-6">
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">
            Not Logged In
          </h1>
          <p className="text-text-muted mb-6">
            You need to be logged in first before you can set up admin access.
          </p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/admin/login'}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Already an admin
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 border border-success/20 mb-6">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-text-primary mb-2">
            Already an Admin
          </h1>
          <p className="text-text-muted mb-2">
            You are already registered as an admin user.
          </p>
          <p className="text-sm text-text-faint mb-6">
            Logged in as: {user.email}
          </p>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/admin'}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Not an admin yet - show the invite form
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface border border-border mb-4">
            <Shield className="w-7 h-7 text-text-muted" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">
            Admin Setup
          </h1>
          <p className="text-text-muted mt-2">
            Add yourself as an admin user
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bg flex items-center justify-center">
              <Mail className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Current session</p>
              <p className="text-text-primary font-medium break-all">
                {user.email}
              </p>
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded p-4 mb-6">
            <p className="text-sm text-text-secondary">
              You are logged in but not yet registered as an admin. Click the button below to add yourself to the admin_users table.
            </p>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleAddAsAdmin}
            loading={submitting}
            disabled={submitting}
          >
            <Shield className="w-4 h-4" />
            Add as Admin
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-faint mt-6">
          <a
            href="/admin"
            className="hover:text-text-muted transition-colors"
          >
            Back to Dashboard
          </a>
          <span className="mx-2">·</span>
          <a
            href="/"
            className="hover:text-text-muted transition-colors"
          >
            Back to Portfolio
          </a>
        </p>
      </div>
    </div>
  );
}
