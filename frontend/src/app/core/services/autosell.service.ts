import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { AutoSellRule, StockItem, StockStats, DeliveryLog } from '../types';

@Injectable({ providedIn: 'root' })
export class AutoSellService {
    private http = inject(HttpService);

    getRules() {
        return this.http.get<{ rules: AutoSellRule[] }>('/api/autosell');
    }

    getRule(id: number) {
        return this.http.get<AutoSellRule>(`/api/autosell/${id}`);
    }

    createRule(rule: Partial<AutoSellRule>) {
        return this.http.post<{ success: boolean; id?: number }>('/api/autosell', rule);
    }

    updateRule(id: number, rule: Partial<AutoSellRule>) {
        return this.http.put<{ success: boolean }>(`/api/autosell/${id}`, rule);
    }

    deleteRule(id: number) {
        return this.http.delete<{ success: boolean }>(`/api/autosell/${id}`);
    }

    toggleRule(id: number) {
        return this.http.post<{ success: boolean }>(`/api/autosell/${id}/toggle`);
    }

    // 库存管理
    getStock(ruleId: number, includeUsed = false) {
        const query = includeUsed ? '?includeUsed=true' : '';
        return this.http.get<{ items: StockItem[]; stats: StockStats }>(
            `/api/autosell/${ruleId}/stock${query}`
        );
    }

    addStock(ruleId: number, contents: string[]) {
        return this.http.post<{ success: boolean; count: number }>(
            `/api/autosell/${ruleId}/stock`,
            { contents }
        );
    }

    clearStock(ruleId: number, onlyUsed = false) {
        const query = onlyUsed ? '?onlyUsed=true' : '';
        return this.http.delete<{ success: boolean; count: number }>(
            `/api/autosell/${ruleId}/stock${query}`
        );
    }

    // 发货记录
    getLogs(params?: { ruleId?: number; orderId?: string; limit?: number; offset?: number }) {
        const query = new URLSearchParams();
        if (params?.ruleId) query.set('ruleId', String(params.ruleId));
        if (params?.orderId) query.set('orderId', params.orderId);
        if (params?.limit) query.set('limit', String(params.limit));
        if (params?.offset) query.set('offset', String(params.offset));
        const queryStr = query.toString();
        return this.http.get<{ logs: DeliveryLog[]; total: number }>(
            `/api/autosell/logs${queryStr ? '?' + queryStr : ''}`
        );
    }
}
