'use client';

import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-text-muted mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded border border-border px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
