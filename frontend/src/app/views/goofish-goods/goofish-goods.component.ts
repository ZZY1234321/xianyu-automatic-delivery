import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ICONS } from '../../shared/icons';
import { GoodsService, AccountService } from '../../core/services';
import type { GoodsItem, Account, GoodsDetail } from '../../core/types';

@Component({
    selector: 'app-goofish-goods',
    imports: [LucideAngularModule],
    templateUrl: './goofish-goods.html',
    styleUrl: './goofish-goods.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoofishGoodsComponent implements OnInit {
    private readonly goodsService = inject(GoodsService);
    private readonly accountService = inject(AccountService);
    readonly icons = ICONS;

    private readonly STORAGE_KEY_ACCOUNT = 'goofish_goods_filter_account';
    private readonly STORAGE_KEY_STATUS = 'goofish_goods_filter_status';

    goods = signal<GoodsItem[]>([]);
    accounts = signal<Account[]>([]);
    selectedAccountId = signal<string>(localStorage.getItem(this.STORAGE_KEY_ACCOUNT) || '');
    selectedStatus = signal<string>(localStorage.getItem(this.STORAGE_KEY_STATUS) || '');
    loading = signal(false);
    totalCount = signal(0);

    // 自定义下拉框状态
    showAccountDropdown = signal(false);
    showStatusDropdown = signal(false);

    statusOptions = [
        { value: '', label: '全部状态' },
        { value: '0', label: '在售' },
        { value: '1', label: '已下架' }
    ];

    filteredGoods = () => {
        const status = this.selectedStatus();
        if (status === '') {
            return this.goods();
        }
        return this.goods().filter(item => item.itemStatus === Number(status));
    };

    ngOnInit() {
        this.loadAccounts();
        this.loadGoods();
    }

    async loadAccounts() {
        try {
            const res = await this.accountService.getAccounts();
            this.accounts.set(res.accounts);
        } catch (e) {
            console.error('加载账号列表失败', e);
        }
    }

    async loadGoods() {
        this.loading.set(true);
        try {
            const accountId = this.selectedAccountId() || undefined;
            const res = await this.goodsService.getGoods(accountId);
            this.goods.set(res.items);
            this.totalCount.set(res.totalCount);
        } catch (e) {
            console.error('加载商品列表失败', e);
        } finally {
            this.loading.set(false);
        }
    }

    onAccountChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.selectedAccountId.set(select.value);
        localStorage.setItem(this.STORAGE_KEY_ACCOUNT, select.value);
        this.loadGoods();
    }

    onStatusChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.selectedStatus.set(select.value);
        localStorage.setItem(this.STORAGE_KEY_STATUS, select.value);
    }

    getStatusText(status: number): string {
        switch (status) {
            case 0: return '在售';
            case 1: return '已下架';
            default: return '未知';
        }
    }

    getStatusClass(status: number): string {
        switch (status) {
            case 0: return 'badge-success';
            case 1: return 'badge-warning';
            default: return 'badge-ghost';
        }
    }

    // 自定义下拉框方法
    getAccountLabel(accountId: string): string {
        if (!accountId) return '全部账号';
        const account = this.accounts().find(a => a.id === accountId);
        return account?.nickname || account?.id || '全部账号';
    }

    getStatusLabel(status: string): string {
        const opt = this.statusOptions.find(o => o.value === status);
        return opt?.label || '全部状态';
    }

    selectAccount(accountId: string) {
        this.selectedAccountId.set(accountId);
        localStorage.setItem(this.STORAGE_KEY_ACCOUNT, accountId);
        this.showAccountDropdown.set(false);
        this.loadGoods();
    }

    selectStatus(value: string) {
        this.selectedStatus.set(value);
        localStorage.setItem(this.STORAGE_KEY_STATUS, value);
        this.showStatusDropdown.set(false);
    }

    // 商品详情相关
    showDetailModal = signal(false);
    detailLoading = signal(false);
    goodsDetail = signal<GoodsDetail | null>(null);
    detailError = signal('');

    async viewGoodsDetail(item: GoodsItem) {
        if (!item.accountId) {
            this.detailError.set('商品缺少账号信息');
            return;
        }

        this.showDetailModal.set(true);
        this.detailLoading.set(true);
        this.detailError.set('');
        this.goodsDetail.set(null);

        try {
            const res = await this.goodsService.getGoodsDetail(item.accountId, item.id);
            if (res.success && res.detail) {
                this.goodsDetail.set(res.detail);
            } else {
                this.detailError.set('获取商品详情失败');
            }
        } catch (e: any) {
            console.error('获取商品详情失败', e);
            this.detailError.set(e?.error?.error || '获取商品详情失败');
        } finally {
            this.detailLoading.set(false);
        }
    }

    closeDetailModal() {
        this.showDetailModal.set(false);
        this.goodsDetail.set(null);
        this.detailError.set('');
    }
}
