import { Component, input, output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DELAY_MODES, TIME_UNITS } from './node-config.types';

@Component({
    selector: 'app-delay-node-config',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">延迟模式</span></label>
      <select class="select select-bordered select-sm"
        [ngModel]="delayMode()"
        (ngModelChange)="delayModeChange.emit($event)"
        (blur)="configChange.emit()">
        @for (mode of delayModes; track mode.value) {
          <option [value]="mode.value">{{ mode.label }}</option>
        }
      </select>
    </div>

    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">时间单位</span></label>
      <select class="select select-bordered select-sm"
        [ngModel]="delayUnit()"
        (ngModelChange)="delayUnitChange.emit($event)"
        (blur)="configChange.emit()">
        @for (unit of timeUnits; track unit.value) {
          <option [value]="unit.value">{{ unit.label }}</option>
        }
      </select>
    </div>

    @if (delayMode() === 'fixed') {
      <div class="form-control">
        <label class="label py-1">
          <span class="label-text text-xs">延迟时间（{{ unitLabel() }}）</span>
        </label>
        <input type="number" class="input input-bordered input-sm" min="0"
          [ngModel]="displayValue()"
          (ngModelChange)="onDelayMsChange($event)"
          (blur)="configChange.emit()" />
      </div>
    } @else {
      <div class="form-control">
        <label class="label py-1">
          <span class="label-text text-xs">最短时间（{{ unitLabel() }}）</span>
        </label>
        <input type="number" class="input input-bordered input-sm" min="0"
          [ngModel]="displayMinValue()"
          (ngModelChange)="onDelayMinMsChange($event)"
          (blur)="configChange.emit()"
          placeholder="可选，默认0" />
      </div>
      <div class="form-control">
        <label class="label py-1">
          <span class="label-text text-xs">最长时间（{{ unitLabel() }}）</span>
        </label>
        <input type="number" class="input input-bordered input-sm" min="1"
          [ngModel]="displayMaxValue()"
          (ngModelChange)="onDelayMaxMsChange($event)"
          (blur)="configChange.emit()" />
      </div>
      <div class="text-xs text-base-content/50 mt-1">
        将在 {{ displayMinValue() || 0 }} ~ {{ displayMaxValue() }} {{ unitLabel() }}之间随机延迟
      </div>
    }
  `
})
export class DelayNodeConfigComponent {
    delayMs = input.required<number>();
    delayMode = input.required<string>();
    delayMinMs = input.required<number>();
    delayMaxMs = input.required<number>();
    delayUnit = input.required<string>();

    delayMsChange = output<number>();
    delayModeChange = output<string>();
    delayMinMsChange = output<number>();
    delayMaxMsChange = output<number>();
    delayUnitChange = output<string>();
    configChange = output<void>();

    readonly delayModes = DELAY_MODES;
    readonly timeUnits = TIME_UNITS;

    unitLabel = computed(() => this.delayUnit() === 's' ? '秒' : '毫秒');
    factor = computed(() => this.delayUnit() === 's' ? 1000 : 1);

    displayValue = computed(() => this.delayMs() / this.factor());
    displayMinValue = computed(() => this.delayMinMs() / this.factor());
    displayMaxValue = computed(() => this.delayMaxMs() / this.factor());

    onDelayMsChange(value: number) {
        this.delayMsChange.emit(value * this.factor());
    }

    onDelayMinMsChange(value: number) {
        this.delayMinMsChange.emit(value * this.factor());
    }

    onDelayMaxMsChange(value: number) {
        this.delayMaxMsChange.emit(value * this.factor());
    }
}
