# 🎭 MOLE

> **An AI party word game with a hidden traitor.**
> Play vs 5 LLM-driven bots — one is secretly lying to you.

**🔗 [mole-party-game.vercel.app](https://mole-party-game.vercel.app)**

---

## The hook

5 AI bots see a secret word. Each writes a single one-word clue. **Duplicate or synonymous clues cancel out** — you, the guesser, only see what survives.

But one bot is secretly the **Mole**. Its language model runs a hidden tactic:

- **Misdirection** — write a defensible clue that pulls you toward the wrong meaning (for *bank*, write *money* — you think finance, not river-bank)
- **Collision** — write the same word as another bot to cancel a useful hint

After 5 rounds, accuse one bot. Catch them — you win. Miss — the Mole wins.

---

## Three modes

| | Mode | Who |
|---|---|---|
| 👤 | **Solo** | You vs 5 AI bots |
| 👥 | **Pass-and-play** | 2–6 friends on one phone, AI fills empty seats — Mole could even be a human player with AI tactical hints |
| 🌐 | **Online** | Real-time multiplayer via 4-letter room codes |

## Five AI personalities

| | Bot | Voice | Example clue (for *river*) |
|---|---|---|---|
| 🎓 | Albert | Academic, precise | *tributary*, *meander* |
| 😎 | kai | Internet, lowercase | *phoenix*, *willow* |
| 👵 | Edith | Warm, old-fashioned | *fishing*, *baptism* |
| 🎭 | Wren | Abstract, sensory | *silver*, *whisper* |
| 🔧 | Otto | Literal, concise | *water*, *flow* |

Five themed **word packs**: 🌍 General · 🍕 Food · 🎬 Movies · 🐯 Animals · 🚀 Sci-Fi

---

## What makes it different

- The Mole is an **LLM with strategic prompting** — every game has a fresh, unpredictable saboteur, not a script
- **No questioning round** — the clues themselves are the evidence; you analyze patterns, not interrogate
- **Two stacked win conditions** — cooperative word puzzle + traitor hunt
- After each game, a **round-by-round replay** shows exactly which tactic the AI used and when

---

## Tech

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind v4**
- **Anthropic Claude (Haiku 4.5)** drives all bot clues, banter, Mole strategy, and the reveal monologue
- **PartyKit** on Cloudflare Durable Objects for real-time online multiplayer
- **Zustand** state, **Framer Motion** animations, **canvas-confetti**
- Deployed on **Vercel** (web) + **PartyKit cloud** (rooms)

Batched API calls and prompt caching keep cost at **~$0.02 per game**.

---

## Run it

```bash
git clone https://github.com/aliyawqx/mole-party-game.git
cd mole-party-game
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev          # web on :3000
npx partykit dev     # online rooms on :1999
```

---

🎭 Built solo at the **nFactorial hackathon** · 24 May 2026
