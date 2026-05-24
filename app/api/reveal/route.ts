import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getClaude, MODEL } from '@/lib/claude';
import { BOTS } from '@/lib/bots';
import { buildRevealSystem, buildRevealUser, type RevealRoundSummary } from '@/lib/prompts';
import type { BotKey } from '@/lib/engine/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

type RevealRequest = {
  moleParticipant: {
    name: string;
    personalityKey?: BotKey;
  };
  rounds: RevealRoundSummary[];
  accusationCorrect: boolean;
};

export async function POST(request: NextRequest) {
  let body: RevealRequest;
  try {
    body = await request.json();
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  const { moleParticipant, rounds, accusationCorrect } = body;
  if (!moleParticipant || !Array.isArray(rounds)) {
    return new Response('missing fields', { status: 400 });
  }

  const bot = moleParticipant.personalityKey ? BOTS[moleParticipant.personalityKey] : null;
  const system = buildRevealSystem(bot ?? null);
  const user = buildRevealUser({ caught: accusationCorrect, rounds });

  const client = getClaude();

  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 300,
      temperature: bot ? bot.temperature : 0.7,
      system,
      messages: [{ role: 'user', content: user }],
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        stream.on('text', (delta: string) => {
          controller.enqueue(encoder.encode(delta));
        });
        try {
          await stream.finalMessage();
          controller.close();
        } catch (err) {
          console.error('Reveal stream error:', err);
          controller.error(err);
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`Reveal API error (${err.status}):`, err.message);
    } else {
      console.error('Reveal API failed:', err);
    }
    return new Response('The Mole disappeared before they could speak.', {
      status: 200,
    });
  }
}
