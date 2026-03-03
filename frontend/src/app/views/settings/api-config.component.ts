import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';
import { DialogService } from '../../shared/dialog';
import { setMobileApiBase, getApiBase } from '../../core/constants/api.constants';

@Component({
    selector: 'app-api-config',
    imports: [LucideAngularModule, FormsModule],
    template: `
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <div class="flex items-center gap-2">
                    <lucide-icon [img]="icons.Settings" class="w-5 h-5"></lucide-icon>
                    <h3 class="card-title text-lg">服务器配置</h3>
                </div>
                <p class="text-sm text-base-content/60 mt-1">配置后端服务器地址（仅移动端需要）</p>

                <div class="form-control mt-4">
                    <label class="label">
                        <span class="label-text">服务器地址</span>
                    </label>
                    <input type="text" class="input input-bordered w-full" 
                        placeholder="http://192.168.1.100:3099 或 https://your-domain.com"
                        [ngModel]="apiBase()"
                        (ngModelChange)="apiBase.set($event)">
                    <label class="label">
                        <span class="label-text-alt text-base-content/50">
                            当前: {{ getCurrentApiBase() }}
                        </span>
                    </label>
                </div>

                <div class="flex gap-2 mt-4">
                    <button class="btn btn-primary btn-sm" (click)="saveConfig()">
                        <lucide-icon [img]="icons.Save" class="w-4 h-4"></lucide-icon>
                        保存配置
                    </button>
                    <button class="btn btn-ghost btn-sm" (click)="testConnection()">
                        <lucide-icon [img]="icons.Zap" class="w-4 h-4"></lucide-icon>
                        测试连接
                    </button>
                </div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiConfigComponent {
    private readonly dialog = inject(DialogService);
    readonly icons = ICONS;

    apiBase = signal(localStorage.getItem('api_base_url') || '');

    getCurrentApiBase(): string {
        return getApiBase() || '使用默认配置';
    }

    async saveConfig() {
        const url = this.apiBase().trim();
        if (!url) {
            await this.dialog.alert('错误', '请输入服务器地址');
            return;
        }

        // 验证 URL 格式
        try {
            new URL(url);
        } catch {
            await this.dialog.alert('错误', '服务器地址格式不正确，请使用 http:// 或 https:// 开头');
            return;
        }

        setMobileApiBase(url);
        await this.dialog.alert('成功', '配置已保存，应用将重新加载');
    }

    async testConnection() {
        const url = this.apiBase().trim() || getApiBase();
        if (!url) {
            await this.dialog.alert('提示', '请先输入服务器地址');
            return;
        }

        try {
            const res = await fetch(`${url}/api/status`);
            if (res.ok) {
                await this.dialog.alert('连接成功', '服务器连接正常');
            } else {
                await this.dialog.alert('连接失败', `服务器返回错误: ${res.status}`);
            }
        } catch (e: any) {
            await this.dialog.alert('连接失败', `无法连接到服务器: ${e.message}`);
        }
    }
}
