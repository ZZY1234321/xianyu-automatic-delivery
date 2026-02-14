import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

// 发货方式（对应后端 API）- 用于标记发货节点
export const DELIVERY_MODES = [
  { value: 'virtual', label: '虚拟发货', desc: '确认发货，适用于虚拟商品/无需物流' },
  { value: 'freeshipping', label: '免拼发货', desc: '免拼发货，适用于拼单商品直接发货' }
];

@Component({
  selector: 'app-delivery-node-config',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="text-xs text-base-content/50 bg-base-200 rounded p-2">
      <span class="font-medium">说明：</span>发送发货内容给买家，内容由自动发货规则配置决定（固定文本/库存/API取货）
    </div>
  `
})
export class DeliveryNodeConfigComponent {
  configChange = output<void>();
}
