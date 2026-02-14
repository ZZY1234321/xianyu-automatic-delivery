import { Injectable, inject, signal } from '@angular/core';

import { HttpService } from '../utils';
import type { Account, StatusResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private http = inject(HttpService);
    readonly loading = signal(false);

    getStatus() {
        return this.http.get<StatusResponse>('/api/status');
    }

    getAccounts() {
        return this.http.get<{ accounts: Account[] }>('/api/accounts');
    }

    async addAccount(data: {
        id?: string;
        cookies?: string;
        remark?: string;
    }): Promise<{ success: boolean; accountId?: string; error?: string }> {
        try {
            return await this.http.post('/api/accounts', data);
        } catch (e: unknown) {
            const err = e as { error?: { error?: string }; status?: number };
            return { success: false, error: err.error?.error || `请求失败 (${err.status})` };
        }
    }

    deleteAccount(id: string) {
        return this.http.delete<{ success: boolean }>(`/api/accounts/${id}`);
    }

    startAccount(id: string) {
        return this.http.post<{ success: boolean }>(`/api/accounts/${id}/start`);
    }

    stopAccount(id: string) {
        return this.http.post<{ success: boolean }>(`/api/accounts/${id}/stop`);
    }

    async refreshAccountInfo(id: string): Promise<{ success: boolean; error?: string }> {
        try {
            return await this.http.post(`/api/accounts/${id}/refresh-info`);
        } catch (e: unknown) {
            const err = e as { error?: { error?: string }; status?: number };
            return { success: false, error: err.error?.error || `请求失败 (${err.status})` };
        }
    }
}
