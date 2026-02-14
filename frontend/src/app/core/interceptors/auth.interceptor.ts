/**
 * 认证拦截器
 * 自动为API请求添加Authorization头
 */

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

const TOKEN_KEY = 'auth_token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // 跳过登录相关的请求
    if (req.url.includes('/api/auth/')) {
        return next(req);
    }

    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // 未认证，清除token并跳转到登录页
                localStorage.removeItem(TOKEN_KEY);
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};
