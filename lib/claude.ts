import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

export function getClaude(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }
    _client = new Anthropic();
  }
  return _client;
}

export const MODEL = 'claude-haiku-4-5';

/**
 * Extracts plain text from a Message response, joining all text blocks.
 */
export function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

/**
 * Extracts a single word from the response — first non-empty word, stripped of punctuation.
 * Used for clue extraction where LLM might wrap with quotes or add a period.
 */
export function extractSingleWord(text: string): string {
  const cleaned = text
    .trim()
    .replace(/^["'`]+|["'`.!?,;:]+$/g, '')
    .replace(/^.*?:\s*/, ''); // strip "Clue: " style prefix if any
  const first = cleaned.split(/\s+/)[0] || '';
  return first.replace(/^["'`]+|["'`.!?,;:]+$/g, '');
}
