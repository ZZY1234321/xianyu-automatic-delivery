import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { Order, OrderListResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private http = inject(HttpService);

    getOrders(accountId?: string, status?: number, isRated?: number, limit = 50, offset = 0) {
        return this.http.get<OrderListResponse>('/api/orders', { accountId, status, isRated, limit, offset });
    }

    getOrder(orderId: string) {
        return this.http.get<{ order: Order }>(`/api/orders/${orderId}`);
    }

    refreshOrder(orderId: string) {
        return this.http.post<{ success: boolean; order?: Order; error?: string }>(
            `/api/orders/${orderId}/refresh`
        );
    }

    fetchOrder(accountId: string, orderId: string) {
        return this.http.post<{ success: boolean; order?: Order; error?: string }>(
            '/api/orders/fetch', { accountId, orderId }
        );
    }

    shipOrder(orderId: string) {
        return this.http.post<{ success: boolean; order?: Order; error?: string }>(
            `/api/orders/${orderId}/ship`
        );
    }

    freeShipOrder(orderId: string) {
        return this.http.post<{ success: boolean; order?: Order; error?: string }>(
            `/api/orders/${orderId}/freeship`
        );
    }

    deleteOrder(orderId: string) {
        return this.http.delete<{ success: boolean; message?: string; error?: string }>(
            `/api/orders/${orderId}`
        );
    }

    // 评价功能已注释：抓包未找到合适的评价接口
    /*
    batchRateOrders(orderIds: string[], rateContent: string = '好评', rateScore: number = 5) {
        return this.http.post<{
            success: boolean;
            results: Array<{ orderId: string; success: boolean; error?: string }>;
            summary: { total: number; success: number; failed: number };
        }>('/api/orders/batch-rate', { orderIds, rateContent, rateScore });
    }
    */
}
