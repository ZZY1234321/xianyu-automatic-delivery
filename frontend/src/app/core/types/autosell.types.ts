/**
 * 自动发货相关类型定义
 */

export type DeliveryType = 'fixed' | 'stock' | 'api';
export type TriggerOn = 'paid' | 'confirmed';

export interface ApiConfig {
    url: string;
    method: 'GET' | 'POST';
    headers?: Record<string, string>;
    body?: string;
    responseField?: string;  // 单字段提取（如 data.key）
    responseTemplate?: string;  // 响应模板（支持多字段，如 "账号:{{data.login_id}} 密码:{{data.key}}"）
}

export interface AutoSellRule {
    id: number;
    name: string;
    enabled: boolean;
    itemId: string | null;
    accountId: string | null;
    deliveryType: DeliveryType;
    deliveryContent: string | null;
    apiConfig: ApiConfig | null;
    triggerOn: TriggerOn;
    workflowId: number | null;
    delaySeconds: number;
    stockCount?: number;
    usedCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface StockItem {
    id: number;
    ruleId: number;
    content: string;
    used: boolean;
    usedOrderId: string | null;
    createdAt: string;
    usedAt: string | null;
}

export interface StockStats {
    total: number;
    used: number;
    available: number;
}

export interface DeliveryLog {
    id: number;
    ruleId: number | null;
    orderId: string;
    accountId: string;
    deliveryType: DeliveryType;
    content: string;
    status: 'success' | 'failed';
    errorMessage: string | null;
    createdAt: string;
}
