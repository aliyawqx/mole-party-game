export type ThemeKey = 'general' | 'food' | 'movies' | 'animals' | 'scifi';

export type Pack = {
  key: ThemeKey;
  name: string;
  icon: string;
  description: string;
  words: string[];
};

export const PACKS: Record<ThemeKey, Pack> = {
  general: {
    key: 'general',
    name: 'General',
    icon: '🌍',
    description: 'Everyday things, places, and concepts',
    words: [
      'river', 'mountain', 'ocean', 'forest', 'desert', 'beach', 'cloud',
      'volcano', 'rainbow', 'lightning', 'snow', 'cave', 'island', 'waterfall',
      'phone', 'book', 'chair', 'mirror', 'candle', 'key', 'watch', 'umbrella',
      'helmet', 'ladder', 'rope', 'compass', 'telescope', 'guitar', 'camera', 'sword',
      'hospital', 'museum', 'library', 'kitchen', 'garden', 'castle', 'school',
      'airport', 'church', 'restaurant', 'lighthouse', 'bridge', 'subway', 'farm',
      'love', 'dream', 'freedom', 'secret', 'time', 'music', 'silence',
      'gravity', 'memory', 'shadow', 'echo', 'luck', 'fear',
      'heart', 'eye', 'smile', 'hand', 'brain', 'voice', 'tear',
      'wedding', 'birthday', 'concert', 'circus', 'parade',
    ],
  },
  food: {
    key: 'food',
    name: 'Food & Drink',
    icon: '🍕',
    description: 'Things you eat and drink',
    words: [
      'pizza', 'sushi', 'chocolate', 'coffee', 'sandwich', 'soup', 'pancake',
      'lemon', 'cheese', 'noodle', 'cookie', 'taco', 'wine', 'honey', 'banana',
      'popcorn', 'bread', 'rice', 'salad', 'cake', 'donut', 'burger', 'pasta',
      'salt', 'pepper', 'sugar', 'butter', 'jam', 'ketchup', 'mustard', 'curry',
      'apple', 'orange', 'mango', 'pineapple', 'strawberry', 'watermelon',
      'tea', 'milk', 'juice', 'beer', 'cocktail', 'lemonade', 'whisky',
      'ice', 'syrup', 'cream', 'yogurt', 'bacon', 'sausage', 'kebab',
      'mushroom', 'onion', 'garlic', 'tomato', 'potato', 'carrot', 'spinach',
      'oyster', 'lobster', 'salmon', 'tuna', 'chicken', 'steak',
    ],
  },
  movies: {
    key: 'movies',
    name: 'Movies & TV',
    icon: '🎬',
    description: 'Film genres, characters, and tropes',
    words: [
      'hero', 'villain', 'sidekick', 'twist', 'sequel', 'remake', 'trailer',
      'credits', 'cinema', 'popcorn', 'oscar', 'director', 'actor', 'script',
      'scene', 'cliffhanger', 'plot', 'romance', 'comedy', 'thriller', 'horror',
      'western', 'musical', 'cartoon', 'anime', 'documentary',
      'spaceship', 'lightsaber', 'wand', 'cape', 'mask', 'costume',
      'detective', 'spy', 'wizard', 'vampire', 'zombie', 'pirate', 'cowboy',
      'samurai', 'ninja', 'robot', 'alien', 'monster', 'ghost', 'dragon',
      'chase', 'heist', 'kidnap', 'rescue', 'duel', 'flashback', 'montage',
      'cameo', 'reboot', 'spinoff', 'prequel', 'binge', 'streaming',
      'godfather', 'matrix', 'inception', 'titanic', 'avatar',
    ],
  },
  animals: {
    key: 'animals',
    name: 'Animals',
    icon: '🐯',
    description: 'Creatures from land, sea, and sky',
    words: [
      'dog', 'cat', 'lion', 'eagle', 'dolphin', 'snake', 'spider', 'bear',
      'whale', 'penguin', 'butterfly', 'octopus', 'rabbit', 'tiger', 'horse',
      'shark', 'elephant', 'owl', 'frog', 'turtle', 'crab', 'jellyfish',
      'monkey', 'panda', 'koala', 'kangaroo', 'fox', 'wolf', 'deer',
      'parrot', 'flamingo', 'peacock', 'hawk', 'crow', 'sparrow', 'duck',
      'goose', 'pigeon', 'rooster', 'goat', 'sheep', 'cow', 'pig',
      'lizard', 'crocodile', 'gorilla', 'cheetah', 'rhino', 'hippo',
      'giraffe', 'zebra', 'camel', 'donkey', 'badger', 'beaver', 'hedgehog',
      'squirrel', 'mole', 'mouse', 'rat', 'bat', 'shark', 'seal',
      'walrus', 'narwhal', 'lobster', 'ant', 'bee', 'wasp', 'beetle',
    ],
  },
  scifi: {
    key: 'scifi',
    name: 'Sci-Fi & Magic',
    icon: '🚀',
    description: 'Future tech, magic, and the impossible',
    words: [
      'robot', 'alien', 'spaceship', 'laser', 'algorithm', 'hologram', 'satellite',
      'wizard', 'witch', 'spell', 'potion', 'curse', 'crystal', 'prophecy',
      'dragon', 'unicorn', 'phoenix', 'goblin', 'troll', 'elf', 'dwarf',
      'vampire', 'zombie', 'werewolf', 'ghost', 'demon', 'angel',
      'portal', 'teleport', 'wormhole', 'galaxy', 'planet', 'moon', 'asteroid',
      'comet', 'meteor', 'cosmos', 'orbit', 'gravity', 'eclipse',
      'cyborg', 'android', 'mech', 'nanobot', 'drone', 'plasma',
      'time', 'paradox', 'parallel', 'multiverse', 'simulation',
      'sword', 'shield', 'armor', 'amulet', 'rune', 'enchant',
      'kraken', 'siren', 'griffin', 'hydra', 'chimera', 'fairy', 'sprite',
      'cybernetic', 'telepathy', 'telekinesis', 'invisible', 'mutant',
    ],
  },
};

export const PACK_KEYS: ThemeKey[] = ['general', 'food', 'movies', 'animals', 'scifi'];

export function getPack(key: ThemeKey): Pack {
  return PACKS[key];
}

/**
 * Pick `count` unique words from a pack (random, no repeats with exclude list).
 */
export function pickWordsFromPack(
  themeKey: ThemeKey,
  count: number,
  exclude: string[] = [],
): string[] {
  const pack = getPack(themeKey);
  const excludeSet = new Set(exclude.map((w) => w.toLowerCase()));
  const pool = pack.words.filter((w) => !excludeSet.has(w.toLowerCase()));
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
