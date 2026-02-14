import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MATCH_MODES } from './node-config.types';

@Component({
    selector: 'app-autoreply-node-config',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">发送消息</span></label>
      <textarea class="textarea textarea-bordered textarea-sm h-16"
        [ngModel]="promptMessage()"
        (ngModelChange)="promptMessageChange.emit($event)"
        (blur)="configChange.emit()"
        placeholder="发送给买家的确认消息，如：请回复「确认」继续发货"></textarea>
    </div>
    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">确认关键词（逗号分隔）</span></label>
      <input type="text" class="input input-bordered input-sm"
        [ngModel]="keywords()"
        (ngModelChange)="keywordsChange.emit($event)"
        (blur)="configChange.emit()"
        placeholder="确认,同意,好的,收到" />
    </div>
    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">匹配模式</span></label>
      <select class="select select-bordered select-sm"
        [ngModel]="matchMode()"
        (ngModelChange)="matchModeChange.emit($event)"
        (blur)="configChange.emit()">
        @for (mode of matchModes; track mode.value) {
          <option [value]="mode.value">{{ mode.label }}</option>
        }
      </select>
      <label class="label py-0">
        <span class="label-text-alt text-xs text-base-content/50">
          @if (matchMode() === 'exact') {
            回复内容必须完全等于关键词
          } @else {
            回复内容包含关键词即可
          }
        </span>
      </label>
    </div>
  `
})
export class AutoreplyNodeConfigComponent {
    promptMessage = input.required<string>();
    keywords = input.required<string>();
    matchMode = input.required<string>();

    promptMessageChange = output<string>();
    keywordsChange = output<string>();
    matchModeChange = output<string>();
    configChange = output<void>();

    readonly matchModes = MATCH_MODES;
}
