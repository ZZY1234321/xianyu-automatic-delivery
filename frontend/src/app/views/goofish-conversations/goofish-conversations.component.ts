import {
    Component, OnInit, OnDestroy, signal, inject,
    ChangeDetectionStrategy, ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { ICONS } from '../../shared/icons';
import { ConversationService, WSPushService } from '../../core/services';
import type { Conversation } from '../../core/types';

@Component({
    selector: 'app-goofish-conversations',
    imports: [LucideAngularModule],
    templateUrl: './goofish-conversations.html',
    styleUrl: './goofish-conversations.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoofishConversationsComponent implements OnInit, OnDestroy {
    private readonly conversationService = inject(ConversationService);
    private readonly wsPushService = inject(WSPushService);
    private readonly cdr = inject(ChangeDetectorRef);
    private wsSubscription: Subscription | null = null;
    readonly icons = ICONS;

    @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

    conversations = signal<Conversation[]>([]);
    selectedConversation = signal<Conversation | null>(null);
    loading = signal(false);
    loadingMore = signal(false);

    total = signal(0);
    offset = signal(0);
    hasMore = signal(true);

    loadingMoreMessages = signal(false);
    hasMoreMessages = signal(true);

    ngOnInit() {
        this.loadConversations();
    }

    ngOnDestroy() {
        this.wsSubscription?.unsubscribe();
        this.wsPushService.unsubscribeConversations();
    }

    private scrollToBottom(): void {
        const el = this.messagesContainer?.nativeElement;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }

    private subscribeWS() {
        // 防止重复订阅
        if (this.wsSubscription) return;

        this.wsPushService.subscribeConversations(20);
        this.wsSubscription = this.wsPushService.conversations$.subscribe(async (data) => {
            // 更新对话列表
            const current = this.conversations();
            if (current.length <= 20) {
                this.conversations.set(data.conversations as Conversation[]);
            } else {
                const rest = current.slice(20);
                this.conversations.set([...(data.conversations as Conversation[]), ...rest]);
            }
            this.total.set(data.total);
            this.hasMore.set(data.conversations.length < data.total);

            // 如果有选中的对话，刷新消息
            const selected = this.selectedConversation();
            if (selected) {
                try {
                    const detail = await this.conversationService.getConversation(
                        selected.accountId, selected.chatId, 50
                    );
                    this.selectedConversation.set(detail);
                    this.cdr.detectChanges();
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => this.scrollToBottom());
                    });
                } catch { /* 忽略 */ }
            }
        });
    }

    async loadConversations() {
        this.loading.set(true);
        this.offset.set(0);
        try {
            const res = await this.conversationService.getConversations(20, 0);
            this.conversations.set(res.conversations);
            this.total.set(res.total);
            this.hasMore.set(res.conversations.length < res.total);
            // 数据加载成功后再订阅 WebSocket，避免竞态
            this.subscribeWS();
        } catch (e) {
            console.error('加载对话列表失败', e);
        } finally {
            this.loading.set(false);
        }
    }

    async loadMoreConversations() {
        if (this.loadingMore() || !this.hasMore()) return;
        this.loadingMore.set(true);
        try {
            const newOffset = this.offset() + 20;
            const res = await this.conversationService.getConversations(20, newOffset);
            this.conversations.update(list => [...list, ...res.conversations]);
            this.offset.set(newOffset);
            this.hasMore.set(this.conversations().length < res.total);
        } catch (e) {
            console.error('加载更多对话失败', e);
        } finally {
            this.loadingMore.set(false);
        }
    }

    async openConversation(conv: Conversation) {
        try {
            const detail = await this.conversationService.getConversation(conv.accountId, conv.chatId, 50);
            this.selectedConversation.set(detail);
            this.hasMoreMessages.set((detail.messageCount || 0) > (detail.messages?.length || 0));
            this.cdr.detectChanges();
            // 等待 DOM 渲染完成后滚动
            requestAnimationFrame(() => {
                requestAnimationFrame(() => this.scrollToBottom());
            });
            await this.conversationService.markAsRead(conv.accountId, conv.chatId);
            conv.unread = 0;
        } catch (e) {
            console.error('加载对话详情失败', e);
        }
    }

    async loadMoreMessages() {
        const conv = this.selectedConversation();
        if (!conv || this.loadingMoreMessages() || !this.hasMoreMessages()) return;
        const messages = conv.messages || [];
        if (messages.length === 0) return;
        this.loadingMoreMessages.set(true);
        try {
            const firstMsgId = messages[0].id;
            const detail = await this.conversationService.getConversation(conv.accountId, conv.chatId, 50, firstMsgId);
            if (detail.messages && detail.messages.length > 0) {
                this.selectedConversation.update(c => c ? {
                    ...c, messages: [...detail.messages!, ...(c.messages || [])]
                } : null);
                this.hasMoreMessages.set(detail.messages.length === 50);
            } else {
                this.hasMoreMessages.set(false);
            }
        } catch (e) {
            console.error('加载更多消息失败', e);
        } finally {
            this.loadingMoreMessages.set(false);
        }
    }

    closeConversation() {
        this.selectedConversation.set(null);
        this.hasMoreMessages.set(true);
    }

    formatTime(timestamp: number): string {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
}
