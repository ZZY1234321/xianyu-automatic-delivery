import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    readonly themeMode = signal<ThemeMode>(this.loadTheme());
    readonly isDark = signal(false);

    constructor() {
        this.applyTheme();
        this.watchSystemTheme();
    }

    private loadTheme(): ThemeMode {
        return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'system';
    }

    setTheme(mode: ThemeMode) {
        this.themeMode.set(mode);
        localStorage.setItem(STORAGE_KEY, mode);
        this.applyTheme();
    }

    private applyTheme() {
        const mode = this.themeMode();
        let isDark = false;

        if (mode === 'system') {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            isDark = mode === 'dark';
        }

        this.isDark.set(isDark);
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    private watchSystemTheme() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.themeMode() === 'system') {
                this.applyTheme();
            }
        });
    }
}
