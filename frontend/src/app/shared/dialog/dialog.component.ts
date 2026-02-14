import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { DialogService } from './dialog.service';
import { ICONS } from '../icons';

@Component({
    selector: 'app-dialog',
    imports: [LucideAngularModule],
    template: `
        @if (dialogService.visible()) {
        <div class="modal modal-open">
            <div class="modal-box">
                <h3 class="font-bold text-lg">{{ dialogService.config()?.title }}</h3>
                @if (dialogService.config()?.html) {
                <div class="py-4" [innerHTML]="dialogService.config()?.message"></div>
                } @else {
                <p class="py-4 whitespace-pre-wrap">{{ dialogService.config()?.message }}</p>
                }
                <div class="modal-action">
                    @if (dialogService.config()?.type === 'confirm') {
                    <button class="btn btn-ghost" (click)="dialogService.close(false)">
                        {{ dialogService.config()?.cancelText }}
                    </button>
                    }
                    <button class="btn btn-primary" (click)="dialogService.close(true)">
                        {{ dialogService.config()?.confirmText }}
                    </button>
                </div>
            </div>
            <div class="modal-backdrop" (click)="onBackdropClick()"></div>
        </div>
        }
    `,
    styles: [`
        .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: -1;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogComponent {
    readonly dialogService = inject(DialogService);
    readonly icons = ICONS;

    onBackdropClick() {
        if (this.dialogService.config()?.type === 'alert') {
            this.dialogService.close(true);
        } else {
            this.dialogService.close(false);
        }
    }
}
