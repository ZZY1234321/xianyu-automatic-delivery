import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';
import { DialogService } from '../../shared/dialog';
import { AutoReplyService, SettingsService } from '../../core/services';
import type { AutoReplyRule, MatchType } from '../../core/types';

@Component({
    selector: 'app-bot-autoreply',
    imports: [LucideAngularModule, FormsModule],
    templateUrl: './bot-autoreply.html',
    styleUrl: './bot-autoreply.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BotAutoreplyComponent implements OnInit {
    private readonly autoReplyService = inject(AutoReplyService);
    private readonly settingsService = inject(SettingsService);
    private readonly dialog = inject(DialogService);
    readonly icons = ICONS;

    rules = signal<AutoReplyRule[]>([]);
    loading = signal(false);
    saving = signal(false);
    editingRule = signal<AutoReplyRule | null>(null);
    globalPrompt = signal('');

    formData = signal({
        name: '',
        enabled: true,
        priority: 0,
        matchType: 'exact' as MatchType,
        matchPattern: '',
        replyContent: '',
        accountId: null as string | null,
        excludeMatch: false
    });

    matchTypes = [
        { value: 'exact', label: '精确匹配' },
        { value: 'contains', label: '包含关��词' },
        { value: 'regex', label: '正则表达式' },
        { value: 'ai', label: 'AI 回复' }
    ];

    // 自定义下拉框状态
    showMatchTypeDropdown = signal(false);

    ngOnInit() {
        this.loadRules();
        this.loadGlobalPrompt();
    }

    async loadGlobalPrompt() {
        try {
            const settings = await this.settingsService.getAISettings();
            this.globalPrompt.set(settings.systemPrompt || '');
        } catch (e) {
            console.error('加载全局提示词失败', e);
        }
    }

    async loadRules() {
        this.loading.set(true);
        try {
            const res = await this.autoReplyService.getRules();
            this.rules.set(res.rules);
        } catch (e) {
            console.error('加载规则失败', e);
        } finally {
            this.loading.set(false);
        }
    }

    onEdit(rule: AutoReplyRule) {
        this.editingRule.set(rule);
        this.formData.set({
            name: rule.name,
            enabled: rule.enabled,
            priority: rule.priority,
            matchType: rule.matchType,
            matchPattern: rule.matchPattern,
            replyContent: rule.replyContent,
            accountId: rule.accountId,
            excludeMatch: rule.excludeMatch
        });
    }

    cancelEdit() {
        this.editingRule.set(null);
        this.resetForm();
    }

    resetForm() {
        this.formData.set({
            name: '',
            enabled: true,
            priority: 0,
            matchType: 'exact',
            matchPattern: '',
            replyContent: '',
            accountId: null,
            excludeMatch: false
        });
    }

    async saveRule() {
        const data = this.formData();
        if (!data.name) return;
        // 排除匹配规则不需要匹配内容，AI 类型也不需要强制填写
        if (!data.excludeMatch && data.matchType !== 'ai' && (!data.matchPattern || !data.replyContent)) return;

        this.saving.set(true);
        try {
            const editing = this.editingRule();
            if (editing) {
                await this.autoReplyService.updateRule(editing.id, data);
            } else {
                await this.autoReplyService.createRule(data);
            }
            this.cancelEdit();
            await this.loadRules();
        } catch (e) {
            console.error('保存规则失败', e);
        } finally {
            this.saving.set(false);
        }
    }

    async toggleRule(rule: AutoReplyRule) {
        try {
            await this.autoReplyService.toggleRule(rule.id);
            await this.loadRules();
        } catch (e) {
            console.error('切换规则状态失败', e);
        }
    }

    async deleteRule(rule: AutoReplyRule) {
        const confirmed = await this.dialog.confirm('删除规则', `确定删除规则 "${rule.name}" 吗？`);
        if (!confirmed) return;
        try {
            await this.autoReplyService.deleteRule(rule.id);
            if (this.editingRule()?.id === rule.id) {
                this.cancelEdit();
            }
            await this.loadRules();
        } catch (e) {
            console.error('删除规则失败', e);
        }
    }

    getMatchTypeName(type: string): string {
        return this.matchTypes.find(t => t.value === type)?.label || type;
    }

    updateFormField(field: string, value: any) {
        this.formData.update(f => ({ ...f, [field]: value }));
    }

    // 自定义下拉框方法
    selectMatchType(value: string) {
        this.updateFormField('matchType', value);
        this.showMatchTypeDropdown.set(false);
    }
}
