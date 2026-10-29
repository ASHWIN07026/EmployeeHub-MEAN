import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private next = 1;

  success(text: string) {
    this.push('success', text);
  }
  error(text: string) {
    this.push('error', text);
  }
  dismiss(id: number) {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
  private push(type: Toast['type'], text: string) {
    const id = this.next++;
    this.toasts.update((t) => [...t, { id, type, text }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
