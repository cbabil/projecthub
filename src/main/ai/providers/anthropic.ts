// src/main/ai/providers/anthropic.ts

import Anthropic from '@anthropic-ai/sdk';
import type { AIMessage, AIProviderConfig, AIStreamChunk } from '@shared/ai/types.js';

export async function* chatAnthropic(
  config: AIProviderConfig,
  messages: AIMessage[],
  systemPrompt: string
): AsyncGenerator<AIStreamChunk> {
  const client = new Anthropic({ apiKey: config.apiKey });

  const stream = await client.messages.stream({
    model: config.model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      yield { type: 'text', content: event.delta.text };
    }
  }
  yield { type: 'done', content: '' };
}

export async function testAnthropicConnection(config: AIProviderConfig): Promise<boolean> {
  try {
    const client = new Anthropic({ apiKey: config.apiKey });
    await client.messages.create({
      model: config.model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    return true;
  } catch {
    return false;
  }
}
