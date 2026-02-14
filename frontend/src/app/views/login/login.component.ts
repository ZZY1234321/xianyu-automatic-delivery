import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ICONS } from '../../shared/icons';
import { AuthService } from '../../core/services';

@Component({
    selector: 'app-login',
    imports: [FormsModule, LucideAngularModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    readonly icons = ICONS;

    username = signal('');
    password = signal('');
    loading = signal(false);
    error = signal('');

    async onSubmit() {
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
        }
    }
}
