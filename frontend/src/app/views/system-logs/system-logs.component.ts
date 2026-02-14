import { Component, OnInit, OnDestroy, signal, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { ICONS } from '../../shared/icons';
import { LogService } from '../../core/services';
import type { LogFile, LogLevel, ParsedLog } from '../../core/types';

@Component({
    selector: 'app-system-logs',
    imports: [LucideAngularModule, FormsModule],
    templateUrl: './system-logs.html',
    styleUrl: './system-logs.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemLogsComponent implements OnInit, OnDestroy {
    private readonly logService = inject(LogService);
    private refreshTimer?: ReturnType<typeof setInterval>;
    readonly icons = ICONS;

    // 模式：current=当前实时日志，history=历史日志
    mode = signal<'current' | 'history'>('current');

    // 筛选
    levelFilter = signal<LogLevel>('ALL');
    levels: LogLevel[] = ['ALL', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

    // 当前日志
    currentLogs = signal<ParsedLog[]>([]);
    currentFile = signal<string | null>(null);
    currentDate = signal<string | null>(null);

    // 历史日志
    dates = signal<string[]>([]);
    selectedDate = signal<string | null>(null);
    files = signal<LogFile[]>([]);
    selectedFile = signal<string | null>(null);
    historyLogs = signal<ParsedLog[]>([]);

    loading = signal(false);
    autoRefresh = signal(true);

    // 自定义下拉框状态
    showLevelDropdown = signal(false);
    showDateDropdown = signal(false);
    showFileDropdown = signal(false);

    displayLogs = computed(() => {
        return this.mode() === 'current' ? this.currentLogs() : this.historyLogs();
    });

    ngOnInit() {
        this.loadCurrentLog();
        this.loadDates();
        this.startAutoRefresh();
    }

    ngOnDestroy() {
        this.stopAutoRefresh();
    }

    private startAutoRefresh() {
        this.refreshTimer = setInterval(() => {
            if (this.autoRefresh() && this.mode() === 'current') {
                this.loadCurrentLog(true);
            }
        }, 3000);
    }

    private stopAutoRefresh() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
    }

    toggleAutoRefresh() {
        this.autoRefresh.set(!this.autoRefresh());
    }

    setMode(mode: 'current' | 'history') {
        this.mode.set(mode);
        if (mode === 'current') {
            this.loadCurrentLog();
        }
    }

    async loadCurrentLog(silent = false) {
        if (!silent) this.loading.set(true);
        try {
            const res = await this.logService.getCurrentLog(
                this.levelFilter() === 'ALL' ? undefined : this.levelFilter(),
                200
            );
            this.currentLogs.set(res.lines.map(l => this.parseLine(l)).reverse());
            this.currentFile.set(res.file || null);
            this.currentDate.set(res.date || null);
        } catch (e) {
            console.error('加载当前日志失败', e);
        } finally {
            if (!silent) this.loading.set(false);
        }
    }

    async loadDates() {
        try {
            const res = await this.logService.getLogDates();
            this.dates.set(res.dates);
        } catch (e) {
            console.error('加载日期列表失败', e);
        }
    }

    async selectDate(date: string) {
        this.selectedDate.set(date);
        this.selectedFile.set(null);
        this.historyLogs.set([]);
        this.loading.set(true);
        try {
            const res = await this.logService.getLogFiles(date);
            this.files.set(res.files);
        } catch (e) {
            console.error('加载文件列表失败', e);
        } finally {
            this.loading.set(false);
        }
    }

    async selectFile(file: string) {
        this.selectedFile.set(file);
        await this.loadHistoryLog();
    }

    async loadHistoryLog() {
        const date = this.selectedDate();
        const file = this.selectedFile();
        if (!date || !file) return;

        this.loading.set(true);
        try {
            const res = await this.logService.getLogContent(
                date, file,
                this.levelFilter() === 'ALL' ? undefined : this.levelFilter(),
                1000
            );
            this.historyLogs.set(res.lines.map((l: string) => this.parseLine(l)).reverse());
        } catch (e) {
            console.error('加载历史日志失败', e);
        } finally {
            this.loading.set(false);
        }
    }

    onLevelChange() {
        if (this.mode() === 'current') {
            this.loadCurrentLog();
        } else if (this.selectedFile()) {
            this.loadHistoryLog();
        }
    }

    refresh() {
        if (this.mode() === 'current') {
            this.loadCurrentLog();
        } else if (this.selectedFile()) {
            this.loadHistoryLog();
        }
    }

    private parseLine(line: string): ParsedLog {
        // 格式: 2025-12-23 22:34:38 | INFO  | Main         | 启动闲鱼...
        const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \| (\w+)\s*\| (\S+)\s*\| (.*)$/);
        if (match) {
            return {
                time: match[1],
                level: match[2].trim() as LogLevel,
                module: match[3].trim(),
                message: match[4],
                raw: line
            };
        }
        return { time: '', level: 'INFO', module: '', message: line, raw: line };
    }

    formatFileTime(filename: string): string {
        // 20251223_223438.log -> 22:34:38
        const match = filename.match(/_(\d{2})(\d{2})(\d{2})\.log$/);
        if (match) return `${match[1]}:${match[2]}:${match[3]}`;
        return filename;
    }

    formatFileSize(size: number): string {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }

    getLevelClass(level: string): string {
        switch (level) {
            case 'DEBUG': return 'text-base-content/50';
            case 'INFO': return 'text-info';
            case 'WARN': return 'text-warning';
            case 'ERROR': return 'text-error';
            default: return '';
        }
    }

    // 自定义下拉框方法
    getLevelLabel(level: LogLevel): string {
        return level === 'ALL' ? '全部等级' : level;
    }

    selectLevel(level: LogLevel) {
        this.levelFilter.set(level);
        this.showLevelDropdown.set(false);
        this.onLevelChange();
    }

    onSelectDate(date: string) {
        this.showDateDropdown.set(false);
        this.selectDate(date);
    }

    onSelectFile(file: string) {
        this.showFileDropdown.set(false);
        this.selectFile(file);
    }
}
