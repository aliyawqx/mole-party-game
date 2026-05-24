import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getClaude, MODEL, extractText, extractSingleWord } from '@/lib/claude';
import { BOTS } from '@/lib/bots';
import { buildClueSystem, buildClueUser } from '@/lib/prompts';
import { pickMoleTactic } from '@/lib/engine/setup';
import type { BotKey, Tactic } from '@/lib/engine/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

type CluesRequest = {
  word: string;
  forbidden?: string[];
  bots: Array<{ id: string; personalityKey: BotKey; isMole: boolean }>;
};

type ClueResp = { botId: string; clue: string; tactic?: Tactic };

export async function POST(request: NextRequest) {
  let body: CluesRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { word, forbidden = [], bots } = body;
  if (!word || !Array.isArray(bots) || bots.length === 0) {
    return NextResponse.json({ error: 'missing word or bots' }, { status: 400 });
  }

  const client = getClaude();

  const results = await Promise.all(
    bots.map(async (b): Promise<ClueResp> => {
      const bot = BOTS[b.personalityKey];
      if (!bot) {
        return { botId: b.id, clue: '...' };
      }
      const tactic: Tactic | undefined = b.isMole ? pickMoleTactic(0) : undefined;
      const system = buildClueSystem(bot, b.isMole, tactic);
      const user = buildClueUser(word, forbidden);

      try {
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: 60,
          temperature: b.isMole ? Math.min(1, bot.temperature + 0.1) : bot.temperature,
          system,
          messages: [{ role: 'user', content: user }],
        });
        const raw = extractText(response);
        const clue = extractSingleWord(raw) || '...';
        return { botId: b.id, clue, tactic };
      } catch (err) {
        if (err instanceof Anthropic.APIError) {
          console.error(`Claude API error (${err.status}) for bot ${b.id}:`, err.message);
        } else {
          console.error(`Clue gen failed for bot ${b.id}:`, err);
        }
        return { botId: b.id, clue: '...', tactic };
      }
    }),
  );

  return NextResponse.json({ clues: results });
}
