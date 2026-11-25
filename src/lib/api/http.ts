/** An error the API sent back, with a message that is safe to show the user. */
export class ApiError extends Error {
  readonly status: number;
  /** Per-field messages for forms, keyed by field path (e.g. `sizes.0.price`). */
  readonly fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Sent as JSON. */
  json?: unknown;
  /** Sent as-is (e.g. `FormData` for uploads). */
  body?: BodyInit;
  signal?: AbortSignal;
}

const NETWORK_ERROR = 'We could not reach the server. Check your connection and try again.';

/** The one place the app talks HTTP. Every call is same-origin and carries the session cookie. */
export async function apiRequest<T>(path: string, { method = 'GET', json, body, signal }: RequestOptions = {}) {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: json === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: json === undefined ? body : JSON.stringify(json),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(NETWORK_ERROR, 0);
  }

  if (response.status === 204) return undefined as T;

  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string; fields?: Record<string, string> })
    | null;

  if (!response.ok) {
    throw new ApiError(data?.error ?? 'Something went wrong. Please try again.', response.status, data?.fields);
  }
  return data as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
