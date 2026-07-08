import { Injectable, signal } from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';
import { en } from '../i18n/en';
import { km } from '../i18n/km';

export type Lang = 'en' | 'km';

const TRANSLATIONS: Record<Lang, Record<string, string>> = { en, km };

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'fitlife_lang';
  currentLang = signal<Lang>('en');

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Lang | null;
    const lang = saved && (saved === 'en' || saved === 'km') ? saved : 'en';
    this.currentLang.set(lang);
  }

  setLanguage(lang: Lang): void {
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  t(key: string): string {
    const dict = TRANSLATIONS[this.currentLang()];
    return dict[key] ?? key;
  }
}
