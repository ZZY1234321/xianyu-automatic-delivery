import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { ICONS } from '../../shared/icons';
import { DialogService } from '../../shared/dialog';
import { OrderService, AccountService, WSPushService } from '../../core/services';
import { ORDER_STATUS_TEXT, ORDER_STATUS_CLASS, OrderStatus } from '../../core/types';
import type { Order, Account } from '../../core/types';

@Component({
    selector: 'app-goofish-orders',
    imports: [LucideAngularModule, FormsModule],
    templateUrl: './goofish-orders.html',
    styleUrl: './goofish-orders.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoofishOrdersComponent implements OnInit, OnDestroy {
    private readonly orderService = inject(OrderService);
    private readonly accountService = inject(AccountService);
    private readonly wsPushService = inject(WSPushService);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly dialog = inject(DialogService);
    private wsSubscription: Subscription | null = null;

    readonly icons = ICONS;
    readonly Math = Math;
    readonly OrderStatus = OrderStatus;

    orders = signal<Order[]>([]);
    accounts = signal<Account[]>([]);
    loading = signal(false);
    refreshing = signal<string | null>(null);
    shipping = signal<string | null>(null);
    deleting = signal<string | null>(null);

    // 筛选
    selectedAccountId = signal('');
    selectedStatus = signal<number | ''>('');

    // 分页
    total = signal(0);
    offset = signal(0);
    limit = 20;

    // 手动获取订单
    manualOrderId = signal('');
    manualAccountId = signal('');
    fetching = signal(false);

    // 批量选择
    selectedOrderIds = signal<Set<string>>(new Set());

    // 自定义下拉框状态
    showAccountDropdown = signal(false);
    showStatusDropdown = signal(false);
    showManualAccountDropdown = signal(false);

    statusOptions = [
        { value: '', label: '全部状态' },
        { value: 0, label: '获取中' },
        { value: OrderStatus.PENDING_PAYMENT, label: '待付款' },
        { value: OrderStatus.PENDING_SHIPMENT, label: '待发货' },
        { value: OrderStatus.PENDING_RECEIPT, label: '待收货' },
        { value: OrderStatus.COMPLETED, label: '交易成功' },
        { value: OrderStatus.CLOSED, label: '已关闭' }
    ];

    ngOnInit() {
        this.loadAccounts();
        this.loadOrders();
        this.subscribeWS();
    }

    ngOnDestroy() {
        this.wsSubscription?.unsubscribe();
        this.wsPushService.unsubscribeOrders();
    }

    private subscribeWS() {
        const accountId = this.selectedAccountId() || undefined;
        const status = this.selectedStatus() === '' ? undefined : this.selectedStatus() as number;

        this.wsPushService.subscribeOrders(accountId, status);
        // 取消旧的订阅，避免重复订阅
        this.wsSubscription?.unsubscribe();
        this.wsSubscription = this.wsPushService.orders$.subscribe((data) => {
            // WebSocket 更新时，只在非加载状态下更新数据
            // 避免在 API 加载时被 WebSocket 数据覆盖
            if (data && !this.loading()) {
                // WebSocket 返回的数据可能使用不同的 limit/offset（固定 limit: 50, offset: 0）
                // 所以只更新总数，订单列表由 API 控制（支持分页）
                if (data.total !== undefined) {
                    this.total.set(data.total);
                }
                // 如果当前没有订单数据，则使用 WebSocket 数据（可能是初始加载）
                // 否则不更新订单列表，因为 WebSocket 的 limit/offset 与 API 不一致
                if (this.orders().length === 0 && data.orders) {
                    this.orders.set(data.orders);
                }
                this.cdr.detectChanges();
            }
        });
    }

    async loadAccounts() {
        try {
            const res = await this.accountService.getAccounts();
            this.accounts.set(res.accounts);
        } catch (e) {
            console.error('加载账号列表失败', e);
        }
    }

    async loadOrders() {
        this.loading.set(true);
        try {
            const res = await this.orderService.getOrders(
                this.selectedAccountId() || undefined,
                this.selectedStatus() === '' ? undefined : this.selectedStatus() as number,
                undefined, // isRated 参数，暂时不使用
                this.limit,
                this.offset()
            );
            console.log('[订单列表] API 响应:', { 
                ordersCount: res.orders?.length || 0, 
                total: res.total,
                limit: res.limit,
                offset: res.offset,
                selectedAccountId: this.selectedAccountId(),
                selectedStatus: this.selectedStatus()
            });
            this.orders.set(res.orders || []);
            this.total.set(res.total || 0);
            this.cdr.detectChanges();
        } catch (e: any) {
            console.error('加载订单列表失败', e);
            // 显示错误信息
            const errorMsg = e?.error?.error || e?.message || '加载订单列表失败';
            await this.dialog.alert('错误', `加载订单列表失败: ${errorMsg}`);
            // 确保即使出错也清空列表，避免显示旧数据
            this.orders.set([]);
            this.total.set(0);
        } finally {
            this.loading.set(false);
        }
    }
    
    async refreshOrders() {
        // 刷新订单列表，并重新订阅 WebSocket
        this.offset.set(0);
        // 先取消 WebSocket 订阅，避免在加载时被覆盖
        this.wsSubscription?.unsubscribe();
        this.wsPushService.unsubscribeOrders();
        // 加载订单列表
        await this.loadOrders();
        // 重新订阅 WebSocket 以确保实时更新（延迟一点，确保 API 数据先显示）
        setTimeout(() => {
            this.subscribeWS();
        }, 200);
    }

    onFilterChange() {
        this.offset.set(0);
        this.loadOrders();
        // 重新订阅 WebSocket
        this.wsSubscription?.unsubscribe();
        this.subscribeWS();
    }

    async refreshOrder(order: Order) {
        this.refreshing.set(order.orderId);
        try {
            const res = await this.orderService.refreshOrder(order.orderId);
            if (res.success && res.order) {
                this.orders.update(list =>
                    list.map(o => o.orderId === order.orderId ? res.order! : o)
                );
            }
        } catch (e) {
            console.error('刷新订单失败', e);
        } finally {
            this.refreshing.set(null);
        }
    }

    async shipOrder(order: Order) {
        const confirmed = await this.dialog.confirmHtml(
            '确认发货',
            `<div class="space-y-2">
                <p>订单号: <span class="text-primary font-mono font-bold">${order.orderId}</span></p>
                <p>商品: ${order.itemTitle || '未知商品'}</p>
                <p>买家: ${order.buyerNickname || order.buyerUserId || '-'}</p>
                <p>金额: <span class="font-bold">¥${order.price || '-'}</span></p>
                <p>下单时间: ${this.formatTime(order.orderTime)}</p>
                <p class="pt-2">确定要发货吗？</p>
            </div>`
        );
        if (!confirmed) return;

        this.shipping.set(order.orderId);
        try {
            const res = await this.orderService.shipOrder(order.orderId);
            if (res.success && res.order) {
                this.orders.update(list =>
                    list.map(o => o.orderId === order.orderId ? res.order! : o)
                );
            } else {
                await this.dialog.alert('发货失败', res.error || '发货失败');
            }
        } catch (e) {
            console.error('发货失败', e);
            await this.dialog.alert('发货失败', '发货失败，请稍后重试');
        } finally {
            this.shipping.set(null);
        }
    }

    async freeShipOrder(order: Order) {
        const confirmed = await this.dialog.confirmHtml(
            '确认免拼发货',
            `<div class="space-y-2">
                <p>订单号: <span class="text-primary font-mono font-bold">${order.orderId}</span></p>
                <p>商品: ${order.itemTitle || '未知商品'}</p>
                <p>买家: ${order.buyerNickname || order.buyerUserId || '-'}</p>
                <p>金额: <span class="font-bold">¥${order.price || '-'}</span></p>
                <p>下单时间: ${this.formatTime(order.orderTime)}</p>
                <p class="pt-2">确定要免拼发货吗？</p>
            </div>`
        );
        if (!confirmed) return;

        this.shipping.set(order.orderId);
        try {
            const res = await this.orderService.freeShipOrder(order.orderId);
            if (res.success && res.order) {
                this.orders.update(list =>
                    list.map(o => o.orderId === order.orderId ? res.order! : o)
                );
            } else {
                await this.dialog.alert('免拼发货失败', res.error || '免拼发货失败');
            }
        } catch (e) {
            console.error('免拼发货失败', e);
            await this.dialog.alert('免拼发货失败', '免拼发货失败，请稍后重试');
        } finally {
            this.shipping.set(null);
        }
    }

    async deleteOrder(order: Order) {
        const confirmed = await this.dialog.confirm(
            '删除订单',
            `确定要删除此订单记录吗？\n\n⚠️ 删除后无法找回，只能通过官方App查看历史订单记录。`
        );
        if (!confirmed) return;

        this.deleting.set(order.orderId);
        try {
            const res = await this.orderService.deleteOrder(order.orderId);
            if (res.success) {
                this.orders.update(list => list.filter(o => o.orderId !== order.orderId));
                this.total.update(t => t - 1);
            } else {
                await this.dialog.alert('删除失败', res.error || '删除失败');
            }
        } catch (e) {
            console.error('删除订单失败', e);
            await this.dialog.alert('删除失败', '删除订单失败，请稍后重试');
        } finally {
            this.deleting.set(null);
        }
    }

    async fetchManualOrder() {
        const orderId = this.manualOrderId().trim();
        const accountId = this.manualAccountId();
        if (!orderId || !accountId) return;

        this.fetching.set(true);
        try {
            const res = await this.orderService.fetchOrder(accountId, orderId);
            if (res.success) {
                this.manualOrderId.set('');
                await this.dialog.alert('成功', '订单获取成功');
                // 刷新订单列表
                await this.loadOrders();
            } else {
                await this.dialog.alert('获取订单失败', res.error || '获取订单失败');
            }
        } catch (e: any) {
            console.error('获取订单失败', e);
            await this.dialog.alert('获取订单失败', e?.error?.error || '获取订单失败，请稍后重试');
        } finally {
            this.fetching.set(false);
        }
    }

    prevPage() {
        if (this.offset() > 0) {
            this.offset.update(o => Math.max(0, o - this.limit));
            this.loadOrders();
        }
    }

    nextPage() {
        if (this.offset() + this.limit < this.total()) {
            this.offset.update(o => o + this.limit);
            this.loadOrders();
        }
    }

    getStatusText(status: number): string {
        return ORDER_STATUS_TEXT[status] || '未知';
    }

    getStatusClass(status: number): string {
        return ORDER_STATUS_CLASS[status] || 'badge-ghost';
    }

    formatTime(time: string | null): string {
        if (!time) return '-';
        return new Date(time).toLocaleString('zh-CN');
    }

    getAccountNickname(accountId: string): string {
        const account = this.accounts().find(a => a.id === accountId);
        return account?.nickname || accountId;
    }

    // 自定义下拉框方法
    getAccountLabel(accountId: string): string {
        if (!accountId) return '全部账号';
        const account = this.accounts().find(a => a.id === accountId);
        return account?.nickname || account?.id || '全部账号';
    }

    getStatusLabel(status: number | ''): string {
        const opt = this.statusOptions.find(o => o.value === status);
        return opt?.label || '全部状态';
    }

    selectAccount(accountId: string) {
        this.selectedAccountId.set(accountId);
        this.showAccountDropdown.set(false);
        this.onFilterChange();
    }

    selectStatus(value: string | number) {
        this.selectedStatus.set(value as number | '');
        this.showStatusDropdown.set(false);
        this.onFilterChange();
    }

    selectManualAccount(accountId: string) {
        this.manualAccountId.set(accountId);
        this.showManualAccountDropdown.set(false);
    }

    // 批量选择相关方法
    toggleOrderSelection(orderId: string) {
        this.selectedOrderIds.update(ids => {
            const newIds = new Set(ids);
            if (newIds.has(orderId)) {
                newIds.delete(orderId);
            } else {
                newIds.add(orderId);
            }
            return newIds;
        });
    }

    isOrderSelected(orderId: string): boolean {
        return this.selectedOrderIds().has(orderId);
    }

    toggleSelectAll() {
        const allSelected = this.orders().every(o => this.isOrderSelected(o.orderId));
        if (allSelected) {
            this.selectedOrderIds.set(new Set());
        } else {
            this.selectedOrderIds.set(new Set(this.orders().map(o => o.orderId)));
        }
    }

    getSelectedCount(): number {
        return this.selectedOrderIds().size;
    }

    clearSelection() {
        this.selectedOrderIds.set(new Set<string>());
    }

    isAllSelected(): boolean {
        const orders = this.orders();
        if (orders.length === 0) return false;
        return orders.every(o => this.isOrderSelected(o.orderId));
    }

}
