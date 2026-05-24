import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getClaude, MODEL, extractText } from '@/lib/claude';
import { buildMoleHintsSystem, buildMoleHintsUser } from '@/lib/prompts';
import type { BotKey } from '@/lib/engine/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Req = {
  word: string;
  otherParticipants: Array<{
    name: string;
    personalityKey?: BotKey;
    pastClues?: string[];
  }>;
};

export async function POST(request: NextRequest) {
  let body: Req;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const { word, otherParticipants } = body;
  if (!word || !Array.isArray(otherParticipants)) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const client = getClaude();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 250,
      temperature: 0.6,
      system: buildMoleHintsSystem(),
      messages: [
        {
          role: 'user',
          content: buildMoleHintsUser({ word, otherParticipants }),
        },
      ],
    });
    const raw = extractText(response);
    // Parse hyphen-bullet list
    const hints = raw
      .split('\n')
      .map((line) => line.replace(/^[-*•]\s*/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, 3);

    return NextResponse.json({ hints });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Mole-hints API error (${err.status}):`, err.message);
    } else {
      console.error('Mole-hints failed:', err);
    }
    return NextResponse.json({ hints: [] });
  }
}
