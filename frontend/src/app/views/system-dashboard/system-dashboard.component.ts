import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { StatsCardComponent } from '../../components/stats-card/stats-card.component';
import { ICONS } from '../../shared/icons';
import { AccountService, WSPushService } from '../../core/services';
import type { Account, StatusResponse } from '../../core/types';

@Component({
  selector: 'app-system-dashboard',
  imports: [LucideAngularModule, StatsCardComponent],
  templateUrl: './system-dashboard.html',
  styleUrl: './system-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemDashboardComponent implements OnInit, OnDestroy {
  private accountService = inject(AccountService);
  private wsPushService = inject(WSPushService);
  private wsSubscription: Subscription | null = null;
  protected readonly icons = ICONS;

  accounts = signal<Account[]>([]);
  status = signal<StatusResponse | null>(null);
  loading = signal(false);

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
}
