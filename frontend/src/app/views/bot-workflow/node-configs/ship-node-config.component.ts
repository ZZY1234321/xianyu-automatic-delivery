import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

// 发货方式（对应后端 API）
export const SHIP_MODES = [
    { value: 'virtual', label: '虚拟发货', desc: '调用 confirmShipment API' },
    { value: 'freeshipping', label: '免拼发货', desc: '调用 freeShipping API' }
];

@Component({
    selector: 'app-ship-node-config',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">发货方式</span></label>
      <select class="select select-bordered select-sm"
        [ngModel]="deliveryMode()"
        (ngModelChange)="deliveryModeChange.emit($event)"
        (blur)="configChange.emit()">
        @for (mode of shipModes; track mode.value) {
          <option [value]="mode.value">{{ mode.label }}</option>
        }
      </select>
      <label class="label py-0">
        <span class="label-text-alt text-xs text-base-content/50">
          @if (deliveryMode() === 'virtual') {
            确认发货，适用于虚拟商品/无需物流
          } @else {
            免拼发货，适用于拼单商品直接发货
          }
        </span>
      </label>
    </div>
  `
})
export class ShipNodeConfigComponent {
    deliveryMode = input.required<string>();

    deliveryModeChange = output<string>();
    configChange = output<void>();

    readonly shipModes = SHIP_MODES;
}
