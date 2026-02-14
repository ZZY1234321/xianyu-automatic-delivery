import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { Workflow, WorkflowDefinition } from '../types';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    private http = inject(HttpService);

    getWorkflows() {
        return this.http.get<{ workflows: Workflow[] }>('/api/workflows');
    }

    getWorkflow(id: number) {
        return this.http.get<{ workflow: Workflow }>(`/api/workflows/${id}`);
    }

    createWorkflow(data: {
        name: string;
        description?: string;
        definition: WorkflowDefinition;
        isDefault?: boolean;
    }) {
        return this.http.post<{ success: boolean; id: number }>('/api/workflows', data);
    }

    updateWorkflow(id: number, data: Partial<{
        name: string;
        description: string;
        definition: WorkflowDefinition;
        isDefault: boolean;
        enabled: boolean;
    }>) {
        return this.http.put<{ success: boolean }>(`/api/workflows/${id}`, data);
    }

    deleteWorkflow(id: number) {
        return this.http.delete<{ success: boolean }>(`/api/workflows/${id}`);
    }

    setDefault(id: number) {
        return this.http.post<{ success: boolean }>(`/api/workflows/${id}/default`);
    }
}
