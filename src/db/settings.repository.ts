/**
 * 系统设置数据仓库
 */

import { db } from './connection.js'

interface DbSetting {
    key: string
    value: string
    updated_at: string
}

// 获取设置值
export function getSetting(key: string): string | null {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?')
    const row = stmt.get(key) as DbSetting | undefined
    return row?.value ?? null
}

// 设置值
export function setSetting(key: string, value: string): void {
    const stmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `)
    stmt.run(key, value, value)
}

// 删除设置
export function deleteSetting(key: string): boolean {
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?')
    const result = stmt.run(key)
    return result.changes > 0
}

// 获取多个设置
export function getSettings(keys: string[]): Record<string, string | null> {
    const result: Record<string, string | null> = {}
    for (const key of keys) {
        result[key] = getSetting(key)
    }
    return result
}

// AI 设置相关 key
export const AI_SETTINGS_KEYS = {
    BASE_URL: 'ai_base_url',
    API_KEY: 'ai_api_key',
    MODEL: 'ai_model',
    SYSTEM_PROMPT: 'ai_system_prompt'
}

// 自动评价设置相关 key
export const AUTO_RATE_SETTINGS_KEYS = {
    ENABLED: 'auto_rate_enabled',
    RATE_CONTENT: 'auto_rate_content',
    RATE_SCORE: 'auto_rate_score'
}

// 获取 AI 设置
export function getAISettings() {
    return {
        baseUrl: getSetting(AI_SETTINGS_KEYS.BASE_URL) || '',
        apiKey: getSetting(AI_SETTINGS_KEYS.API_KEY) || '',
        model: getSetting(AI_SETTINGS_KEYS.MODEL) || 'gpt-3.5-turbo',
        systemPrompt: getSetting(AI_SETTINGS_KEYS.SYSTEM_PROMPT) || ''
    }
}

// 保存 AI 设置
export function saveAISettings(settings: {
    baseUrl?: string
    apiKey?: string
    model?: string
    systemPrompt?: string
}) {
    if (settings.baseUrl !== undefined) {
        setSetting(AI_SETTINGS_KEYS.BASE_URL, settings.baseUrl)
    }
    if (settings.apiKey !== undefined) {
        setSetting(AI_SETTINGS_KEYS.API_KEY, settings.apiKey)
    }
    if (settings.model !== undefined) {
        setSetting(AI_SETTINGS_KEYS.MODEL, settings.model)
    }
    if (settings.systemPrompt !== undefined) {
        setSetting(AI_SETTINGS_KEYS.SYSTEM_PROMPT, settings.systemPrompt)
    }
}

// 获取自动评价设置
export function getAutoRateSettings() {
    return {
        enabled: getSetting(AUTO_RATE_SETTINGS_KEYS.ENABLED) === 'true',
        rateContent: getSetting(AUTO_RATE_SETTINGS_KEYS.RATE_CONTENT) || '好评',
        rateScore: parseInt(getSetting(AUTO_RATE_SETTINGS_KEYS.RATE_SCORE) || '5', 10)
    }
}

// 保存自动评价设置
export function saveAutoRateSettings(settings: {
    enabled?: boolean
    rateContent?: string
    rateScore?: number
}) {
    if (settings.enabled !== undefined) {
        setSetting(AUTO_RATE_SETTINGS_KEYS.ENABLED, settings.enabled ? 'true' : 'false')
    }
    if (settings.rateContent !== undefined) {
        setSetting(AUTO_RATE_SETTINGS_KEYS.RATE_CONTENT, settings.rateContent)
    }
    if (settings.rateScore !== undefined) {
        setSetting(AUTO_RATE_SETTINGS_KEYS.RATE_SCORE, settings.rateScore.toString())
    }
}
