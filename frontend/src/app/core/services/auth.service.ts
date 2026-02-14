/**
 * 认证服务
 */

import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = '/api/auth';
    isAuthenticated = signal(this.hasToken());

    constructor(private router: Router) {}

    private hasToken(): boolean {
        return !!localStorage.getItem(TOKEN_KEY);
    }

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    }

    async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            const res = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem(TOKEN_KEY, data.token);
                this.isAuthenticated.set(true);
                return { success: true };
            }

            return { success: false, error: data.error || '登录失败' };
        } catch (e) {
            return { success: false, error: '网络错误' };
        }
    }

    async logout(): Promise<void> {
        const token = this.getToken();
        if (token) {
            try {
                await fetch(`${this.apiUrl}/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {
                // 忽略错误
            }
        }
        localStorage.removeItem(TOKEN_KEY);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
    }

    async checkAuth(): Promise<boolean> {
        const token = this.getToken();
        if (!token) {
            this.isAuthenticated.set(false);
            return false;
        }

        try {
            const res = await fetch(`${this.apiUrl}/check`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            const authenticated = data.authenticated === true;
            this.isAuthenticated.set(authenticated);
            return authenticated;
        } catch (e) {
            this.isAuthenticated.set(false);
            return false;
        }
    }
}
