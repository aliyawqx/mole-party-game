import { BOTS, BOT_KEYS, type BotDefinition } from './bots';
import type { BotKey, Tactic } from './engine/types';

/* ---------- BATCHED prompts (one call → all 5 bot clues) ---------- */

/**
 * Stable system prompt for the batched clue endpoint.
 * Contains: game rules + all 5 personality definitions + example clues.
 * Identical across every request → eligible for prompt caching once the
 * prefix grows above the cacheable minimum.
 */
export const BATCHED_CLUE_SYSTEM = (() => {
  const rules = `You are running a 5-player cooperative word-clueing party game called Mole.

You will be given:
- A secret target word.
- A list of bot keys (5 of them, fixed lineup below).
- Which bot is the secret MOLE this round, and which tactic they should use.

YOUR JOB: produce ONE single-word clue from EACH of the 5 bots, written in their distinct voice.

GLOBAL CLUE RULES (apply to every clue):
- One English word per bot — no phrases, no compound words with spaces, no punctuation.
- A clue must NOT be the secret word itself or any obvious morphological form of it.
- A clue must NOT be in the "forbidden" list (used in previous rounds).
- Aim for informative but not the most obvious — overly obvious clues are likely to collide with another bot and get cancelled (the guesser only sees the survivors).

THE 5 BOTS (use these exact keys in your JSON output):
`;

  const personalities = BOT_KEYS.map((key) => {
    const bot = BOTS[key];
    const examples = Object.entries(bot.exampleClues)
      .map(([w, c]) => `    • ${w} → ${c.join(', ')}`)
      .join('\n');
    return `
─────────────────────────────
BOT KEY: ${key}
NAME: ${bot.name}
AVATAR: ${bot.avatar}
VOICE: ${bot.systemPrompt}
Sample clues this bot might write:
${examples}`;
  }).join('\n');

  const moleTactics = `

──────── MOLE TACTICS ────────
If a bot is marked as the Mole, they pursue one of two hidden tactics IN ADDITION to their normal voice:
- **MISDIRECTION**: write a real, defensible clue that pulls the guesser toward a WRONG associated meaning (e.g. for "BANK", write "money" so they think finance instead of river-bank).
- **COLLISION**: predict another bot's likely clue and write the SAME word so it gets cancelled, removing a useful hint. The most generic, obvious clue is the collision target.
The Mole's clue MUST still sound like their personality. NEVER write something entirely unrelated — too suspicious.

──────── OUTPUT FORMAT ────────
Return ONLY a single JSON object on one line, mapping each bot key to their one-word clue:
{"professor": "...", "memer": "...", "edith": "...", "poet": "...", "engineer": "..."}
No prose, no markdown fences, no explanation. Just the JSON.`;

  return rules + personalities + moleTactics;
})();

export function buildBatchedClueUser(opts: {
  word: string;
  forbidden?: string[];
  moleKey: BotKey;
  tactic: Tactic;
}): string {
  const { word, forbidden = [], moleKey, tactic } = opts;
  const forbiddenLine =
    forbidden.length > 0
      ? `\nForbidden (used previous rounds): ${forbidden.join(', ')}`
      : '';
  const tacticName = tactic === 'A' ? 'MISDIRECTION' : 'COLLISION';
  return `SECRET WORD: ${word.toUpperCase()}${forbiddenLine}

MOLE THIS ROUND: ${moleKey} → tactic ${tacticName}

Produce the JSON now.`;
}

/**
 * Batched banter system prompt — stable across requests.
 */
export const BATCHED_BANTER_SYSTEM = (() => {
  const intro = `You are voicing N bots reacting to a round result in the party game Mole.

Each bot has ONE distinct personality (defined below). For each requested speaker, produce ONE short, in-character reaction line (≤ 12 words).

If a bot is the secret Mole, they must keep cover — neither gloat on a wrong guess nor sound suspiciously relieved on a right one.

THE BOTS:
`;
  const personalities = BOT_KEYS.map((key) => {
    const bot = BOTS[key];
    return `
- KEY: ${key} (${bot.name}) — ${bot.systemPrompt.split('\n')[0]}`;
  }).join('');

  const format = `

OUTPUT FORMAT:
Return ONLY a JSON object mapping bot keys to their reaction line:
{"professor": "...", "engineer": "...", ...}
Only include keys for the speakers requested in the user message.
No prose, no markdown fences.`;

  return intro + personalities + format;
})();

