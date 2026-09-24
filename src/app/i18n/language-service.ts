import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

export type Language = 'pt' | 'en' | 'es';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

const STORAGE_KEY = 'zeus-lang';
const DEFAULT_LANGUAGE: Language = 'en';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private transloco = inject(TranslocoService);
  private document = inject(DOCUMENT);

  languages = LANGUAGES;
  current = toSignal(this.transloco.langChanges$, { initialValue: this.transloco.getActiveLang() });

  /** Loads the saved (or browser) language before the first render, so no keys flash on screen. */
  async init() {
    await this.apply(this.readStored() ?? this.browserLanguage());
  }

  async use(lang: Language) {
    await this.apply(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be blocked; the choice still applies for this session.
    }
  }

  private async apply(lang: Language) {
    await firstValueFrom(this.transloco.load(lang));
    this.transloco.setActiveLang(lang);
    this.document.documentElement.lang = lang;
  }

  private readStored(): Language | null {
    try {
      return this.toLanguage(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  private browserLanguage(): Language {
    const browser = this.document.defaultView?.navigator?.language?.slice(0, 2);
    return this.toLanguage(browser ?? null) ?? DEFAULT_LANGUAGE;
  }

  private toLanguage(value: string | null): Language | null {
    return LANGUAGES.find(l => l.code === value)?.code ?? null;
  }
}
