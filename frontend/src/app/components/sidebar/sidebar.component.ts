import { Component, ChangeDetectionStrategy, signal, input, output, effect, inject, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';

export type ViewType =
    | 'dashboard'
    | 'accounts'
    | 'goods'
    | 'orders'
    | 'autoreply'
    | 'autosell'
    | 'workflow'
    | 'conversations'
    | 'logs'
    | 'setting';

const STORAGE_KEY = 'sidebar_collapsed';

@Component({
    selector: 'app-sidebar',
    imports: [LucideAngularModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
    protected readonly icons = ICONS;
    private router = inject(Router);

    currentView = input.required<ViewType>();
    viewChange = output<ViewType>();
    collapsedChange = output<boolean>();

    collapsed = signal(this.loadCollapsedState());

    constructor() {
        effect(() => {
            const isCollapsed = this.collapsed();
            this.collapsedChange.emit(isCollapsed);
            this.saveCollapsedState(isCollapsed);
        });
    }

    private loadCollapsedState(): boolean {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    }

    private saveCollapsedState(collapsed: boolean): void {
        try {
            localStorage.setItem(STORAGE_KEY, String(collapsed));
        } catch {
            // ignore
        }
    }

    toggleCollapse() {
        this.collapsed.set(!this.collapsed());
    }

    setView(view: ViewType) {
        this.viewChange.emit(view);
    }
}
