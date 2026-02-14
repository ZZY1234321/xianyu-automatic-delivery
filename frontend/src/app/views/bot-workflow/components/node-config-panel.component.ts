import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  NODE_TYPES, NodeConfigData,
  ConditionNodeConfigComponent,
  DelayNodeConfigComponent,
  AutoreplyNodeConfigComponent,
  NotifyNodeConfigComponent,
  DeliveryNodeConfigComponent,
  ShipNodeConfigComponent
} from '../node-configs';

@Component({
  selector: 'app-node-config-panel',
  standalone: true,
  imports: [
    FormsModule,
    ConditionNodeConfigComponent,
    DelayNodeConfigComponent,
    AutoreplyNodeConfigComponent,
    NotifyNodeConfigComponent,
    DeliveryNodeConfigComponent,
    ShipNodeConfigComponent
  ],
  template: `
    <div class="absolute top-3 right-3 w-64 max-h-[calc(100%-6rem)] bg-base-100/95 backdrop-blur
      border border-base-300 rounded-lg shadow-lg z-10 overflow-hidden flex flex-col">
      <div class="flex items-center justify-between p-3 border-b border-base-300">
        <span class="font-medium text-sm flex items-center gap-2">
          <span class="w-3 h-3 rounded-full"
            [style.backgroundColor]="getNodeTypeColor(config().nodeType)"></span>
          节点配置
        </span>
      </div>

      <div class="p-3 space-y-3 overflow-y-auto flex-1">
        <!-- 节点名称 -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">节点名称</span></label>
          <input type="text" class="input input-bordered input-sm"
            [ngModel]="config().text"
            (ngModelChange)="updateField('text', $event)"
            (blur)="configChange.emit()" />
        </div>

        <!-- 节点类型 -->
        <div class="form-control">
          <label class="label py-1"><span class="label-text text-xs">节点类型</span></label>
          <select class="select select-bordered select-sm"
            [ngModel]="config().nodeType"
            (ngModelChange)="onNodeTypeChange($event)">
            <option value="trigger">触发</option>
            <option value="condition">条件判断</option>
            <option value="delivery">发货</option>
            <option value="ship">标记发货</option>
            <option value="delay">延迟</option>
            <option value="autoreply">等待回复</option>
            <option value="notify">通知</option>
          </select>
        </div>

        <!-- 发货节点 -->
        @if (config().nodeType === 'delivery') {
          <app-delivery-node-config (configChange)="configChange.emit()" />
        }

        <!-- 标记发货节点 -->
        @if (config().nodeType === 'ship') {
          <app-ship-node-config
            [deliveryMode]="config().deliveryMode"
            (deliveryModeChange)="updateField('deliveryMode', $event)"
            (configChange)="configChange.emit()" />
        }

        <!-- 条件节点 -->
        @if (config().nodeType === 'condition') {
          <app-condition-node-config
            [expression]="config().expression"
            (expressionChange)="updateField('expression', $event)"
            (configChange)="configChange.emit()" />
        }

        <!-- 延迟节点 -->
        @if (config().nodeType === 'delay') {
          <app-delay-node-config
            [delayMs]="config().delayMs"
            [delayMode]="config().delayMode"
            [delayMinMs]="config().delayMinMs"
            [delayMaxMs]="config().delayMaxMs"
            [delayUnit]="config().delayUnit"
            (delayMsChange)="updateField('delayMs', $event)"
            (delayModeChange)="updateField('delayMode', $event)"
            (delayMinMsChange)="updateField('delayMinMs', $event)"
            (delayMaxMsChange)="updateField('delayMaxMs', $event)"
            (delayUnitChange)="updateField('delayUnit', $event)"
            (configChange)="configChange.emit()" />
        }

        <!-- 等待回复节点 -->
        @if (config().nodeType === 'autoreply') {
          <app-autoreply-node-config
            [promptMessage]="config().promptMessage"
            [keywords]="config().keywords"
            [matchMode]="config().matchMode"
            (promptMessageChange)="updateField('promptMessage', $event)"
            (keywordsChange)="updateField('keywords', $event)"
            (matchModeChange)="updateField('matchMode', $event)"
            (configChange)="configChange.emit()" />
        }

        <!-- 通知节点 -->
        @if (config().nodeType === 'notify') {
          <app-notify-node-config
            [message]="config().message"
            (messageChange)="updateField('message', $event)"
            (configChange)="configChange.emit()" />
        }
      </div>
    </div>
  `
})
export class NodeConfigPanelComponent {
  config = input.required<NodeConfigData>();

  configChange = output<void>();
  fieldChange = output<{ field: keyof NodeConfigData; value: any }>();
  nodeTypeChange = output<string>();

  getNodeTypeColor(type: string): string {
    return NODE_TYPES[type as keyof typeof NODE_TYPES]?.color || '#6b7280';
  }

  updateField(field: keyof NodeConfigData, value: any) {
    this.fieldChange.emit({ field, value });
  }

  onNodeTypeChange(value: string) {
    this.nodeTypeChange.emit(value);
  }
}
