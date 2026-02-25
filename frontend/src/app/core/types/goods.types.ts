/**
 * 商品相关类型定义
 */

// 商品规格选项
export interface GoodsSkuOption {
    name: string;      // 规格名称，如 "100次"、"200次"
    value: string;     // 规格值
    price?: string;    // 该规格的价格（如果有）
}

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
    skuOptions?: GoodsSkuOption[];  // 商品的所有规格选项
}

export interface GoodsListResponse {
    items: GoodsItem[];
    nextPage?: boolean;
    totalCount: number;
}

// 商品详情（包含所有规格）
export interface GoodsDetail {
    id: string;
    title: string;
    price: string;
    picUrl: string;
    description?: string;
    skuOptions: GoodsSkuOption[];  // 所有可用的规格选项
    accountId?: string;
}

export interface GoodsDetailResponse {
    success: boolean;
    detail: GoodsDetail;
}
