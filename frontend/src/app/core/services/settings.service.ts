import { Injectable } from '@angular/core';

export interface AISettings {
    baseUrl: string;
    apiKey: string;
    hasApiKey: boolean;
    model: string;
    systemPrompt: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private readonly baseUrl = '/api/autoreply';

    async getAISettings(): Promise<AISettings> {
        const res = await fetch(`${this.baseUrl}/ai`);
        return res.json();
    }

    async saveAISettings(settings: Partial<AISettings>): Promise<{ success: boolean }> {
        const res = await fetch(`${this.baseUrl}/ai`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        return res.json();
    }

    async testAIConnection(): Promise<{ success: boolean; error?: string }> {
        const res = await fetch(`${this.baseUrl}/ai/test`, { method: 'POST' });
        return res.json();
    }

    async getDefaultPrompt(): Promise<string> {
        const res = await fetch(`${this.baseUrl}/ai/default-prompt`);
        const data = await res.json();
        return data.prompt;
    }
}
