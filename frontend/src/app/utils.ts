import { HttpErrorResponse } from '@angular/common/http';

/** Turns any HTTP failure into a readable message for the UI. */
export function errorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Is the backend running?';
    return err.error?.message || `Request failed (${err.status})`;
  }
  return 'Something went wrong';
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
