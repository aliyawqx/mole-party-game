import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getClaude, MODEL, extractText } from '@/lib/claude';
import { BOTS } from '@/lib/bots';
import { buildBanterSystem, buildBanterUser } from '@/lib/prompts';
import type { BotKey } from '@/lib/engine/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

type BanterRequest = {
  word: string;
  guesserName: string;
  guess: string | null;
  correct: boolean;
  bots: Array<{
    id: string;
    personalityKey: BotKey;
    isMole: boolean;
    theirClue: string;
    wasClueCancelled: boolean;
  }>;
  maxLines?: number;
};

export async function POST(request: NextRequest) {
  let body: BanterRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { word, guesserName, guess, correct, bots, maxLines = 2 } = body;
  if (!word || !Array.isArray(bots)) {
    return NextResponse.json({ error: 'missing word or bots' }, { status: 400 });
  }

  // Pick up to maxLines bots to chime in — prefer non-mole speakers, randomize order
  const shuffled = bots.slice().sort(() => Math.random() - 0.5);
  const speakers = shuffled.slice(0, Math.max(1, maxLines));

  const client = getClaude();

  const results = await Promise.all(
    speakers.map(async (b) => {
      const bot = BOTS[b.personalityKey];
      if (!bot) return { botId: b.id, line: '...' };

      try {
        const response = await client.messages.create({
          model: MODEL,
          max_tokens: 60,
          temperature: bot.temperature,
          system: buildBanterSystem(bot, b.isMole),
          messages: [
            {
              role: 'user',
              content: buildBanterUser({
                word,
                guesserName,
                guess,
                correct,
                theirClue: b.theirClue,
                wasClueCancelled: b.wasClueCancelled,
              }),
            },
          ],
        });
        const line = extractText(response).replace(/^["']|["']$/g, '').trim();
        return { botId: b.id, line: line || '...' };
      } catch (err) {
        if (err instanceof Anthropic.APIError) {
          console.error(`Banter API error (${err.status}) for bot ${b.id}:`, err.message);
        } else {
          console.error(`Banter gen failed for bot ${b.id}:`, err);
        }
        return { botId: b.id, line: 'Hmm.' };
      }
    }),
  );

  return NextResponse.json({ banter: results });
}
