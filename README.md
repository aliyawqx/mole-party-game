# MOLE — AI party word game with a traitor

A reimagining of the cooperative party game **Just One** with a social-deduction twist: one of the players is secretly the **Mole**, sabotaging your guesses.

Built solo for the nFactorial hackathon (24 May 2026).

## Game modes

- **Solo** — play vs 5 AI bots with distinct personalities, one is the Mole.
- **Pass-and-play** — 2–6 friends on one phone, AI fills empty seats, Mole could be anyone (even a human).
- **Online** *(stretch)* — play with friends on different devices.

## How to play

Each round, a word is shown to everyone except the **Guesser**. The other players each write a single one-word clue. Duplicate clues cancel each other out (you can't both write "water" for *river*). The Guesser tries to guess the word from what remains. Five rounds, then everyone votes on who the Mole was.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Anthropic Claude API for bot clues, banter, and Mole tactics
- Zustand for client state
- Framer Motion for animations
- Deployed on Vercel

## Development

```bash
npm install
cp .env.local.example .env.local  # add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
