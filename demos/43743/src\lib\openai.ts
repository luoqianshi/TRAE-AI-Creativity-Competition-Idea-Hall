// OpenAI 客户端
import 'server-only';
import OpenAI from 'openai';

let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

export function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
