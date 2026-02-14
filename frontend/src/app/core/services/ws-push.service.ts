import { Injectable, NgZone, inject } from '@angular/core';
import { Subject } from 'rxjs';

import type { Order, Account, Conversation } from '../types';

export interface OrdersUpdate {
    orders: Order[];
    total: number;
}

export interface AccountsUpdate {
    accounts: Account[];
    clients: Array<{ accountId: string; connected: boolean; userId: string }>;
}

export interface ConversationsUpdate {
    conversations: Conversation[];
    total: number;
}

interface WSMessage {
    event: string;
    data: unknown;
}

@Injectable({ providedIn: 'root' })
export class WSPushService {
    private zone = inject(NgZone);
    private ws: WebSocket | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private subscriptions = new Set<string>();
    private params: Record<string, string | number | undefined> = {};

    readonly orders$ = new Subject<OrdersUpdate>();
    readonly accounts$ = new Subject<AccountsUpdate>();
    readonly conversations$ = new Subject<ConversationsUpdate>();

    private connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;
        if (this.ws?.readyState === WebSocket.CONNECTING) return;

        // 清理重连定时器
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        this.ws = new WebSocket(`${protocol}//${host}/ws`);

        this.ws.onopen = () => {
            // 连接成功后发送所有订阅
            if (this.subscriptions.size > 0) {
                this.sendSubscribe([...this.subscriptions]);
            }
        };

        this.ws.onmessage = (event) => {
            this.zone.run(() => {
                try {
                    const msg = JSON.parse(event.data) as WSMessage;
                    this.handleMessage(msg);
                } catch { /* 忽略解析错误 */ }
            });
        };

        this.ws.onclose = () => {
            this.ws = null;
            // 只在有订阅时重连
            if (this.subscriptions.size > 0 && !this.reconnectTimer) {
                this.reconnectTimer = setTimeout(() => {
                    this.reconnectTimer = null;
                    this.connect();
                }, 3000);
            }
        };

        this.ws.onerror = () => {
            this.ws?.close();
        };
    }

    private handleMessage(msg: WSMessage): void {
        switch (msg.event) {
            case 'orders':
                this.orders$.next(msg.data as OrdersUpdate);
                break;
            case 'accounts':
                this.accounts$.next(msg.data as AccountsUpdate);
                break;
            case 'conversations':
                this.conversations$.next(msg.data as ConversationsUpdate);
                break;
        }
    }

    private sendSubscribe(events: string[]): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                action: 'subscribe',
                events,
                params: this.params
            }));
        }
    }

    private sendUnsubscribe(events: string[]): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                action: 'unsubscribe',
                events
            }));
        }
    }

    // 订阅订单更新
    subscribeOrders(accountId?: string, status?: number): void {
        this.params['accountId'] = accountId;
        this.params['status'] = status;

        if (!this.subscriptions.has('orders')) {
            this.subscriptions.add('orders');
            this.connect();
            // 如果已连接，立即发送订阅
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.sendSubscribe(['orders']);
            }
        } else if (this.ws?.readyState === WebSocket.OPEN) {
            // 参数变化，更新参数
            this.ws.send(JSON.stringify({
                action: 'updateParams',
                params: this.params
            }));
        }
    }

    unsubscribeOrders(): void {
        this.subscriptions.delete('orders');
        this.sendUnsubscribe(['orders']);
        this.checkDisconnect();
    }

    // 订阅账号更新
    subscribeAccounts(): void {
        if (!this.subscriptions.has('accounts')) {
            this.subscriptions.add('accounts');
            this.connect();
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.sendSubscribe(['accounts']);
            }
        }
    }

    unsubscribeAccounts(): void {
        this.subscriptions.delete('accounts');
        this.sendUnsubscribe(['accounts']);
        this.checkDisconnect();
    }

    // 订阅对话更新
    subscribeConversations(limit = 20): void {
        this.params['limit'] = limit;

        if (!this.subscriptions.has('conversations')) {
            this.subscriptions.add('conversations');
            this.connect();
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.sendSubscribe(['conversations']);
            }
        }
    }

    unsubscribeConversations(): void {
        this.subscriptions.delete('conversations');
        this.sendUnsubscribe(['conversations']);
        this.checkDisconnect();
    }

    // 没有订阅时断开连接
    private checkDisconnect(): void {
        if (this.subscriptions.size === 0) {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this.ws?.close();
            this.ws = null;
        }
    }
}
