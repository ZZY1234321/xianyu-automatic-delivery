/**
 * HTTP 请求工具
 * 基于 Angular HttpClient，提供简化的 API
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { API_BASE } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class HttpService {
    private http = inject(HttpClient);

    get<T>(path: string, params?: Record<string, string | number | boolean | undefined>) {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }
        return firstValueFrom(this.http.get<T>(`${API_BASE}${path}`, { params: httpParams }));
    }

    post<T>(path: string, body?: unknown) {
        return firstValueFrom(this.http.post<T>(`${API_BASE}${path}`, body ?? {}));
    }

    put<T>(path: string, body?: unknown) {
        return firstValueFrom(this.http.put<T>(`${API_BASE}${path}`, body ?? {}));
    }

    delete<T>(path: string) {
        return firstValueFrom(this.http.delete<T>(`${API_BASE}${path}`));
    }
}
