export type Difficulty = 'easy' | 'medium' | 'hard';

export type WordEntry = {
  word: string;
  difficulty: Difficulty;
};

export const WORD_BANK: WordEntry[] = [
  // Nature & weather
  { word: 'river', difficulty: 'easy' },
  { word: 'mountain', difficulty: 'easy' },
  { word: 'ocean', difficulty: 'easy' },
  { word: 'forest', difficulty: 'easy' },
  { word: 'desert', difficulty: 'easy' },
  { word: 'beach', difficulty: 'easy' },
  { word: 'cloud', difficulty: 'easy' },
  { word: 'volcano', difficulty: 'easy' },
  { word: 'rainbow', difficulty: 'easy' },
  { word: 'lightning', difficulty: 'easy' },
  { word: 'snow', difficulty: 'easy' },
  { word: 'cave', difficulty: 'easy' },
  { word: 'glacier', difficulty: 'medium' },
  { word: 'island', difficulty: 'easy' },
  { word: 'waterfall', difficulty: 'easy' },
  { word: 'meadow', difficulty: 'medium' },
  { word: 'canyon', difficulty: 'medium' },

  // Animals
  { word: 'dog', difficulty: 'easy' },
  { word: 'cat', difficulty: 'easy' },
  { word: 'lion', difficulty: 'easy' },
  { word: 'eagle', difficulty: 'easy' },
  { word: 'dolphin', difficulty: 'easy' },
  { word: 'snake', difficulty: 'easy' },
  { word: 'spider', difficulty: 'easy' },
  { word: 'bear', difficulty: 'easy' },
  { word: 'whale', difficulty: 'easy' },
  { word: 'penguin', difficulty: 'easy' },
  { word: 'butterfly', difficulty: 'easy' },
  { word: 'octopus', difficulty: 'easy' },
  { word: 'rabbit', difficulty: 'easy' },
  { word: 'tiger', difficulty: 'easy' },
  { word: 'horse', difficulty: 'easy' },
  { word: 'shark', difficulty: 'easy' },
  { word: 'elephant', difficulty: 'easy' },
  { word: 'owl', difficulty: 'easy' },

  // Food & drink
  { word: 'pizza', difficulty: 'easy' },
  { word: 'sushi', difficulty: 'easy' },
  { word: 'chocolate', difficulty: 'easy' },
  { word: 'coffee', difficulty: 'easy' },
  { word: 'sandwich', difficulty: 'easy' },
  { word: 'soup', difficulty: 'easy' },
  { word: 'pancake', difficulty: 'easy' },
  { word: 'lemon', difficulty: 'easy' },
  { word: 'cheese', difficulty: 'easy' },
  { word: 'noodle', difficulty: 'easy' },
  { word: 'cookie', difficulty: 'easy' },
  { word: 'taco', difficulty: 'easy' },
  { word: 'wine', difficulty: 'easy' },
  { word: 'honey', difficulty: 'easy' },
  { word: 'banana', difficulty: 'easy' },
  { word: 'popcorn', difficulty: 'easy' },

  // Everyday objects
  { word: 'phone', difficulty: 'easy' },
  { word: 'book', difficulty: 'easy' },
  { word: 'chair', difficulty: 'easy' },
  { word: 'mirror', difficulty: 'easy' },
  { word: 'candle', difficulty: 'easy' },
  { word: 'key', difficulty: 'easy' },
  { word: 'watch', difficulty: 'easy' },
  { word: 'umbrella', difficulty: 'easy' },
  { word: 'glove', difficulty: 'easy' },
  { word: 'helmet', difficulty: 'easy' },
  { word: 'ladder', difficulty: 'easy' },
  { word: 'rope', difficulty: 'easy' },
  { word: 'magnet', difficulty: 'medium' },
  { word: 'compass', difficulty: 'medium' },
  { word: 'telescope', difficulty: 'medium' },
  { word: 'guitar', difficulty: 'easy' },
  { word: 'camera', difficulty: 'easy' },
  { word: 'sword', difficulty: 'easy' },

  // Places
  { word: 'hospital', difficulty: 'easy' },
  { word: 'museum', difficulty: 'easy' },
  { word: 'library', difficulty: 'easy' },
  { word: 'kitchen', difficulty: 'easy' },
  { word: 'garden', difficulty: 'easy' },
  { word: 'castle', difficulty: 'easy' },
  { word: 'school', difficulty: 'easy' },
  { word: 'airport', difficulty: 'easy' },
  { word: 'church', difficulty: 'easy' },
  { word: 'restaurant', difficulty: 'easy' },
  { word: 'lighthouse', difficulty: 'medium' },
  { word: 'bridge', difficulty: 'easy' },
  { word: 'subway', difficulty: 'easy' },
  { word: 'farm', difficulty: 'easy' },
  { word: 'jungle', difficulty: 'easy' },
  { word: 'graveyard', difficulty: 'medium' },

  // People / roles
  { word: 'doctor', difficulty: 'easy' },
  { word: 'teacher', difficulty: 'easy' },
  { word: 'pirate', difficulty: 'easy' },
  { word: 'knight', difficulty: 'easy' },
  { word: 'wizard', difficulty: 'easy' },
  { word: 'chef', difficulty: 'easy' },
  { word: 'ghost', difficulty: 'easy' },
  { word: 'detective', difficulty: 'easy' },
  { word: 'astronaut', difficulty: 'easy' },
  { word: 'clown', difficulty: 'easy' },
  { word: 'farmer', difficulty: 'easy' },
  { word: 'soldier', difficulty: 'easy' },
  { word: 'mermaid', difficulty: 'easy' },
  { word: 'vampire', difficulty: 'easy' },
  { word: 'samurai', difficulty: 'medium' },

  // Abstract concepts
  { word: 'love', difficulty: 'medium' },
  { word: 'dream', difficulty: 'medium' },
  { word: 'freedom', difficulty: 'medium' },
  { word: 'secret', difficulty: 'medium' },
  { word: 'time', difficulty: 'medium' },
  { word: 'music', difficulty: 'easy' },
  { word: 'silence', difficulty: 'medium' },
  { word: 'gravity', difficulty: 'medium' },
  { word: 'memory', difficulty: 'medium' },
  { word: 'shadow', difficulty: 'medium' },
  { word: 'echo', difficulty: 'medium' },
  { word: 'luck', difficulty: 'medium' },
  { word: 'fear', difficulty: 'medium' },

  // Body & senses
  { word: 'heart', difficulty: 'easy' },
  { word: 'eye', difficulty: 'easy' },
  { word: 'smile', difficulty: 'easy' },
  { word: 'hand', difficulty: 'easy' },
  { word: 'brain', difficulty: 'easy' },
  { word: 'voice', difficulty: 'easy' },
  { word: 'fingerprint', difficulty: 'medium' },
  { word: 'tear', difficulty: 'easy' },
  { word: 'shadow', difficulty: 'medium' },

  // Activities & events
  { word: 'wedding', difficulty: 'easy' },
  { word: 'birthday', difficulty: 'easy' },
  { word: 'funeral', difficulty: 'easy' },
  { word: 'race', difficulty: 'easy' },
  { word: 'concert', difficulty: 'easy' },
  { word: 'circus', difficulty: 'easy' },
  { word: 'parade', difficulty: 'easy' },
  { word: 'auction', difficulty: 'medium' },
  { word: 'heist', difficulty: 'medium' },

  // Tech & sci-fi
  { word: 'robot', difficulty: 'easy' },
  { word: 'alien', difficulty: 'easy' },
  { word: 'spaceship', difficulty: 'easy' },
  { word: 'laser', difficulty: 'easy' },
  { word: 'algorithm', difficulty: 'medium' },
  { word: 'hologram', difficulty: 'medium' },
  { word: 'satellite', difficulty: 'medium' },

  // Mythology / fantasy
  { word: 'dragon', difficulty: 'easy' },
  { word: 'unicorn', difficulty: 'easy' },
  { word: 'zombie', difficulty: 'easy' },
  { word: 'werewolf', difficulty: 'easy' },
  { word: 'phoenix', difficulty: 'easy' },
  { word: 'goblin', difficulty: 'easy' },

  // Pop culture / media
  { word: 'movie', difficulty: 'easy' },
  { word: 'comic', difficulty: 'easy' },
  { word: 'podcast', difficulty: 'medium' },
  { word: 'cartoon', difficulty: 'easy' },

  // Misc fun
  { word: 'tornado', difficulty: 'easy' },
  { word: 'treasure', difficulty: 'easy' },
  { word: 'museum', difficulty: 'easy' },
  { word: 'tattoo', difficulty: 'easy' },
  { word: 'sunset', difficulty: 'easy' },
  { word: 'rainbow', difficulty: 'easy' },
  { word: 'sunrise', difficulty: 'easy' },
  { word: 'mountain', difficulty: 'easy' },
];

// Deduplicate (in case I doubled anything by accident)
const seen = new Set<string>();
const deduped: WordEntry[] = [];
for (const entry of WORD_BANK) {
  if (!seen.has(entry.word)) {
    seen.add(entry.word);
    deduped.push(entry);
  }
}

export const WORDS: WordEntry[] = deduped;

export function pickRandomWords(count: number, exclude: string[] = []): string[] {
  const excludeSet = new Set(exclude.map((w) => w.toLowerCase()));
  const pool = WORDS.filter((w) => !excludeSet.has(w.word.toLowerCase())).map((w) => w.word);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