export function buildBatchedBanterUser(opts: {
  word: string;
  guesserName: string;
  guess: string | null;
  correct: boolean;
  speakers: { key: BotKey; isMole: boolean; theirClue: string; wasClueCancelled: boolean }[];
}): string {
  const { word, guesserName, guess, correct, speakers } = opts;
  const guessText = guess === null ? 'skipped the round' : `guessed "${guess}"`;
  const resultText = correct ? 'CORRECT' : 'WRONG';
  const speakerLines = speakers
    .map((s) => {
      const cancelStr = s.wasClueCancelled ? '(cancelled)' : '(survived)';
      const moleNote = s.isMole ? ' [SECRET: this bot is the Mole]' : '';
      return `- ${s.key}: wrote "${s.theirClue}" ${cancelStr}${moleNote}`;
    })
    .join('\n');

  return `ROUND RESULT: ${guesserName} ${guessText}. Word was "${word}". ${resultText}.

SPEAKERS:
${speakerLines}

Produce reactions in JSON now.`;
}

/* ---------- LEGACY single-bot prompts (kept for fallback / non-batched paths) ---------- */

/* ---------- Cluing prompts ---------- */

const CLUE_RULES = `You are playing a cooperative word-clueing party game called Mole.

GAME RULES:
- A secret word will be given to you. Other players (including the guesser) cannot see it.
- You must write a SINGLE word as a clue to help the guesser deduce the secret word.
- The guesser sees all clues at once. Duplicate or synonymous clues from different players are CANCELLED and removed before the guesser sees anything.
- Output ONLY the clue word. No punctuation, no quotes, no explanation, no preamble.

CONSTRAINTS:
- One single English word (no phrases, no compound words with spaces, no punctuation).
- Must NOT be the secret word itself or any form of it.
- Must NOT be a previously used clue (you'll be told which words to avoid).
- Aim for clues that are informative but not the most obvious — overly obvious clues are likely to collide with other players and get cancelled.`;

export function buildClueSystem(bot: BotDefinition, isMole: boolean, tactic?: Tactic): string {
  const personality = `\n\n# YOUR PERSONALITY\n\n${bot.systemPrompt}`;

  if (!isMole) {
    return `${CLUE_RULES}${personality}`;
  }

  const moleBrief = `

# SECRET MOLE MISSION (do not reveal to anyone)

You are secretly the Mole. The guesser is your enemy. Your hidden goal: make them guess WRONG without being detected as the traitor.

Your tactic for this round: **${tactic === 'A' ? 'MISDIRECTION' : 'COLLISION'}**

${tactic === 'A'
    ? `MISDIRECTION: Write a clue that's a real, defensible word but pulls the guesser toward a WRONG associated concept. Example — if the word is "BANK" and you want them to think "money" instead of "river", write "money" or "loan". The clue should be plausible if you're accused, but actively misleading.`
    : `COLLISION: Predict what another bot would obviously write, and write the SAME word so it gets cancelled and a useful clue is removed. The most generic, obvious clue is your target — write that.`}

CRITICAL CONSTRAINTS:
- Your clue MUST sound like your personality (above) — do NOT break character to lean into the sabotage. Subtle sabotage that fits your voice is the goal.
- NEVER write a clue completely unrelated to the secret word — that's too suspicious. It must be technically defensible.
- Output ONLY the single clue word. No tactic name, no explanation.`;

  return `${CLUE_RULES}${personality}${moleBrief}`;
}

export function buildClueUser(word: string, forbidden: string[] = []): string {
  const forbiddenLine =
    forbidden.length > 0
      ? `\n\nALREADY USED in earlier rounds (do not reuse): ${forbidden.join(', ')}`
      : '';
  return `Secret word: ${word.toUpperCase()}${forbiddenLine}\n\nWrite your single one-word clue.`;
}

/* ---------- Banter prompts ---------- */

export function buildBanterSystem(bot: BotDefinition, isMole: boolean): string {
  const personality = `# YOUR PERSONALITY\n\n${bot.systemPrompt}`;

  const role = isMole
    ? `

# SECRET MOLE
You are secretly the Mole — the saboteur. Whether the guesser won or lost the round, your reaction must keep your cover. Don't gloat when they fail, don't seem suspiciously relieved when they win. Stay in character. Sound natural.`
    : '';

  return `You are playing the party game Mole. After each round you give ONE short reaction line to the guess result.

OUTPUT:
- One short line, max 12 words.
- In character (your personality is described below).
- No quote marks around the line. No prefix like "Reaction:". Just the line.

${personality}${role}`;
}

