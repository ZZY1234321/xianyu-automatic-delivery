import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../shared/icons';

@Component({
    selector: 'app-error-forbidden',
    imports: [RouterLink, LucideAngularModule],
    templateUrl: './error-forbidden.html',
    styleUrl: './error-forbidden.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorForbiddenComponent {
    readonly icons = ICONS;
}
