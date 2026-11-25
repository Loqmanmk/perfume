import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Shared look for text inputs, selects and textareas. */
export function inputClass(hasError: boolean, extra?: string) {
  return cn(
    'w-full rounded-xl border bg-ink-900 px-4 text-base text-cream transition-colors placeholder:text-muted focus:border-gold focus:outline-none',
    hasError ? 'border-danger' : 'border-cream/15',
    extra,
  );
}

export interface FieldControlProps {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  /** Receives the attributes that link the control to its label, hint and error. */
  children: (control: FieldControlProps) => ReactNode;
}

/** Label + control + hint + error, wired together for screen readers. */
export function Field({ id, label, error, hint, className, children }: FieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-2">
        {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}
