export interface CardData {
  f1: string; // Word
  f2: string; // Translation
  f3: string; // Context
  f4: string; // Gender
  f5: string; // Notes
}

export interface Card {
  id: number;
  deckId: string;
  data: CardData;
  status: 'new' | 'learning' | 'review' | 'graduated';
  nextReview: number;
}

// Initial Mock Data
let cards: Card[] = [
  {
    id: 1,
    deckId: 'd1',
    data: {
      f1: 'Fernweh',
      f2: 'Wanderlust / Longing for far-off places',
      f3: 'Ich habe schreckliches Fernweh.',
      f4: 'Das',
      f5: 'Opposite of Heimweh (homesickness).',
    },
    status: 'new',
    nextReview: Date.now(),
  },
  {
    id: 2,
    deckId: 'd1',
    data: {
      f1: 'Zeitgeist',
      f2: 'Spirit of the times',
      f3: 'Der Roman fängt den Zeitgeist der 20er Jahre ein.',
      f4: 'Der',
      f5: 'Compound: Zeit (time) + Geist (spirit)',
    },
    status: 'learning',
    nextReview: Date.now(),
  },
];

export const getCards = (): Card[] => {
  return cards;
};

export const addCard = (card: Card): Card => {
  cards.push(card);
  return card;
};

export const resetCards = (newCards: Card[]) => {
  cards = [...newCards];
};

export const INITIAL_CARDS: Card[] = [...cards];
