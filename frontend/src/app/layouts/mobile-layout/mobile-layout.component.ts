import { Component, ChangeDetectionStrategy, signal, input, output, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';
import type { ViewType } from '../../components/sidebar/sidebar.component';

@Component({
    selector: 'app-mobile-layout',
    imports: [LucideAngularModule, RouterLink, RouterLinkActive],
    templateUrl: './mobile-layout.html',
    styleUrl: './mobile-layout.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileLayoutComponent {
    protected readonly icons = ICONS;

    currentView = input.required<ViewType>();
    activeCount = input<number>(0);
    messageCount = input<number>(0);

    viewChange = output<ViewType>();

    drawerOpen = signal(false);

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

    toggleDrawer() {
        this.drawerOpen.set(!this.drawerOpen());
    }

    closeDrawer() {
        this.drawerOpen.set(false);
    }

    setView(view: ViewType) {
        this.viewChange.emit(view);
        this.closeDrawer();
    }
}
