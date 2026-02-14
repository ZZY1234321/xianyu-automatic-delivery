/**
 * 安全拦截器
 * 为所有请求添加 X-Requested-With 头
 */

import { HttpInterceptorFn } from '@angular/common/http';

export const securityInterceptor: HttpInterceptorFn = (req, next) => {
    const secureReq = req.clone({
        setHeaders: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    return next(secureReq);
};
