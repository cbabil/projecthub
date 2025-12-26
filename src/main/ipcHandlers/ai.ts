// src/main/ipcHandlers/ai.ts

import type { AIMessage, AIProviderConfig, AIProviderType } from '@shared/ai/types.js';
import type { OperationResult } from '@shared/types.js';
import { ipcMain, safeStorage } from 'electron';

import { chat, listOllamaModels, testConnection } from '../ai/aiService.js';

export const registerAIHandlers = () => {
  // Test connection to a provider
  ipcMain.handle(
    'ai:test-connection',
    async (_event, provider: AIProviderType, config: AIProviderConfig): Promise<OperationResult<boolean>> => {
      try {
        const ok = await testConnection(provider, config);
        return { ok, data: ok, error: ok ? undefined : 'Connection failed' };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    }
  );

  // List Ollama models
  ipcMain.handle('ai:list-ollama-models', async (_event, endpoint: string): Promise<OperationResult<string[]>> => {
    try {
      const models = await listOllamaModels(endpoint);
      return { ok: true, data: models };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  // Chat with streaming (returns session ID, streams via events)
  ipcMain.handle(
    'ai:chat',
    async (event, provider: AIProviderType, config: AIProviderConfig, messages: AIMessage[]): Promise<OperationResult<null>> => {
      try {
        for await (const chunk of chat(provider, config, messages)) {
          event.sender.send('ai:stream', chunk);
        }
        return { ok: true };
      } catch (err) {
        event.sender.send('ai:stream', { type: 'error', content: String(err) });
        return { ok: false, error: String(err) };
      }
    }
  );

  // Encrypt API key for storage
  ipcMain.handle('ai:encrypt-key', (_event, key: string): string => {
    if (!safeStorage.isEncryptionAvailable()) return key;
    return safeStorage.encryptString(key).toString('base64');
  });

  // Decrypt API key for use
  ipcMain.handle('ai:decrypt-key', (_event, encrypted: string): string => {
    if (!safeStorage.isEncryptionAvailable()) return encrypted;
    try {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    } catch {
      return encrypted; // Return as-is if decryption fails
    }
  });
};
