import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { ICONS } from '../../shared/icons';
import { DialogService } from '../../shared/dialog';
import { AccountService, WSPushService } from '../../core/services';
import type { Account, StatusResponse } from '../../core/types';

@Component({
  selector: 'app-goofish-accounts',
  imports: [FormsModule, LucideAngularModule],
  templateUrl: './goofish-accounts.html',
  styleUrl: './goofish-accounts.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoofishAccountsComponent implements OnInit, OnDestroy {
  private accountService = inject(AccountService);
  private wsPushService = inject(WSPushService);
  private dialog = inject(DialogService);
  private wsSubscription: Subscription | null = null;
  protected readonly icons = ICONS;

  accounts = signal<Account[]>([]);
  status = signal<StatusResponse | null>(null);
  loading = signal(false);

  form = { cookies: '', remark: '' };
  editingId = signal<string | null>(null);
  submitting = signal(false);
  refreshingId = signal<string | null>(null);
  error = signal('');
  success = signal('');

  ngOnInit() {
    this.loadData();
    // 只订阅 Subject，不创建新的 WebSocket 连接（app.component 已创建）
    this.wsSubscription = this.wsPushService.accounts$.subscribe((data) => {
      this.accounts.set(data.accounts);
      this.status.update(s => ({
        clients: data.clients,
        activeCount: s?.activeCount ?? 0,
        messageCount: s?.messageCount ?? 0
      }));
    });
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
  }

  async loadData() {
    this.loading.set(true);
    try {
      const [accountsRes, statusRes] = await Promise.all([
        this.accountService.getAccounts(),
        this.accountService.getStatus()
      ]);
      this.accounts.set(accountsRes.accounts);
      this.status.set(statusRes);
    } catch (e) {
      console.error('加载失败', e);
    } finally {
      this.loading.set(false);
    }
  }

  isConnected(accountId: string): boolean {
    return this.status()?.clients.some((c) => c.accountId === accountId && c.connected) ?? false;
  }

  formatTime(time?: string): string {
    return time ? new Date(time).toLocaleString() : '-';
  }

  async onRefreshInfo(id: string) {
    this.refreshingId.set(id);
    try {
      const res = await this.accountService.refreshAccountInfo(id);
      if (res.success) {
        await this.loadData();
      }
    } catch (e) {
      console.error('刷新用户信息失败', e);
    } finally {
      this.refreshingId.set(null);
    }
  }

  onEdit(account: Account) {
    this.editingId.set(account.id);
    this.form = { cookies: '', remark: account.remark || '' };
    this.error.set('');
    this.success.set('');
  }

  cancelEdit() {
    this.editingId.set(null);
    this.form = { cookies: '', remark: '' };
    this.error.set('');
  }

  async handleSubmit() {
    if (!this.editingId() && !this.form.cookies.trim()) {
      this.error.set('请填写Cookies');
      return;
    }

    this.error.set('');
    this.submitting.set(true);

    try {
      const res = await this.accountService.addAccount({
        id: this.editingId() || undefined,
        cookies: this.form.cookies.trim() || undefined,
        remark: this.form.remark.trim() || undefined
      });

      if (res.success) {
        this.success.set(this.editingId() ? '保存成功！' : '添加成功！');
        this.form = { cookies: '', remark: '' };
        this.editingId.set(null);
        await this.loadData();
        setTimeout(() => this.success.set(''), 1500);
      } else {
        this.error.set(res.error || '操作失败');
      }
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : '操作失败');
    } finally {
      this.submitting.set(false);
    }
  }

  async onStart(id: string) {
    await this.accountService.startAccount(id);
    await this.loadData();
  }

  async onStop(id: string) {
    await this.accountService.stopAccount(id);
    await this.loadData();
  }

  async onDelete(id: string) {
    const confirmed = await this.dialog.confirm('删除账号', `确定删除账号 ${id}？`);
    if (confirmed) {
      await this.accountService.deleteAccount(id);
      await this.loadData();
    }
  }
}
