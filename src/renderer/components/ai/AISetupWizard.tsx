import { AI_PROVIDER_INFO } from '@shared/ai/constants.js';
import type { AIProviderType } from '@shared/ai/types.js';
import { DEFAULT_AI_SETTINGS } from '@shared/ai/types.js';
import { ExternalLink, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { useAI } from '../../context/AIContext.js';
import { useSettings } from '../../context/SettingsContext.js';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AISetupWizard: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { settings, update } = useSettings();
  const { testConnection } = useAI();
  const [provider, setProvider] = useState<AIProviderType>('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setTesting(true);
    setError('');

    const success = await testConnection(provider, apiKey);
    if (!success) {
      setError('Connection failed. Check your API key or endpoint.');
      setTesting(false);
      return;
    }

    const encrypted = provider !== 'ollama' ? await window.projecthub.aiEncryptKey(apiKey) : '';
    const ai = settings?.ai ?? DEFAULT_AI_SETTINGS;

    if (provider === 'ollama') {
      ai.ollama.endpoint = apiKey || 'http://localhost:11434';
    } else {
      ai[provider].apiKey = encrypted;
    }
    ai.provider = provider;

    await update({ ...settings!, ai });
    setTesting(false);
    onSuccess();
  };

  const info = AI_PROVIDER_INFO[provider];
  const providers = Object.keys(AI_PROVIDER_INFO) as AIProviderType[];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#131328] border border-[#6a5afd]/70 rounded-2xl p-6 w-[500px] shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Set Up AI</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-white/60 hover:text-white transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-white/70 mb-4">Choose your AI provider:</p>

        <div className="space-y-3 mb-5">
          {providers.map((p) => (
            <label
              key={p}
              className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <input
                type="radio"
                checked={provider === p}
                onChange={() => setProvider(p)}
                className="mt-0.5 accent-[#6a5afd]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white block">
                  {AI_PROVIDER_INFO[p].name}
                </span>
                <span className="text-xs text-white/50 block mt-0.5">
                  {AI_PROVIDER_INFO[p].description}
                </span>
              </div>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm text-white/70 block mb-2">
            {provider === 'ollama' ? 'Endpoint' : 'API Key'}
          </label>
          <input
            type={provider === 'ollama' ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'ollama' ? 'http://localhost:11434' : 'sk-...'}
            className="w-full px-3 py-2 bg-[#0f0f23] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6a5afd]/50 transition-colors"
          />
        </div>

        <a
          href={info.keyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#6a5afd] flex items-center gap-1.5 mb-5 hover:text-[#6a5afd]/80 transition-colors"
        >
          <ExternalLink size={12} />
          Get your key at {info.keyUrl.replace('https://', '')}
        </a>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={testing || (!apiKey && provider !== 'ollama')}
            className="px-4 py-2 text-sm bg-[#6a5afd] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-[#6a5afd]/90 transition-colors"
          >
            {testing && <Loader2 size={14} className="animate-spin" />}
            Test & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISetupWizard;
