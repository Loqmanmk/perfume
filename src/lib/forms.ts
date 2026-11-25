import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError, errorMessage } from '@/lib/api/http';

/**
 * Shows a failed request inside a react-hook-form form: messages for known
 * fields go next to those fields, everything else becomes the form-level alert.
 */
export function applyServerErrors<Values extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<Values>,
  /** Prefix the server uses for this form's fields, e.g. `shipping.` */
  fieldPrefix = '',
) {
  let placedOnField = false;

  if (error instanceof ApiError) {
    for (const [path, message] of Object.entries(error.fields)) {
      if (!path.startsWith(fieldPrefix)) continue;
      setError(path.slice(fieldPrefix.length) as Path<Values>, { message });
      placedOnField = true;
    }
  }

  if (!placedOnField) setError('root', { message: errorMessage(error) });
}

/** Accepts only same-site paths, so `?redirect=` cannot send people to another website. */
export function safeRedirect(target: string | null, fallback: string): string {
  return target && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')
    ? target
    : fallback;
}
