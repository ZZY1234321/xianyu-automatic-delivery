import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONDITION_TEMPLATES } from './node-config.types';

@Component({
    selector: 'app-condition-node-config',
    standalone: true,
    imports: [FormsModule],
    template: `
    <div class="form-control">
      <label class="label py-1"><span class="label-text text-xs">条件表达式</span></label>
      <textarea class="textarea textarea-bordered textarea-sm h-16"
        [ngModel]="expression()"
        (ngModelChange)="expressionChange.emit($event)"
        (blur)="configChange.emit()"
        placeholder="例如: order.price > 100"></textarea>
      <div class="mt-2">
        <span class="text-xs text-base-content/60">快速插入：</span>
        <div class="flex flex-wrap gap-1 mt-1">
          @for (tpl of templates; track tpl.label) {
            <button class="btn btn-xs btn-ghost" (click)="insertTemplate(tpl)">
              {{ tpl.label }}
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class ConditionNodeConfigComponent {
    expression = input.required<string>();
    expressionChange = output<string>();
    configChange = output<void>();

    readonly templates = CONDITION_TEMPLATES;

    insertTemplate(template: typeof CONDITION_TEMPLATES[0]) {
        let expr = template.expr;
        if (template.ops.length > 0) {
            expr = `${template.expr} ${template.ops[0]} `;
        }
        this.expressionChange.emit(expr);
    }
}
