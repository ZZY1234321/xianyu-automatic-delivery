import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { ICONS } from '../../../shared/icons';
import type { Workflow } from '../../../core/types';

@Component({
    selector: 'app-workflow-list',
    standalone: true,
    imports: [LucideAngularModule, DatePipe],
    template: `
    @if (loading()) {
      <div class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    } @else if (workflows().length === 0) {
      <div class="text-center py-16 text-base-content/50">
        <lucide-angular [img]="icons.GitBranch" class="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p class="text-lg">暂无发货流程</p>
        <p class="text-sm mt-2">点击上方按钮创建第一个流程</p>
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        @for (workflow of workflows(); track workflow.id) {
          <div class="card bg-base-100 shadow hover:shadow-md transition-shadow">
            <div class="card-body p-4">
              <div class="flex items-center gap-2">
                <lucide-angular [img]="icons.GitBranch" class="w-5 h-5 text-primary" />
                <h3 class="font-semibold truncate flex-1">{{ workflow.name }}</h3>
                @if (workflow.isDefault) {
                  <span class="badge badge-primary badge-sm">默认</span>
                }
              </div>
              @if (workflow.description) {
                <p class="text-sm text-base-content/60 line-clamp-2">{{ workflow.description }}</p>
              }
              <div class="flex items-center gap-4 mt-2 text-xs text-base-content/50">
                <span class="flex items-center gap-1">
                  <lucide-angular [img]="icons.Box" class="w-3.5 h-3.5" />
                  {{ getNodeCount(workflow) }} 节点
                </span>
                <span class="flex items-center gap-1">
                  <lucide-angular [img]="icons.Clock" class="w-3.5 h-3.5" />
                  {{ workflow.updatedAt | date:'MM-dd HH:mm' }}
                </span>
              </div>
              <div class="card-actions justify-end mt-2">
                <button class="btn btn-ghost btn-sm gap-1" (click)="edit.emit(workflow)">
                  <lucide-angular [img]="icons.Pencil" class="w-3.5 h-3.5" />
                  编辑
                </button>
                @if (!workflow.isDefault) {
                  <button class="btn btn-error btn-sm gap-1" (click)="delete.emit(workflow)">
                    <lucide-angular [img]="icons.Trash2" class="w-3.5 h-3.5" />
                    删除
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class WorkflowListComponent {
    workflows = input.required<Workflow[]>();
    loading = input.required<boolean>();

    edit = output<Workflow>();
    delete = output<Workflow>();

    readonly icons = ICONS;

    getNodeCount(workflow: Workflow): number {
        return workflow.definition?.nodes?.length || 0;
    }
}
