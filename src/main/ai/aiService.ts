// src/main/ai/aiService.ts

import { TEMPLATE_SYSTEM_PROMPT } from '@shared/ai/constants.js';
import type { AIMessage, AIProviderConfig, AIProviderType, AIStreamChunk } from '@shared/ai/types.js';

import { chatAnthropic, testAnthropicConnection } from './providers/anthropic.js';
import { chatOllama, listOllamaModels, testOllamaConnection } from './providers/ollama.js';
import { chatOpenAI, testOpenAIConnection } from './providers/openai.js';

export async function* chat(
  provider: AIProviderType,
  config: AIProviderConfig,
  messages: AIMessage[]
): AsyncGenerator<AIStreamChunk> {
  switch (provider) {
    case 'anthropic':
      yield* chatAnthropic(config, messages, TEMPLATE_SYSTEM_PROMPT);
      break;
    case 'openai':
      yield* chatOpenAI(config, messages, TEMPLATE_SYSTEM_PROMPT);
      break;
    case 'ollama':
      yield* chatOllama(config, messages, TEMPLATE_SYSTEM_PROMPT);
      break;
    default:
      yield { type: 'error', content: `Unknown provider: ${provider}` };
  }
}

export async function testConnection(provider: AIProviderType, config: AIProviderConfig): Promise<boolean> {
  switch (provider) {
    case 'anthropic':
      return testAnthropicConnection(config);
    case 'openai':
      return testOpenAIConnection(config);
    case 'ollama':
      return testOllamaConnection(config);
    default:
      return false;
  }
}

export { listOllamaModels };
