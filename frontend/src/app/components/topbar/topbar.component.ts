import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';

@Component({
    selector: 'app-topbar',
    imports: [LucideAngularModule],
    templateUrl: './topbar.html',
    styleUrl: './topbar.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent {
    protected readonly icons = ICONS;

    title = input<string>('');
    sidebarCollapsed = input<boolean>(false);
    activeCount = input<number>(0);
    messageCount = input<number>(0);
}
