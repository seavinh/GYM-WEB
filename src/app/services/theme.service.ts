import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'fitlife_theme';
  isDark = signal(true);

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const dark = saved ? saved === 'dark' : true;
    this.isDark.set(dark);
    this.apply(dark);
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.apply(next);
    localStorage.setItem(this.STORAGE_KEY, next ? 'dark' : 'light');
  }

  setDark(dark: boolean): void {
    this.isDark.set(dark);
    this.apply(dark);
    localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
  }

  private apply(dark: boolean): void {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