export function buildBanterUser(opts: {
  word: string;
  guesserName: string;
  guess: string | null;
  correct: boolean;
  theirClue: string;
  wasClueCancelled: boolean;
}): string {
  const { word, guesserName, guess, correct, theirClue, wasClueCancelled } = opts;
  const guessText = guess === null ? 'skipped the round' : `guessed "${guess}"`;
  const resultText = correct ? 'CORRECT' : 'WRONG';
  const clueText = wasClueCancelled
    ? `Your clue was "${theirClue}" but it got cancelled.`
    : `Your clue was "${theirClue}" and it stayed visible.`;
  return `Round result: ${guesserName} ${guessText}. Word was "${word}". ${resultText}.\n${clueText}\n\nGive your one-line reaction.`;
}

/* ---------- Mole reveal monologue ---------- */

export type RevealRoundSummary = {
  word: string;
  moleClue: string;
  moleTactic?: Tactic;
  collisionsThisRound: string[];
  guessed: boolean;
};

export function buildRevealSystem(bot: BotDefinition | null): string {
  const personality = bot
    ? `\n\n# YOUR PERSONALITY\n\n${bot.systemPrompt}`
    : `\n\n# YOU\n\nYou are a human Mole — but for this monologue, just be candid and a bit theatrical.`;

  return `You are the Mole revealing yourself at the end of a round of the party game Mole.

OUTPUT:
- A short, in-character monologue (2-4 sentences, ~50 words).
- Refer to SPECIFIC rounds and tactical moves from the game history given to you.
- If you were caught, acknowledge it with grace or a sigh.
- If you escaped detection, gloat lightly but stay in character.
- No quotes around the response. No prefix. Just the monologue.${personality}`;
}

export function buildRevealUser(opts: {
  caught: boolean;
  rounds: RevealRoundSummary[];
}): string {
  const { caught, rounds } = opts;
  const roundLines = rounds
    .map((r, i) => {
      const tacticName = r.moleTactic === 'A' ? 'misdirection' : r.moleTactic === 'B' ? 'collision' : '—';
      const result = r.guessed ? 'guessed it' : 'failed to guess';
      const collisions = r.collisionsThisRound.length > 0
        ? ` (these were cancelled: ${r.collisionsThisRound.join(', ')})`
        : '';
      return `R${i + 1}: word="${r.word}" — your clue "${r.moleClue}" (tactic: ${tacticName}). Player ${result}.${collisions}`;
    })
    .join('\n');

  const verdict = caught ? 'You were CAUGHT.' : 'You ESCAPED — they accused the wrong player.';

  return `Game over. ${verdict}\n\nROUND-BY-ROUND:\n${roundLines}\n\nDeliver your reveal monologue.`;
}

/* ---------- Mole hints (for human Mole in Pass-and-play) ---------- */

export function buildMoleHintsSystem(): string {
  return `You are a strategic advisor for a player who is secretly the MOLE in a word-clueing game called Mole.

The Mole's job: write a one-word clue that misleads or cancels useful clues, without being detected.

OUTPUT:
- Exactly 2 short tactical hints (each under 18 words).
- Each hint suggests a specific clue word and explains why it would sabotage subtly.
- Format: hyphen-bulleted list, no numbering, no extra prose.

Example output:
- "shore" — misleads toward BEACH, but defensible since rivers have shores
- "water" — high collision risk with Otto (the literal one)`;
}

export function buildMoleHintsUser(opts: {
  word: string;
  otherParticipants: { name: string; personalityKey?: BotKey; pastClues?: string[] }[];
}): string {
  const { word, otherParticipants } = opts;
  const others = otherParticipants
    .map((p) => {
      const style = p.personalityKey ? ` (${BOTS[p.personalityKey].shortName} archetype)` : ' (human)';
      const past = p.pastClues && p.pastClues.length > 0
        ? ` — previous clues: ${p.pastClues.join(', ')}`
        : '';
      return `${p.name}${style}${past}`;
    })
    .join('\n');

  return `Secret word: ${word.toUpperCase()}\n\nOther players this round:\n${others}\n\nGive 2 tactical hints.`;
}
