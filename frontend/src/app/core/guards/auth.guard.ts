/**
 * 认证路由守卫
 */

import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuth = await authService.checkAuth();

    if (!isAuth) {
        router.navigate(['/login']);
        return false;
    }

    return true;
};
