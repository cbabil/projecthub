// src/shared/ai/constants.ts

export const AI_MODELS = {
  anthropic: [
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' }
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
  ]
};

export const AI_PROVIDER_INFO = {
  anthropic: {
    name: 'Anthropic (Claude)',
    description: 'Best for code generation',
    keyUrl: 'https://console.anthropic.com/account/keys'
  },
  openai: {
    name: 'OpenAI (GPT-4)',
    description: 'Popular, well-documented',
    keyUrl: 'https://platform.openai.com/api-keys'
  },
  ollama: {
    name: 'Ollama (Local)',
    description: 'Free & private, runs locally',
    keyUrl: 'https://ollama.ai'
  }
};

export const TEMPLATE_SYSTEM_PROMPT = `You are a template generator for ProjectHub. Generate project templates as JSON with this structure:
{
  "name": "template-name",
  "description": "Brief description",
  "structure": {
    "folders": ["src", "public"],
    "files": { "path/file.ts": "file content..." }
  }
}
Keep responses focused on the template. Ask clarifying questions if needed.
When the user is satisfied, output ONLY the JSON with no markdown fences.`;
