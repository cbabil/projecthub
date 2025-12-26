import type { AIMessage, AIProviderType, AISettings, AIStreamChunk } from '@shared/ai/types.js';
import { DEFAULT_AI_SETTINGS } from '@shared/ai/types.js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useSettings } from './SettingsContext.js';

interface AIContextValue {
  settings: AISettings;
  isConfigured: boolean;
  messages: AIMessage[];
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  testConnection: (provider: AIProviderType, apiKey: string) => Promise<boolean>;
  updateProvider: (provider: AIProviderType) => void;
}

const AIContext = createContext<AIContextValue | null>(null);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings: appSettings, update: updateAppSettings } = useSettings();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');

  const aiSettings = appSettings?.ai ?? DEFAULT_AI_SETTINGS;
  const isConfigured = Boolean(
    (aiSettings.provider === 'anthropic' && aiSettings.anthropic.apiKey) ||
      (aiSettings.provider === 'openai' && aiSettings.openai.apiKey) ||
      (aiSettings.provider === 'ollama' && aiSettings.ollama.endpoint)
  );

  useEffect(() => {
    const unsubscribe = window.projecthub.onAIStream((chunk: unknown) => {
      const c = chunk as AIStreamChunk;
      if (c.type === 'text') {
        setStreamContent((prev) => prev + c.content);
      } else if (c.type === 'done') {
        setMessages((prev) => [...prev, { role: 'assistant', content: streamContent }]);
        setStreamContent('');
        setStreaming(false);
      } else if (c.type === 'error') {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${c.content}` }]);
        setStreamContent('');
        setStreaming(false);
      }
    });
    return unsubscribe;
  }, [streamContent]);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: AIMessage = { role: 'user', content };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      const providerConfig = aiSettings[aiSettings.provider];
      const config =
        aiSettings.provider === 'ollama'
          ? { endpoint: providerConfig.endpoint, model: providerConfig.model }
          : {
              apiKey: await window.projecthub.aiDecryptKey(providerConfig.apiKey),
              model: providerConfig.model
            };

      await window.projecthub.aiChat(aiSettings.provider, config, [...messages, userMsg]);
    },
    [aiSettings, messages]
  );

  const clearChat = useCallback(() => setMessages([]), []);

  const testConnection = useCallback(
    async (provider: AIProviderType, apiKey: string) => {
      const config =
        provider === 'ollama'
          ? { endpoint: aiSettings.ollama.endpoint, model: aiSettings.ollama.model }
          : { apiKey, model: aiSettings[provider].model };
      const result = await window.projecthub.aiTestConnection(provider, config);
      return result.ok && result.data === true;
    },
    [aiSettings]
  );

  const updateProvider = useCallback(
    (provider: AIProviderType) => {
      if (!appSettings) return;
      updateAppSettings({ ...appSettings, ai: { ...aiSettings, provider } });
    },
    [appSettings, aiSettings, updateAppSettings]
  );

  const value = useMemo(
    () => ({
      settings: aiSettings,
      isConfigured,
      messages,
      streaming,
      sendMessage,
      clearChat,
      testConnection,
      updateProvider
    }),
    [aiSettings, isConfigured, messages, streaming, sendMessage, clearChat, testConnection, updateProvider]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
};
