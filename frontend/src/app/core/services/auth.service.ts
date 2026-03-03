/**
 * 认证服务
 */

import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getApiBase } from '../constants/api.constants';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private get apiUrl() {
        // 动态获取 API 地址，支持运行时配置
        const base = getApiBase();
        return `${base}/api/auth`;
    }
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
            const apiUrl = this.apiUrl;
            
            // 调试日志
            console.log('[登录] 请求信息:', {
                apiUrl,
                isCapacitor: !!(window as any).Capacitor,
                userAgent: navigator.userAgent,
                protocol: window.location.protocol
            });
            
            const res = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            // 检查响应状态
            if (!res.ok) {
                return { 
                    success: false, 
                    error: `服务器错误: ${res.status} ${res.statusText}` 
                };
            }

            const data = await res.json();

            if (data.success && data.token) {
                localStorage.setItem(TOKEN_KEY, data.token);
                this.isAuthenticated.set(true);
                return { success: true };
            }

            return { success: false, error: data.error || '登录失败' };
        } catch (e: any) {
            // 提供更详细的错误信息
            const apiUrl = this.apiUrl;
            const errorMsg = e?.message || '网络错误';
            console.error('登录请求失败:', { apiUrl, error: e });
            
            // 检查是否是 localhost（移动端不应该使用 localhost）
            let errorHint = '';
            if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
                errorHint = '⚠️ 移动端不能使用 localhost，请配置实际的服务器地址（如 http://192.168.1.100:3099）';
            }
            
            return { 
                success: false, 
                error: `网络错误: ${errorMsg}。${errorHint} 当前地址: ${apiUrl}` 
            };
        }
    }

    async logout(): Promise<void> {
        const token = this.getToken();
        if (token) {
            try {
                const apiUrl = this.apiUrl;
                await fetch(`${apiUrl}/logout`, {
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
            const apiUrl = this.apiUrl;
            const res = await fetch(`${apiUrl}/check`, {
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
