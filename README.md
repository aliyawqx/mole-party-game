# 🎭 MOLE — AI party word game with a traitor

> An AI-native reimagining of the cooperative party game **Just One**, with a social-deduction twist: one of the players is secretly the **Mole**, sabotaging your guesses without you knowing.

**🔗 Live:** [mole-party-game.vercel.app](https://mole-party-game.vercel.app)
**🛠️ Built solo at the nFactorial hackathon — 24 May 2026 (10:00–15:45)**

---

## What it is

Each round, a secret word is shown to everyone *except* the **Guesser**. Other players each write a single one-word clue. **Duplicate or synonymous clues cancel out** — you can't both write *"water"* for *river*. The Guesser sees only the surviving clues and tries to guess the word.

**The Mole twist:** one random player is secretly the Mole. Their job: make you fail without being caught. They use one of two tactics:
- **Misdirection** — a defensible clue that nudges toward the wrong meaning
- **Collision** — predict another player's obvious clue and write the same one, cancelling useful info

After 5 rounds, everyone votes on who the Mole was.

## Three modes

| Mode | Players | Status |
|---|---|---|
| **Solo** | 1 human vs 5 AI bots with distinct personalities | ✅ Ready |
| **Pass-and-play** | 2–6 humans on one phone, AI fills empty seats — Mole could be anyone | ✅ Ready |
| **Online** | Friends on different devices | 🚧 Coming soon |

## The 5 AI bots

Each AI has a vivid personality that shapes their clues. The Mole role rotates randomly each game — and a single bot's voice stays consistent whether they're sabotaging or playing fair.

| Bot | Style | Example clues for *river* |
|---|---|---|
| **🎓 Professor Albert** | Academic, precise | *tributary*, *fluvial*, *meander* |
| **😎 kai** | Internet-online, references | *phoenix*, *willow* |
| **👵 Grandma Edith** | Warm, old-fashioned | *fishing*, *baptism* |
| **🎭 Wren (the Poet)** | Abstract, metaphorical | *silver*, *whisper* |
| **🔧 Otto (the Engineer)** | Literal, concise | *water*, *flow*, *bank* |

## Tech

- **Next.js 16** (App Router) + **React 19** + **TypeScript** + **Tailwind v4**
- **Anthropic Claude API** (Sonnet 4.6) — drives all bot clues, banter, Mole tactics, and the final reveal monologue
- **Zustand** for client state, separate stores per mode (mode-agnostic engine underneath)
- **Framer Motion** for animations
- **Vercel** for deploy (auto-deploy on git push)

## AI is the gameplay, not the decoration

This isn't "use AI somewhere in the project." The game *requires* an LLM that can:
- Generate clues in 5 distinct voices
- Secretly play a saboteur role with strategic awareness of other players' likely clues
- Give a final in-character monologue explaining the rounds in retrospect

Each AI bot has its own system prompt with a personality, a temperature setting, and (when chosen as the Mole) a secret tactical addendum. The Mole's "tactic" (Misdirection vs Collision) is picked server-side per round and injected into the prompt.

## Run locally

```bash
git clone https://github.com/aliyawqx/mole-party-game.git
cd mole-party-game
npm install
cp .env.local.example .env.local       # add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run without an API key (mock clues for development):
```bash
NEXT_PUBLIC_USE_MOCK=1 npm run dev
```

## Hackathon submission

| Criterion | Note |
|---|---|
| **Great use of AI** | LLM is the literal core game loop, not a feature |
| **Original game** | No good Just One on the web; the Mole twist is novel |
| **UI/UX** | Tailwind v4 dark theme, framer-motion transitions, mobile-friendly pass-phone flow |
| **Gameplay** | Quick rounds, real social deduction, replay-friendly |
| **Stability** | Mock-mode fallback if API fails, edge-case handling |
| **HELL YES** | Bots with personalities + a hidden traitor + a monologue at the end |

---

🤖 Built with [Claude Code](https://claude.com/claude-code)
