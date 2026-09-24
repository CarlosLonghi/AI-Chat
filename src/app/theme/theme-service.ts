import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'zeus-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private darkQuery = this.document.defaultView?.matchMedia?.(DARK_QUERY);

  private systemDark = signal(this.darkQuery?.matches ?? false);
  private chosen = signal<Theme | null>(this.readStored());

  /** Effective theme: the user's choice, otherwise the system preference. */
  theme = computed<Theme>(() => this.chosen() ?? (this.systemDark() ? 'dark' : 'light'));

  constructor() {
    this.darkQuery?.addEventListener('change', (event) => this.systemDark.set(event.matches));

    effect(() => {
      const chosen = this.chosen();
      if (chosen) {
        this.document.documentElement.dataset['theme'] = chosen;
      } else {
        delete this.document.documentElement.dataset['theme'];
      }
    });
  }

  toggle() {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.chosen.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice still applies for this session.
    }
  }

  private readStored(): Theme | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }
}
