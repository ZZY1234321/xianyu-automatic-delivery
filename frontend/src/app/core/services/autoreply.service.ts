import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { AutoReplyRule } from '../types';

@Injectable({ providedIn: 'root' })
export class AutoReplyService {
    private http = inject(HttpService);

    getRules() {
        return this.http.get<{ rules: AutoReplyRule[] }>('/api/autoreply');
    }

    createRule(rule: Partial<AutoReplyRule>) {
        return this.http.post<{ success: boolean; id?: number }>('/api/autoreply', rule);
    }

    updateRule(id: number, rule: Partial<AutoReplyRule>) {
        return this.http.put<{ success: boolean }>(`/api/autoreply/${id}`, rule);
    }

    deleteRule(id: number) {
        return this.http.delete<{ success: boolean }>(`/api/autoreply/${id}`);
    }

    toggleRule(id: number) {
        return this.http.post<{ success: boolean }>(`/api/autoreply/${id}/toggle`);
    }
}
