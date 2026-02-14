import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { Conversation, ConversationListResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class ConversationService {
    private http = inject(HttpService);

    getConversations(limit = 20, offset = 0) {
        return this.http.get<ConversationListResponse>('/api/conversations', { limit, offset });
    }

    getConversation(accountId: string, chatId: string, limit = 50, beforeId?: number) {
        const path = `/api/conversations/${encodeURIComponent(accountId)}/${encodeURIComponent(chatId)}`;
        return this.http.get<Conversation>(path, { limit, beforeId });
    }

    markAsRead(accountId: string, chatId: string) {
        const path = `/api/conversations/${encodeURIComponent(accountId)}/${encodeURIComponent(chatId)}/read`;
        return this.http.post<{ success: boolean }>(path);
    }
}
