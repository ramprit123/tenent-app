export interface OllamaConfig {
  url: string;
  model: string;
  timeout: number;
  maxPromptLength: number;
}

export const ollamaConfig = (): OllamaConfig => ({
  url: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'sqlcoder',
  timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000', 10),
  maxPromptLength: parseInt(process.env.OLLAMA_MAX_PROMPT_LENGTH || '1000', 10),
});
