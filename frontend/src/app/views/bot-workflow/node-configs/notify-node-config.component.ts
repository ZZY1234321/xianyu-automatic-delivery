import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-notify-node-config',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">通知消息</span></label>
      <textarea class="textarea textarea-bordered textarea-sm h-16"
        [ngModel]="message()"
        (ngModelChange)="messageChange.emit($event)"
        (blur)="configChange.emit()"
        placeholder="输入通知内容"></textarea>
    </div>
  `
})
export class NotifyNodeConfigComponent {
    message = input.required<string>();
    messageChange = output<string>();
    configChange = output<void>();
}
