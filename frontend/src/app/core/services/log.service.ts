import { Injectable, inject } from '@angular/core';

import { HttpService } from '../utils';
import type { LogFile, LogContentResponse } from '../types';

@Injectable({ providedIn: 'root' })
export class LogService {
    private http = inject(HttpService);

    getLogDates() {
        return this.http.get<{ dates: string[] }>('/api/logs/dates');
    }

    getLogFiles(date: string) {
        return this.http.get<{ files: LogFile[] }>(`/api/logs/files/${date}`);
    }

    getLogContent(date: string, file: string, level?: string, limit = 500) {
        return this.http.get<LogContentResponse>(`/api/logs/content/${date}/${file}`, { level, limit });
    }

    getCurrentLog(level?: string, limit = 100) {
        return this.http.get<LogContentResponse>('/api/logs/current', { level, limit });
    }
}
