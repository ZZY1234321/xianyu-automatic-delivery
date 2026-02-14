/**
 * 商品相关类型定义
 */

export interface GoodsItem {
    id: string;
    title: string;
    price: string;
    picUrl: string;
    picWidth: number;
    picHeight: number;
    categoryId: number;
    itemStatus: number;
    hasVideo: boolean;
    soldPrice?: string;
    postInfo?: string;
    accountId?: string;
    accountNickname?: string;
}

export interface GoodsListResponse {
    items: GoodsItem[];
    nextPage?: boolean;
    totalCount: number;
}
