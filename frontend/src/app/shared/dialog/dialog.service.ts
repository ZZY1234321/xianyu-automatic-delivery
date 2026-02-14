import { Injectable, signal } from '@angular/core';

export interface DialogConfig {
    title: string;
    message: string;
    type?: 'confirm' | 'alert';
    confirmText?: string;
    cancelText?: string;
    html?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
    readonly visible = signal(false);
    readonly config = signal<DialogConfig | null>(null);

    private resolvePromise: ((value: boolean) => void) | null = null;

    confirm(title: string, message: string, confirmText = '确定', cancelText = '取消'): Promise<boolean> {
        return this.open({ title, message, type: 'confirm', confirmText, cancelText });
    }

    confirmHtml(title: string, message: string, confirmText = '确定', cancelText = '取消'): Promise<boolean> {
        return this.open({ title, message, type: 'confirm', confirmText, cancelText, html: true });
    }

    alert(title: string, message: string, confirmText = '确定'): Promise<boolean> {
        return this.open({ title, message, type: 'alert', confirmText });
    }

    private open(config: DialogConfig): Promise<boolean> {
        this.config.set(config);
        this.visible.set(true);
        return new Promise(resolve => {
            this.resolvePromise = resolve;
        });
    }

    close(result: boolean) {
        this.visible.set(false);
        this.config.set(null);
        this.resolvePromise?.(result);
        this.resolvePromise = null;
    }
}
