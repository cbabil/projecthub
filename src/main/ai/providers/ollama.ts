// src/main/ai/providers/ollama.ts

import type { AIMessage, AIProviderConfig, AIStreamChunk } from '@shared/ai/types.js';

export async function* chatOllama(
  config: AIProviderConfig,
  messages: AIMessage[],
  systemPrompt: string
): AsyncGenerator<AIStreamChunk> {
  const endpoint = config.endpoint || 'http://localhost:11434';

  const response = await fetch(`${endpoint}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages]
    })
  });

  if (!response.ok || !response.body) {
    yield { type: 'error', content: `Ollama error: ${response.statusText}` };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const json = JSON.parse(line);
        if (json.message?.content) {
          yield { type: 'text', content: json.message.content };
        }
      } catch {
        // Skip malformed lines
      }
    }
  }
  yield { type: 'done', content: '' };
}

export async function testOllamaConnection(config: AIProviderConfig): Promise<boolean> {
  try {
    const endpoint = config.endpoint || 'http://localhost:11434';
    const res = await fetch(`${endpoint}/api/tags`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(endpoint: string): Promise<string[]> {
  try {
    const res = await fetch(`${endpoint}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m: { name: string }) => m.name);
  } catch {
    return [];
  }
}
