// src/main/ai/providers/openai.ts

import type { AIMessage, AIProviderConfig, AIStreamChunk } from '@shared/ai/types.js';
import OpenAI from 'openai';

export async function* chatOpenAI(
  config: AIProviderConfig,
  messages: AIMessage[],
  systemPrompt: string
): AsyncGenerator<AIStreamChunk> {
  const client = new OpenAI({ apiKey: config.apiKey });

  const stream = await client.chat.completions.create({
    model: config.model,
    stream: true,
    messages: [{ role: 'system', content: systemPrompt }, ...messages.map((m) => ({ role: m.role, content: m.content }))]
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield { type: 'text', content };
    }
  }
  yield { type: 'done', content: '' };
}

export async function testOpenAIConnection(config: AIProviderConfig): Promise<boolean> {
  try {
    const client = new OpenAI({ apiKey: config.apiKey });
    await client.chat.completions.create({
      model: config.model,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    });
    return true;
  } catch {
    return false;
  }
}
