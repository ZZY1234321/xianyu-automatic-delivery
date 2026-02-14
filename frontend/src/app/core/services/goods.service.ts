import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { GoodsListResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class GoodsService {
    private http = inject(HttpService);

    getGoods(accountId?: string, page = 1) {
        return this.http.get<GoodsListResponse>('/api/goods', {
            accountId,
            page: page > 1 ? page : undefined
        });
    }

    getAccountGoods(accountId: string, page = 1) {
        return this.http.get<GoodsListResponse>(`/api/accounts/${accountId}/goods`, {
            page: page > 1 ? page : undefined
        });
    }
}
