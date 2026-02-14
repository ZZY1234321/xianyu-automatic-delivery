/**
 * 对话相关类型定义
 */

export interface ConversationMessage {
    id: number;
    senderId: string;
    senderName: string;
    content: string;
    msgTime: string;
    msgId?: string;
    timestamp: number;
    direction: 'in' | 'out';
}

export interface Conversation {
    accountId: string;
    accountNickname?: string;
    chatId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    lastMessage: string;
    lastTime: number;
    unread: number;
    messageCount?: number;
    messages?: ConversationMessage[];
}

export interface ConversationListResponse {
    conversations: Conversation[];
    total: number;
    limit: number;
    offset: number;
}
