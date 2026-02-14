import { Component, OnInit, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';
import { DialogService } from '../../shared/dialog';
import { AutoSellService, AccountService, GoodsService, WorkflowService } from '../../core/services';
import { CodeEditorComponent } from '../../components/code-editor/code-editor.component';
import type {
    AutoSellRule, DeliveryType, TriggerOn, ApiConfig, Account, GoodsItem, StockItem, StockStats,
    Workflow
} from '../../core/types';

@Component({
    selector: 'app-bot-autosell',
    imports: [LucideAngularModule, FormsModule, CodeEditorComponent],
    templateUrl: './bot-autosell.html',
    styleUrl: './bot-autosell.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BotAutosellComponent implements OnInit {
    private readonly service = inject(AutoSellService);
    private readonly accountService = inject(AccountService);
    private readonly goodsService = inject(GoodsService);
    private readonly workflowService = inject(WorkflowService);
    private readonly dialog = inject(DialogService);
    private readonly router = inject(Router);
    readonly icons = ICONS;

    rules = signal<AutoSellRule[]>([]);
    workflows = signal<Workflow[]>([]);
    loading = signal(false);
    saving = signal(false);
    editingRule = signal<AutoSellRule | null>(null);
    showStockModal = signal(false);
    stockRuleId = signal<number | null>(null);
    stockItems = signal<StockItem[]>([]);
    stockStats = signal<StockStats | null>(null);
    loadingStock = signal(false);
    showUsedStock = signal(false);

    // 库存编辑
    stockContent = signal('');
    editingRuleStock = computed(() => {
        const rule = this.editingRule();
        if (!rule) return { total: 0, available: 0 };
        return {
            total: rule.stockCount || 0,
            available: (rule.stockCount || 0) - (rule.usedCount || 0)
        };
    });
    stockContentCount = computed(() => {
        const content = this.stockContent();
        if (!content.trim()) return 0;
        return content.split('\n').filter(line => line.trim()).length;
    });

    // 账号和商品
    accounts = signal<Account[]>([]);
    allGoods = signal<GoodsItem[]>([]);
    loadingGoods = signal(false);
    goodsSearch = signal('');
    showGoodsDropdown = signal(false);

    // 自定义下拉框状态
    showAccountDropdown = signal(false);
    showDeliveryTypeDropdown = signal(false);
    showTriggerDropdown = signal(false);
    showWorkflowDropdown = signal(false);
    showApiMethodDropdown = signal(false);

    filteredGoods = computed(() => {
        const search = this.goodsSearch().toLowerCase();
        const accountId = this.formData().accountId;
        let goods = this.allGoods();

        if (accountId) {
            goods = goods.filter(g => g.accountId === accountId);
        }
        if (search) {
            goods = goods.filter(g =>
                g.title.toLowerCase().includes(search) ||
                g.id.includes(search)
            );
        }
        return goods.slice(0, 20);
    });

    selectedGoods = computed(() => {
        const itemId = this.formData().itemId;
        if (!itemId) return null;
        return this.allGoods().find(g => g.id === itemId) || null;
    });

    formData = signal({
        name: '',
        enabled: true,
        itemId: null as string | null,
        accountId: null as string | null,
        deliveryType: 'fixed' as DeliveryType,
        deliveryContent: '',
        triggerOn: 'paid' as TriggerOn,
        workflowId: null as number | null,
        delaySeconds: 0,
        apiUrl: '',
        apiMethod: 'GET' as 'GET' | 'POST',
        apiHeaders: '',
        apiBody: '',
        apiResponseField: '',
        apiResponseTemplate: ''
    });

    deliveryTypes = [
        { value: 'fixed', label: '固定文本' },
        { value: 'stock', label: '库存发货' },
        { value: 'api', label: 'API取货' }
    ];

    triggerOptions = [
        { value: 'paid', label: '待发货' },
        { value: 'confirmed', label: '待收货' }
    ];

    ngOnInit() {
        this.loadRules();
        this.loadAccounts();
        this.loadAllGoods();
        this.loadWorkflows();
    }

    async loadWorkflows() {
        try {
            const res = await this.workflowService.getWorkflows();
            this.workflows.set(res.workflows);
        } catch (e) {
            console.error('加载流程失败', e);
        }
    }

    async loadAccounts() {
        try {
            const res = await this.accountService.getAccounts();
            this.accounts.set(res.accounts.filter(a => a.enabled));
        } catch (e) {
            console.error('加载账号失败', e);
        }
    }

    async loadAllGoods() {
        this.loadingGoods.set(true);
        try {
            const res = await this.goodsService.getGoods();
            this.allGoods.set(res.items);
        } catch (e) {
            console.error('加载商品失败', e);
        } finally {
            this.loadingGoods.set(false);
        }
    }

    async loadRules() {
        this.loading.set(true);
        try {
            const res = await this.service.getRules();
            this.rules.set(res.rules);
        } catch (e) {
            console.error('加载规则失败', e);
        } finally {
            this.loading.set(false);
        }
    }

    onEdit(rule: AutoSellRule) {
        this.editingRule.set(rule);
        const apiConfig = rule.apiConfig;
        this.formData.set({
            name: rule.name,
            enabled: rule.enabled,
            itemId: rule.itemId,
            accountId: rule.accountId,
            deliveryType: rule.deliveryType,
            deliveryContent: rule.deliveryContent || '',
            triggerOn: rule.triggerOn,
            workflowId: rule.workflowId,
            delaySeconds: rule.delaySeconds || 0,
            apiUrl: apiConfig?.url || '',
            apiMethod: apiConfig?.method || 'GET',
            apiHeaders: apiConfig?.headers ? JSON.stringify(apiConfig.headers, null, 2) : '',
            apiBody: apiConfig?.body || '',
            apiResponseField: apiConfig?.responseField || '',
            apiResponseTemplate: apiConfig?.responseTemplate || ''
        });
        this.goodsSearch.set('');
        this.stockContent.set('');
    }

    cancelEdit() {
        this.editingRule.set(null);
        this.resetForm();
    }

    resetForm() {
        this.formData.set({
            name: '',
            enabled: true,
            itemId: null,
            accountId: null,
            deliveryType: 'fixed',
            deliveryContent: '',
            triggerOn: 'paid',
            workflowId: null,
            delaySeconds: 0,
            apiUrl: '',
            apiMethod: 'GET',
            apiHeaders: '',
            apiBody: '',
            apiResponseField: '',
            apiResponseTemplate: ''
        });
        this.goodsSearch.set('');
        this.stockContent.set('');
    }

    updateField<K extends keyof ReturnType<typeof this.formData>>(
        field: K,
        value: ReturnType<typeof this.formData>[K]
    ) {
        this.formData.update(f => ({ ...f, [field]: value }));
        if (field === 'accountId') {
            this.formData.update(f => ({ ...f, itemId: null }));
            this.goodsSearch.set('');
        }
    }

    selectGoods(goods: GoodsItem) {
        this.formData.update(f => ({
            ...f,
            itemId: goods.id,
            accountId: goods.accountId || null
        }));
        this.goodsSearch.set('');
        this.showGoodsDropdown.set(false);
    }

    clearGoodsSelection() {
        this.formData.update(f => ({ ...f, itemId: null }));
        this.goodsSearch.set('');
    }

    onGoodsSearchFocus() {
        this.showGoodsDropdown.set(true);
    }

    onGoodsSearchBlur() {
        setTimeout(() => this.showGoodsDropdown.set(false), 200);
    }

    onStockFileSelect(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const text = reader.result as string;
            const current = this.stockContent();
            if (current.trim()) {
                this.stockContent.set(current + '\n' + text);
            } else {
                this.stockContent.set(text);
            }
        };
        reader.readAsText(file, 'utf-8');
        input.value = '';
    }

    getGoodsTitle(itemId: string): string {
        const goods = this.allGoods().find(g => g.id === itemId);
        return goods?.title || itemId;
    }

    async saveRule() {
        const data = this.formData();
        if (!data.name) {
            await this.dialog.alert('提示', '请输入规则名称');
            return;
        }
        if (!data.itemId) {
            await this.dialog.alert('提示', '请选择商品');
            return;
        }

        let apiConfig: ApiConfig | null = null;
        if (data.deliveryType === 'api') {
            if (!data.apiUrl) {
                await this.dialog.alert('提示', '请输入 API 地址');
                return;
            }
            let headers: Record<string, string> | undefined;
            if (data.apiHeaders) {
                try {
                    headers = JSON.parse(data.apiHeaders);
                } catch {
                    await this.dialog.alert('错误', 'Headers 格式不正确，请使用 JSON 格式');
                    return;
                }
            }
            apiConfig = {
                url: data.apiUrl,
                method: data.apiMethod,
                headers,
                body: data.apiBody || undefined,
                responseField: data.apiResponseField || undefined,
                responseTemplate: data.apiResponseTemplate || undefined
            };
        }

        if (data.deliveryType === 'fixed' && !data.deliveryContent) {
            await this.dialog.alert('提示', '请输入发货内容');
            return;
        }

        const payload: Partial<AutoSellRule> = {
            name: data.name,
            enabled: data.enabled,
            itemId: data.itemId,
            accountId: data.accountId,
            deliveryType: data.deliveryType,
            deliveryContent: data.deliveryType === 'fixed' ? data.deliveryContent : null,
            apiConfig,
            triggerOn: data.triggerOn,
            workflowId: data.workflowId,
            delaySeconds: data.delaySeconds || 0
        };

        this.saving.set(true);
        try {
            const editing = this.editingRule();
            let ruleId: number;
            if (editing) {
                await this.service.updateRule(editing.id, payload);
                ruleId = editing.id;
            } else {
                const res = await this.service.createRule(payload);
                ruleId = res.id!;
            }

            if (data.deliveryType === 'stock' && this.stockContent().trim()) {
                const contents = this.stockContent()
                    .split('\n')
                    .map(s => s.trim())
                    .filter(Boolean);
                if (contents.length > 0) {
                    await this.service.addStock(ruleId, contents);
                }
            }

            this.cancelEdit();
            await this.loadRules();
        } catch (e) {
            console.error('保存失败', e);
            await this.dialog.alert('错误', '保存失败');
        } finally {
            this.saving.set(false);
        }
    }

    async toggleRule(rule: AutoSellRule) {
        await this.service.toggleRule(rule.id);
        await this.loadRules();
    }

    async deleteRule(rule: AutoSellRule) {
        const confirmed = await this.dialog.confirm('确认删除', `确定要删除规则 "${rule.name}" 吗？`);
        if (!confirmed) return;
        await this.service.deleteRule(rule.id);
        await this.loadRules();
    }

    // 库存管理
    async openStockModal(ruleId: number) {
        this.stockRuleId.set(ruleId);
        this.showUsedStock.set(false);
        this.showStockModal.set(true);
        await this.loadStockItems();
    }

    closeStockModal() {
        this.showStockModal.set(false);
        this.stockRuleId.set(null);
        this.stockItems.set([]);
        this.stockStats.set(null);
    }

    async loadStockItems() {
        const ruleId = this.stockRuleId();
        if (!ruleId) return;

        this.loadingStock.set(true);
        try {
            const res = await this.service.getStock(ruleId, this.showUsedStock());
            this.stockItems.set(res.items);
            this.stockStats.set(res.stats);
        } catch (e) {
            console.error('加载库存失败', e);
        } finally {
            this.loadingStock.set(false);
        }
    }

    async toggleShowUsed() {
        this.showUsedStock.update(v => !v);
        await this.loadStockItems();
    }

    async clearStock(ruleId: number, onlyUsed: boolean) {
        const msg = onlyUsed ? '确定要清空已使用的库存吗？' : '确定要清空所有库存吗？';
        const confirmed = await this.dialog.confirm('确认清空', msg);
        if (!confirmed) return;

        try {
            const res = await this.service.clearStock(ruleId, onlyUsed);
            await this.loadRules();
            if (this.showStockModal()) {
                await this.loadStockItems();
            }
            await this.dialog.alert('成功', `已清空 ${res.count} 条库存`);
        } catch (e) {
            console.error('清空库存失败', e);
        }
    }

    getDeliveryTypeLabel(type: DeliveryType): string {
        return this.deliveryTypes.find(t => t.value === type)?.label || type;
    }

    getTriggerLabel(trigger: TriggerOn): string {
        return this.triggerOptions.find(t => t.value === trigger)?.label || trigger;
    }

    getWorkflowName(workflowId: number | null): string {
        if (!workflowId) return '默认流程';
        const workflow = this.workflows().find(w => w.id === workflowId);
        return workflow?.name || '默认流程';
    }

    goToWorkflowPage() {
        this.router.navigate(['/workflow']);
    }

    // 自定义下拉框方法
    getAccountLabel(accountId: string | null): string {
        if (!accountId) return '全部账号';
        const account = this.accounts().find(a => a.id === accountId);
        return account?.nickname || account?.id || '全部账号';
    }

    selectAccount(accountId: string | null) {
        this.updateField('accountId', accountId);
        this.showAccountDropdown.set(false);
    }

    selectDeliveryType(value: string) {
        this.updateField('deliveryType', value as DeliveryType);
        this.showDeliveryTypeDropdown.set(false);
    }

    selectTrigger(value: string) {
        this.updateField('triggerOn', value as TriggerOn);
        this.showTriggerDropdown.set(false);
    }

    selectWorkflow(workflowId: number | null) {
        this.updateField('workflowId', workflowId);
        this.showWorkflowDropdown.set(false);
    }

    selectApiMethod(method: 'GET' | 'POST') {
        this.updateField('apiMethod', method);
        this.showApiMethodDropdown.set(false);
    }

    closeAllDropdowns() {
        this.showAccountDropdown.set(false);
        this.showDeliveryTypeDropdown.set(false);
        this.showTriggerDropdown.set(false);
        this.showWorkflowDropdown.set(false);
        this.showApiMethodDropdown.set(false);
    }
}
