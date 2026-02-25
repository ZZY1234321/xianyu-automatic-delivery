import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { GoodsListResponse, GoodsDetailResponse } from '../types';

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

    /**
     * 获取商品详情（包括所有规格）
     * @param accountId 账号ID
     * @param itemIdOrUrl 商品ID或商品链接
     */
    getGoodsDetail(accountId: string, itemIdOrUrl: string) {
        const params: any = { accountId };
        if (itemIdOrUrl.includes('goofish.com') || itemIdOrUrl.includes('?')) {
            params.url = itemIdOrUrl;
        } else {
            params.itemId = itemIdOrUrl;
        }
        return this.http.get<GoodsDetailResponse>('/api/goods/detail', params);
    }

    /**
     * 解析商品链接，提取商品ID
     * @param url 商品链接
     */
    parseItemUrl(url: string) {
        return this.http.post<{ success: boolean; itemId: string }>('/api/goods/parse-url', { url });
    }
}
