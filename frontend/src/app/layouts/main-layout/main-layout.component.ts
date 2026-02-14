import { Component, OnInit, OnDestroy, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { DesktopLayoutComponent } from '../desktop-layout/desktop-layout.component';
import { MobileLayoutComponent } from '../mobile-layout/mobile-layout.component';
import { DialogComponent } from '../../shared/dialog';
import { AccountService, WSPushService, ThemeService } from '../../core/services';
import type { Account, StatusResponse } from '../../core/types';
import type { ViewType } from '../../components/sidebar/sidebar.component';

@Component({
    selector: 'app-main-layout',
    imports: [RouterOutlet, DesktopLayoutComponent, MobileLayoutComponent, DialogComponent],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent implements OnInit, OnDestroy {
    private readonly accountService = inject(AccountService);
    private readonly wsPushService = inject(WSPushService);
    private readonly router = inject(Router);
    private readonly themeService = inject(ThemeService);
    private wsSubscription: Subscription | null = null;

    currentView = signal<ViewType>('dashboard');
    accounts = signal<Account[]>([]);
    status = signal<StatusResponse | null>(null);
    loading = signal(false);
    sidebarCollapsed = signal(false);

    ngOnInit() {
        this.router.events
            .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
            .subscribe((event) => {
                const path = event.urlAfterRedirects.split('/')[1] || 'dashboard';
                this.currentView.set(path as ViewType);
            });

        const initialPath = this.router.url.split('/')[1] || 'dashboard';
        this.currentView.set(initialPath as ViewType);

        this.loadData();
        this.subscribeWS();
    }

    ngOnDestroy() {
        this.wsSubscription?.unsubscribe();
        this.wsPushService.unsubscribeAccounts();
    }

    private subscribeWS() {
        this.wsPushService.subscribeAccounts();
        this.wsSubscription = this.wsPushService.accounts$.subscribe((data) => {
            this.accounts.set(data.accounts);
            this.status.update(s => ({
                clients: data.clients,
                activeCount: s?.activeCount ?? 0,
                messageCount: s?.messageCount ?? 0
            }));
        });
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

    onViewChange(view: ViewType) {
        this.currentView.set(view);
        this.router.navigate([`/${view}`]);
    }

    onSidebarCollapsed(collapsed: boolean) {
        this.sidebarCollapsed.set(collapsed);
    }
}
