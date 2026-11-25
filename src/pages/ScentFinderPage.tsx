import { useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { useCatalogue } from '@/features/catalogue/useCatalogue';
import { QUESTIONS, recommend, type QuizAnswers } from '@/features/scent-finder/quiz';
import { usePageTitle } from '@/lib/hooks/usePageTitle';

const RESULT_COUNT = 3;

const stepMotion = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
} as const;

export function ScentFinderPage() {
  usePageTitle('Scent Finder');

  const { repository } = useCatalogue();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [stepIndex, setStepIndex] = useState(0);

  const question = QUESTIONS[stepIndex];
  const isFinished = question === undefined;

  const answer = (questionId: string, value: string) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setStepIndex((index) => index + 1);
  };

  const restart = () => {
    setAnswers({});
    setStepIndex(0);
  };

  return (
    <div className="container-page min-h-dvh pb-24 pt-36 md:pt-44">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow text-center">Scent Finder</p>

        <div
          className="mx-auto mt-6 h-0.5 max-w-xs overflow-hidden rounded-full bg-ink-700"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={Math.min(stepIndex, QUESTIONS.length)}
        >
          <motion.div
            className="h-full origin-left bg-gold"
            initial={false}
            animate={{ scaleX: stepIndex / QUESTIONS.length }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {isFinished ? (
            <motion.section key="results" {...stepMotion} className="mt-12" aria-live="polite">
              <h1 className="text-center text-5xl md:text-7xl">Your signature scents</h1>
              <p className="mx-auto mt-4 max-w-md text-center text-muted">
                Matched to your answers, best fit first. Each one ships with samples so you can try
                before you commit.
              </p>
              <div className="mt-14 [&>ul]:lg:grid-cols-3">
                <ProductGrid products={recommend(repository.getAll(), answers, RESULT_COUNT)} />
              </div>
              <div className="mt-14 text-center">
                <Button variant="outline" onClick={restart}>
                  <RotateCcw size={15} aria-hidden /> Start again
                </Button>
              </div>
            </motion.section>
          ) : (
            <motion.section key={question.id} {...stepMotion} className="mt-12">
              <p className="text-center text-sm text-muted">
                Question {stepIndex + 1} of {QUESTIONS.length}
              </p>
              <h1 className="mt-3 text-center text-5xl md:text-7xl">{question.title}</h1>

              <ul className="mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-2">
                {question.options.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => answer(question.id, option.value)}
                      className="hairline group flex min-h-24 w-full flex-col justify-center rounded-2xl border bg-ink-900 px-6 py-5 text-left transition-[border-color,background-color,transform] duration-300 ease-luxe hover:-translate-y-0.5 hover:border-gold hover:bg-ink-800"
                    >
                      <span className="font-display text-3xl transition-colors group-hover:text-gold">
                        {option.label}
                      </span>
                      <span className="mt-1 text-sm text-muted">{option.hint}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {stepIndex > 0 && (
                <div className="mt-10 text-center">
                  <Button variant="ghost" onClick={() => setStepIndex((index) => index - 1)}>
                    <ArrowLeft size={15} aria-hidden /> Previous question
                  </Button>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
