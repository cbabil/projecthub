// src/shared/ai/types.ts

export type AIProviderType = 'anthropic' | 'openai' | 'ollama';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProviderConfig {
  apiKey?: string;
  model: string;
  endpoint?: string; // for Ollama
}

export interface AISettings {
  provider: AIProviderType;
  anthropic: { apiKey: string; model: string };
  openai: { apiKey: string; model: string };
  ollama: { endpoint: string; model: string };
}

export interface AIStreamChunk {
  type: 'text' | 'done' | 'error';
  content: string;
}

export interface GeneratedTemplate {
  name: string;
  description: string;
  structure: {
    folders: string[];
    files: Record<string, string>;
  };
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'anthropic',
  anthropic: { apiKey: '', model: 'claude-sonnet-4-20250514' },
  openai: { apiKey: '', model: 'gpt-4o' },
  ollama: { endpoint: 'http://localhost:11434', model: 'llama3' }
};
