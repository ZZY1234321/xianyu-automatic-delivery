/**
 * 账号相关类型定义
 */

export interface Account {
    id: string;
    cookies: string;
    userId?: string;
    nickname?: string;
    avatar?: string;
    enabled: boolean;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ClientStatus {
    accountId: string;
    connected: boolean;
    userId: string;
}

export interface StatusResponse {
    clients: ClientStatus[];
    activeCount: number;
    messageCount: number;
}
