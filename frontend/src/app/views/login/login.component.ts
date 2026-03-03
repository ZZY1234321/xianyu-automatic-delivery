import { Component, signal, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ICONS } from '../../shared/icons';
import { AuthService } from '../../core/services';
import { getApiBase, setMobileApiBase } from '../../core/constants/api.constants';

@Component({
    selector: 'app-login',
    imports: [FormsModule, LucideAngularModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    readonly icons = ICONS;

    username = signal('');
    password = signal('');
    loading = signal(false);
    error = signal('');
    showApiConfig = signal(false);
    apiBase = signal('');
    isMobile = signal(false);
    
    async ngOnInit() {
        // 检查是否已经登录，如果已登录则直接跳转到 dashboard
        const isAuth = await this.authService.checkAuth();
        if (isAuth) {
            this.router.navigate(['/dashboard']);
            return;
        }
        
        // 检测是否在移动端（更可靠的检测）
        const isMobileEnv = typeof window !== 'undefined' && (
            !!(window as any).Capacitor ||
            (window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') ||
            (!window.location.hostname || window.location.hostname === 'localhost') && 
            (/android/i.test(navigator.userAgent) || /iPad|iPhone|iPod/.test(navigator.userAgent))
        );
        this.isMobile.set(isMobileEnv);
        
        // 如果是移动端，读取配置
        if (isMobileEnv) {
            const saved = localStorage.getItem('api_base_url') || '';
            this.apiBase.set(saved);
            
            // 如果没有配置或配置是 localhost，自动展开配置面板
            const currentBase = getApiBase();
            if (!saved || currentBase.includes('localhost') || currentBase.includes('127.0.0.1')) {
                this.showApiConfig.set(true);
                this.error.set('⚠️ 请先配置服务器地址！移动端不能使用 localhost');
            }
        }
    }
    
    toggleApiConfig() {
        this.showApiConfig.set(!this.showApiConfig());
    }
    
    saveApiConfig() {
        const url = this.apiBase().trim();
        if (!url) {
            this.error.set('请输入服务器地址');
            return;
        }
        
        try {
            new URL(url);
            setMobileApiBase(url);
        } catch {
            this.error.set('服务器地址格式不正确，请使用 http:// 或 https:// 开头');
        }
    }
    
    getCurrentApiBase(): string {
        return getApiBase() || '未配置';
    }

    async onSubmit() {
        // 如果是移动端，检查是否已配置服务器地址
        if (this.isMobile()) {
            const currentBase = getApiBase();
            if (!currentBase || currentBase.includes('localhost') || currentBase.includes('127.0.0.1')) {
                this.error.set('⚠️ 请先配置服务器地址！移动端不能使用 localhost');
                this.showApiConfig.set(true);
                return;
            }
        }
        
        const username = this.username().trim();
        const password = this.password();

        if (!username || !password) {
            this.error.set('请输入账号和密码');
            return;
        }

        this.loading.set(true);
        this.error.set('');

        const result = await this.authService.login(username, password);

        this.loading.set(false);

        if (result.success) {
            this.router.navigate(['/dashboard']);
        } else {
            this.error.set(result.error || '登录失败');
            // 如果是网络错误且是移动端，自动展开配置面板
            if (result.error?.includes('网络错误') && this.isMobile()) {
                this.showApiConfig.set(true);
            }
        }
    }
}
