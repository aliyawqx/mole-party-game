import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getClaude, MODEL, extractText } from '@/lib/claude';
import { BATCHED_BANTER_SYSTEM, buildBatchedBanterUser } from '@/lib/prompts';
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

  // Pick up to maxLines speakers (randomized)
  const shuffled = bots.slice().sort(() => Math.random() - 0.5);
  const speakers = shuffled.slice(0, Math.max(1, maxLines));

  const client = getClaude();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 250,
      temperature: 0.9,
      system: [
        {
          type: 'text',
          text: BATCHED_BANTER_SYSTEM,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: buildBatchedBanterUser({
            word,
            guesserName,
            guess,
            correct,
            speakers: speakers.map((b) => ({
              key: b.personalityKey,
              isMole: b.isMole,
              theirClue: b.theirClue,
              wasClueCancelled: b.wasClueCancelled,
            })),
          }),
        },
      ],
    });

    const raw = extractText(response);
    const parsed = parseBanterJSON(raw);

    const results = speakers.map((b) => {
      const line = String(parsed[b.personalityKey] ?? '').trim();
      return { botId: b.id, line: cleanLine(line) || '…' };
    });

    return NextResponse.json({ banter: results });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Banter batched API error (${err.status}):`, err.message);
    } else {
      console.error('Banter batched gen failed:', err);
    }
    const fallback = speakers.map((b) => ({ botId: b.id, line: 'Hmm.' }));
    return NextResponse.json({ banter: fallback });
  }
}

function parseBanterJSON(raw: string): Record<string, string> {
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    /* fall through */
  }
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]) as Record<string, string>;
    } catch {
      /* fall through */
    }
  }
  const match = raw.match(/\{[\s\S]*?\}/);
  if (match) {
    try {
      return JSON.parse(match[0]) as Record<string, string>;
    } catch {
      /* fall through */
    }
  }
  return {};
}

function cleanLine(s: string): string {
  return s.replace(/^["']|["']$/g, '').trim();
}
