import { Component, ChangeDetectionStrategy, signal, input, output, computed } from '@angular/core';

import { SidebarComponent, ViewType } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';

export type { ViewType } from '../../components/sidebar/sidebar.component';

@Component({
    selector: 'app-desktop-layout',
    imports: [SidebarComponent, TopbarComponent],
    templateUrl: './desktop-layout.html',
    styleUrl: './desktop-layout.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopLayoutComponent {
    currentView = input.required<ViewType>();
    activeCount = input<number>(0);
    messageCount = input<number>(0);

    viewChange = output<ViewType>();
    sidebarCollapsedChange = output<boolean>();

    sidebarCollapsed = signal(false);

    pageTitle = computed(() => {
        const titles: Record<ViewType, string> = {
            dashboard: '仪表盘',
            accounts: '账号管理',
            goods: '商品管理',
            orders: '订单管理',
            autoreply: '自动回复',
            autosell: '自动发货',
            workflow: '发货流程',
            conversations: '对话消息',
            logs: '系统日志',
            setting: '系统设置'
        };
        return titles[this.currentView()] || '';
    });

    onViewChange(view: ViewType) {
        this.viewChange.emit(view);
    }

    onSidebarCollapse(collapsed: boolean) {
        this.sidebarCollapsed.set(collapsed);
        this.sidebarCollapsedChange.emit(collapsed);
    }
}
