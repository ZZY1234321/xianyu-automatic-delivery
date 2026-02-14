import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';

@Component({
    selector: 'app-error-notfound',
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './error-notfound.html',
    styleUrl: './error-notfound.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorNotfoundComponent {
    readonly icons = ICONS;
}
