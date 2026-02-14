/**
 * 日志相关类型定义
 */

export type LogLevel = 'ALL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface ParsedLog {
    time: string;
    level: LogLevel;
    module: string;
    message: string;
    raw: string;
}

export interface LogFile {
    name: string;
    size: number;
    mtime: number;
}

export interface LogContentResponse {
    lines: string[];
    total: number;
    filtered?: boolean;
    file?: string;
    date?: string;
}
