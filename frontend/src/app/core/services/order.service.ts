import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { Order, OrderListResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private http = inject(HttpService);

    getOrders(accountId?: string, status?: number, limit = 50, offset = 0) {
        return this.http.get<OrderListResponse>('/api/orders', { accountId, status, limit, offset });
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
}
