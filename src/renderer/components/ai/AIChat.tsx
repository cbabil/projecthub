import { AI_MODELS } from '@shared/ai/constants.js';
import type { AIProviderType } from '@shared/ai/types.js';
import { Bot, Send, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'ui-toolkit';

import { useAI } from '../../context/AIContext.js';

interface Props {
  onClose: () => void;
  onSaveTemplate: (template: unknown) => void;
  onCreateProject: (template: unknown) => void;
  initialContext?: string;
}

const AIChat: React.FC<Props> = ({ onClose, onSaveTemplate, onCreateProject, initialContext }) => {
  const { settings, messages, streaming, streamContent, sendMessage, updateProvider } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming, streamContent]);

  useEffect(() => {
    if (initialContext && messages.length === 0) {
      sendMessage(initialContext);
    }
  }, [initialContext, messages.length, sendMessage]);

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')?.content || '';
  const hasTemplate = lastAssistantMsg.includes('"structure"');

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-[#131328] border-l border-[#6a5afd]/70 flex flex-col z-40 shadow-[-24px_0_70px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <span className="text-sm font-medium text-white">AI Assistant</span>
        <div className="flex items-center gap-2">
          <Dropdown
            value={settings.provider}
            onChange={(value) => updateProvider(value as AIProviderType)}
            options={[
              ...(Object.keys(AI_MODELS) as AIProviderType[]).map((p) => ({
                value: p,
                label: p
              })),
              { value: 'ollama', label: 'ollama' }
            ]}
          />
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-white/50">What kind of template would you like to create?</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && <Bot size={16} className="text-[#6a5afd] mt-1 flex-shrink-0" />}
            <div
              className={`max-w-[80%] text-sm rounded-lg px-3 py-2 ${msg.role === 'user' ? 'bg-[#6a5afd] text-white' : 'bg-[#0f0f23] text-white/90'}`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && <User size={16} className="text-white/50 mt-1 flex-shrink-0" />}
          </div>
        ))}
        {streaming && (
          <div className="flex gap-2">
            <Bot size={16} className="text-[#6a5afd] mt-1 animate-pulse flex-shrink-0" />
            <div className="max-w-[80%] text-sm rounded-lg px-3 py-2 bg-[#0f0f23] text-white/90">
              {streamContent || 'Thinking...'}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={streaming}
            className="flex-1 px-3 py-2 bg-[#0f0f23] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6a5afd]/50 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            className="p-2 bg-[#6a5afd] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#6a5afd]/90 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>

        {hasTemplate && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onSaveTemplate(lastAssistantMsg)}
              className="flex-1 px-3 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-600/90 transition-colors"
            >
              Save as Template
            </button>
            <button
              onClick={() => onCreateProject(lastAssistantMsg)}
              className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-600/90 transition-colors"
            >
              Create Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;
