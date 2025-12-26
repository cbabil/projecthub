import type { AIMessage, AIProviderType, AISettings, AIStreamChunk } from '@shared/ai/types.js';
import { DEFAULT_AI_SETTINGS } from '@shared/ai/types.js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { useSettings } from './SettingsContext.js';

interface AIContextValue {
  settings: AISettings;
  isConfigured: boolean;
  messages: AIMessage[];
  streaming: boolean;
  streamContent: string;
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
  const streamContentRef = useRef('');

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
        streamContentRef.current += c.content;
        setStreamContent(streamContentRef.current);
      } else if (c.type === 'done') {
        if (streamContentRef.current) {
          setMessages((prev) => [...prev, { role: 'assistant', content: streamContentRef.current }]);
        }
        streamContentRef.current = '';
        setStreamContent('');
        setStreaming(false);
      } else if (c.type === 'error') {
        const errorMsg = streamContentRef.current
          ? `${streamContentRef.current}\n\n[Error: ${c.content}]`
          : `Error: ${c.content}`;
        setMessages((prev) => [...prev, { role: 'assistant', content: errorMsg }]);
        streamContentRef.current = '';
        setStreamContent('');
        setStreaming(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: AIMessage = { role: 'user', content };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      const config =
        aiSettings.provider === 'ollama'
          ? { endpoint: aiSettings.ollama.endpoint, model: aiSettings.ollama.model }
          : {
              apiKey: await window.projecthub.aiDecryptKey(aiSettings[aiSettings.provider].apiKey),
              model: aiSettings[aiSettings.provider].model
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
      streamContent,
      sendMessage,
      clearChat,
      testConnection,
      updateProvider
    }),
    [
      aiSettings,
      isConfigured,
      messages,
      streaming,
      streamContent,
      sendMessage,
      clearChat,
      testConnection,
      updateProvider
    ]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
};
