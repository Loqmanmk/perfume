import { FAMILY_LABELS, SCENT_FAMILIES, type Product } from '@/domain/product';

interface QuizOption {
  value: string;
  label: string;
  hint: string;
}

/**
 * A question knows how to score a product against its own answer.
 * Adding a question is a matter of appending to `QUESTIONS` — the
 * recommendation engine and the UI need no changes.
 */
export interface QuizQuestion {
  id: string;
  title: string;
  options: readonly QuizOption[];
  score: (product: Product, answer: string) => number;
}

export type QuizAnswers = Readonly<Record<string, string>>;

const INTENSITY_TARGETS: Record<string, number> = { light: 2, moderate: 3.5, intense: 5 };

export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'mood',
    title: 'How do you want to feel?',
    options: [
      { value: 'radiant', label: 'Radiant', hint: 'Bright, energised, sunlit' },
      { value: 'serene', label: 'Serene', hint: 'Calm, clean, collected' },
      { value: 'bold', label: 'Bold', hint: 'Confident, magnetic, daring' },
      { value: 'sensual', label: 'Sensual', hint: 'Warm, intimate, enveloping' },
    ],
    score: (product, answer) => (product.mood === answer ? 3 : 0),
  },
  {
    id: 'family',
    title: 'Which world draws you in?',
    options: SCENT_FAMILIES.map((family) => ({
      value: family,
      label: FAMILY_LABELS[family],
      hint: {
        floral: 'A garden at dusk',
        woody: 'A forest after rain',
        amber: 'Candlelight and spice',
        citrus: 'A Mediterranean morning',
        fresh: 'Open sea air',
        gourmand: 'A warm patisserie',
      }[family],
    })),
    score: (product, answer) => (product.family === answer ? 3 : 0),
  },
  {
    id: 'intensity',
    title: 'How present should it be?',
    options: [
      { value: 'light', label: 'A whisper', hint: 'Close to the skin' },
      { value: 'moderate', label: 'A presence', hint: 'Noticed up close' },
      { value: 'intense', label: 'A statement', hint: 'Leaves a trail' },
    ],
    score: (product, answer) => {
      const target = INTENSITY_TARGETS[answer];
      return target === undefined ? 0 : Math.max(2 - Math.abs(product.intensity - target), 0);
    },
  },
];

export function recommend(
  products: readonly Product[],
  answers: QuizAnswers,
  limit: number,
): Product[] {
  const scoreOf = (product: Product) =>
    QUESTIONS.reduce((total, question) => {
      const answer = answers[question.id];
      return answer === undefined ? total : total + question.score(product, answer);
    }, 0);

  return products
    .map((product) => ({ product, score: scoreOf(product) }))
    .toSorted((a, b) => b.score - a.score || b.product.rating - a.product.rating)
    .slice(0, limit)
    .map(({ product }) => product);
}
