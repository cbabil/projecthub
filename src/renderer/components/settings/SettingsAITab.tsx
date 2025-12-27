import { AI_MODELS, AI_PROVIDER_INFO } from '@shared/ai/constants.js';
import type { AIProviderType, AISettings } from '@shared/ai/types.js';
import { DEFAULT_AI_SETTINGS } from '@shared/ai/types.js';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Dropdown, Input } from 'ui-toolkit';

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
        <Dropdown
          value={ai.provider}
          onChange={(value) => handleProviderChange(value as AIProviderType)}
          options={(Object.keys(AI_PROVIDER_INFO) as AIProviderType[]).map((p) => ({
            value: p,
            label: AI_PROVIDER_INFO[p].name
          }))}
        />
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
            <Input
              type="password"
              value={ai[provider].apiKey}
              onChange={(value) => handleKeyChange(provider, value)}
              placeholder="API Key"
            />
            <Dropdown
              value={ai[provider].model}
              onChange={(value) => handleModelChange(provider, value)}
              options={AI_MODELS[provider].map((m) => ({
                value: m.id,
                label: m.name
              }))}
            />
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
          <Input
            value={ai.ollama.endpoint}
            onChange={(value) => handleOllamaChange('endpoint', value)}
            placeholder="http://localhost:11434"
          />
          <Input
            value={ai.ollama.model}
            onChange={(value) => handleOllamaChange('model', value)}
            placeholder="llama3"
          />
        </div>
      </section>
    </div>
  );
};

export default SettingsAITab;
