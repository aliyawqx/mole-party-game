import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getClaude, MODEL, extractText, extractSingleWord } from '@/lib/claude';
import { BATCHED_CLUE_SYSTEM, buildBatchedClueUser } from '@/lib/prompts';
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

  const moleBot = bots.find((b) => b.isMole);
  if (!moleBot) {
    return NextResponse.json({ error: 'no mole in request' }, { status: 400 });
  }
  const tactic: Tactic = pickMoleTactic(0);
  const client = getClaude();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      temperature: 0.85,
      system: [
        {
          type: 'text',
          text: BATCHED_CLUE_SYSTEM,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: buildBatchedClueUser({
            word,
            forbidden,
            moleKey: moleBot.personalityKey,
            tactic,
          }),
        },
      ],
    });

    const raw = extractText(response);
    const parsed = parseClueJSON(raw);

    const result: ClueResp[] = bots.map((b) => {
      const rawWord = parsed[b.personalityKey];
      const clue = rawWord ? extractSingleWord(String(rawWord)) : '';
      return {
        botId: b.id,
        clue: clue || '...',
        tactic: b.isMole ? tactic : undefined,
      };
    });

    return NextResponse.json({ clues: result });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Clue batched API error (${err.status}):`, err.message);
    } else {
      console.error('Clue batched gen failed:', err);
    }
    // Graceful fallback: empty clues that all get cancelled by the client.
    const fallback: ClueResp[] = bots.map((b) => ({
      botId: b.id,
      clue: '...',
      tactic: b.isMole ? tactic : undefined,
    }));
    return NextResponse.json({ clues: fallback });
  }
}

/**
 * Best-effort JSON extraction. Claude usually returns the JSON object on a single line,
 * but sometimes wraps in fences or adds preamble. Try several recovery strategies.
 */
function parseClueJSON(raw: string): Record<string, string> {
  // 1. Direct parse
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    /* fall through */
  }
  // 2. Strip markdown fences
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) {
    try {
      return JSON.parse(fenced[1]) as Record<string, string>;
    } catch {
      /* fall through */
    }
  }
  // 3. Find first {...} substring
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
