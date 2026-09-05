'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  bucket: string;
  folder?: string;
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function ImageUploader({
  bucket,
  folder = '',
  value,
  onChange,
  onRemove,
  accept = ALLOWED_TYPES.join(','),
  maxSizeMB = MAX_SIZE_MB,
  disabled,
  className = '',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Allowed formats: ${ALLOWED_TYPES.map((t) => t.split('/')[1].toUpperCase()).join(', ')}`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Maximum file size: ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bucket, folder, filename: file.name, contentType: file.type }),
      });

      if (!res.ok) throw new Error('Failed to get upload URL');

      const { signedUrl, publicUrl } = await res.json();

      // Upload file to signed URL
      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      onChange(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (value) {
    return (
      <div className={['relative group', className].join(' ')}>
        <div className="relative rounded overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Preview" className="w-full h-40 object-cover" />
          <div className="absolute inset-0 bg-text-primary/0 group-hover:bg-text-primary/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-2 bg-surface/90 rounded text-error hover:bg-error hover:text-white transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={['flex flex-col gap-2', className].join(' ')}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={[
          'relative flex flex-col items-center justify-center gap-2 w-full h-40',
          'rounded border-2 border-dashed cursor-pointer transition-colors',
          'text-text-muted hover:text-text-secondary hover:border-accent',
          disabled && 'opacity-50 cursor-not-allowed',
          error ? 'border-error' : 'border-border',
        ].filter(Boolean).join(' ')}
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-body">Uploading…</span>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8" />
            <span className="text-sm font-body">Drop an image or click to upload</span>
            <span className="text-xs text-text-faint">JPEG, PNG, WebP · Max {maxSizeMB}MB</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
