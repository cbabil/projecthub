import { AI_MODELS, AI_PROVIDER_INFO } from '@shared/ai/constants.js';
import type { AIProviderType, AISettings } from '@shared/ai/types.js';
import { DEFAULT_AI_SETTINGS } from '@shared/ai/types.js';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import React, { useState } from 'react';

import { useSettings } from '../../context/SettingsContext.js';

const SettingsAITab: React.FC = () => {
  const { settings, update } = useSettings();
  const [testing, setTesting] = useState<AIProviderType | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const ai: AISettings = settings?.ai ?? DEFAULT_AI_SETTINGS;

  const handleProviderChange = (provider: AIProviderType) => {
    update({ ...settings!, ai: { ...ai, provider } });
  };

  const handleKeyChange = (provider: 'anthropic' | 'openai', key: string) => {
    update({ ...settings!, ai: { ...ai, [provider]: { ...ai[provider], apiKey: key } } });
  };

  const handleModelChange = (provider: 'anthropic' | 'openai', model: string) => {
    update({ ...settings!, ai: { ...ai, [provider]: { ...ai[provider], model } } });
  };

  const handleOllamaChange = (field: 'endpoint' | 'model', value: string) => {
    update({ ...settings!, ai: { ...ai, ollama: { ...ai.ollama, [field]: value } } });
  };

  const handleTest = async (provider: AIProviderType) => {
    setTesting(provider);
    const config = provider === 'ollama'
      ? { endpoint: ai.ollama.endpoint, model: ai.ollama.model }
      : { apiKey: await window.projecthub.aiDecryptKey(ai[provider].apiKey), model: ai[provider].model };
    const result = await window.projecthub.aiTestConnection(provider, config);
    setTestResults({ ...testResults, [provider]: result.ok && result.data === true });
    setTesting(null);
  };

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Provider</h3>
        <select
          value={ai.provider}
          onChange={(e) => handleProviderChange(e.target.value as AIProviderType)}
          className="input w-full"
        >
          {(Object.keys(AI_PROVIDER_INFO) as AIProviderType[]).map((p) => (
            <option key={p} value={p}>{AI_PROVIDER_INFO[p].name}</option>
          ))}
        </select>
      </section>

      {(['anthropic', 'openai'] as const).map((provider) => (
        <section key={provider} className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">{AI_PROVIDER_INFO[provider].name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTest(provider)}
                disabled={testing === provider || !ai[provider].apiKey}
                className="text-xs text-brand-accent-primary hover:text-brand-accent-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {testing === provider ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
              </button>
              {testResults[provider] !== undefined && (
                testResults[provider]
                  ? <CheckCircle size={14} className="text-brand-accent-green" />
                  : <XCircle size={14} className="text-brand-accent-red" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <input
              type="password"
              value={ai[provider].apiKey}
              onChange={(e) => handleKeyChange(provider, e.target.value)}
              placeholder="API Key"
              className="input w-full"
            />
            <select
              value={ai[provider].model}
              onChange={(e) => handleModelChange(provider, e.target.value)}
              className="input w-full"
            >
              {AI_MODELS[provider].map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </section>
      ))}

      <section className="p-4 bg-white/5 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">{AI_PROVIDER_INFO.ollama.name}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTest('ollama')}
              disabled={testing === 'ollama'}
              className="text-xs text-brand-accent-primary hover:text-brand-accent-primary/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {testing === 'ollama' ? <Loader2 size={14} className="animate-spin" /> : 'Test'}
            </button>
            {testResults.ollama !== undefined && (
              testResults.ollama
                ? <CheckCircle size={14} className="text-brand-accent-green" />
                : <XCircle size={14} className="text-brand-accent-red" />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            value={ai.ollama.endpoint}
            onChange={(e) => handleOllamaChange('endpoint', e.target.value)}
            placeholder="http://localhost:11434"
            className="input w-full"
          />
          <input
            type="text"
            value={ai.ollama.model}
            onChange={(e) => handleOllamaChange('model', e.target.value)}
            placeholder="llama3"
            className="input w-full"
          />
        </div>
      </section>
    </div>
  );
};

export default SettingsAITab;
