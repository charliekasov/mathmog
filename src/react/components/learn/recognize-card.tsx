"use client";

import * as React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { diagnoseMiss } from '../../../core/diagnosis';
import type { MissDiagnosis } from '../../../core/diagnosis';
import { assembleRecognizeOptions } from '../../../core/learn/helpers';
import type { MemorizeLearnTopic } from '../../../core/learn/mathmog-binding';
import type { LearnDistractorSet, LearnItem } from '../../../core/learn/types';
import { useMathmogUI } from '../../ui/provider';
import { learnAnswerRevealDisplay } from './grading';
import { useAnyKeyContinue } from './use-any-key-continue';

interface LearnRecognizeCardProps {
  item: LearnItem<string, number>;
  distractorSet: LearnDistractorSet<number>;
  /** For the miss-identity line; null disables diagnosis (null = nothing extra). */
  topic: MemorizeLearnTopic | null;
  rng?: () => number;
  /**
   * Called once the student dismisses the feedback beat — the host applies
   * the machine action then, so the reveal is read before the queue moves.
   * "Don't know?" reports `false` (a miss, by the 2A.1 rail).
   */
  onAnswer: (correct: boolean) => void;
}

type RecognizePhase = 'answering' | 'correct' | 'miss' | 'dont-know';

/**
 * The Recognize tier: the item's prompt with four options (1 correct + 3
 * sampled from the curated pool via `assembleRecognizeOptions`). Options are
 * assembled once per mount — the host keys this component per presentation,
 * so a re-queued item gets a fresh draw (layout variety per the 2A.1 helper
 * contract).
 *
 * Keyboard: 1–4 picks an option directly; arrow keys move a visible
 * highlight and Enter picks the highlighted option (the highlight is tracked
 * state, not DOM focus — the `UIPrimitiveBag` Button contract doesn't
 * forward refs); during feedback any key continues.
 *
 * On a wrong pick the `diagnoseMiss` identity line renders before the item
 * resurfaces at its See card (2D.2 substrate); the message is rendered
 * verbatim — this component never composes diagnosis copy. Null → no extra
 * line; the See re-teach is the designed fallback.
 */
export function LearnRecognizeCard({
  item,
  distractorSet,
  topic,
  rng = Math.random,
  onAnswer,
}: LearnRecognizeCardProps) {
  const ui = useMathmogUI();
  const [options] = React.useState<number[]>(
    () => assembleRecognizeOptions(item, distractorSet, rng).options
  );
  const [phase, setPhase] = React.useState<RecognizePhase>('answering');
  const [pickedIndex, setPickedIndex] = React.useState<number | null>(null);
  const [highlightIndex, setHighlightIndex] = React.useState<number | null>(null);
  const [diagnosis, setDiagnosis] = React.useState<MissDiagnosis | null>(null);

  const answering = phase === 'answering';
  const correctIndex = options.indexOf(item.answer);

  const pick = React.useCallback(
    (index: number) => {
      if (phase !== 'answering') return;
      setPickedIndex(index);
      if (options[index] === item.answer) {
        setPhase('correct');
        return;
      }
      setDiagnosis(
        topic === null ? null : diagnoseMiss(topic, item.id, options[index])
      );
      setPhase('miss');
    },
    [phase, options, item, topic]
  );

  const finish = () => onAnswer(phase === 'correct');

  useAnyKeyContinue(!answering, finish);

  React.useEffect(() => {
    if (!answering) return;
    const handle = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const digit = Number(e.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= options.length) {
        e.preventDefault();
        pick(digit - 1);
        return;
      }
      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
        setHighlightIndex(current =>
          current === null
            ? delta === 1
              ? 0
              : options.length - 1
            : (current + delta + options.length) % options.length
        );
        return;
      }
      if (e.key === 'Enter' && highlightIndex !== null) {
        e.preventDefault();
        pick(highlightIndex);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [answering, options.length, highlightIndex, pick]);

  const optionClasses = (index: number): string => {
    if (answering) {
      return index === highlightIndex ? 'ring-2 ring-amber-400' : '';
    }
    if (index === correctIndex) {
      return 'border-2 border-green-600 text-green-700 dark:text-green-500';
    }
    if (index === pickedIndex) {
      return 'border-2 border-amber-400 text-amber-700 dark:text-amber-500';
    }
    return 'opacity-50';
  };

  return (
    <ui.Card
      data-tour="mathmog-learn-recognize"
      className="border-t-2 border-t-amber-300 shadow-md"
    >
      <ui.CardContent className="pt-6 pb-8 space-y-6">
        <p className="text-2xl md:text-3xl font-bold text-center">
          {item.prompt} = ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
          {options.map((option, index) => (
            <ui.Button
              key={`${option}-${index}`}
              variant="outline"
              onClick={() => pick(index)}
              data-learn-option={String(index + 1)}
              className={`h-14 text-xl justify-start gap-3 border-2 ${
                answering ? '' : 'pointer-events-none'
              } ${optionClasses(index)}`}
            >
              <span className="hidden sm:inline text-sm text-muted-foreground font-normal">
                {index + 1}
              </span>
              {String(option)}
              {!answering && index === correctIndex && (
                <Check className="w-5 h-5 ml-auto" />
              )}
            </ui.Button>
          ))}
        </div>

        {answering && (
          <div className="flex justify-center">
            <ui.Button
              variant="ghost"
              size="sm"
              className="h-11 sm:h-9"
              onClick={() => {
                setPickedIndex(null);
                setPhase('dont-know');
              }}
            >
              Don&apos;t know?
            </ui.Button>
          </div>
        )}

        {phase === 'correct' && (
          <div className="text-center text-lg font-semibold text-green-600">
            Correct!
          </div>
        )}

        {phase === 'miss' && (
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-amber-600 dark:text-amber-500">
              Not quite.
            </div>
            {diagnosis !== null && (
              <p
                data-learn-diagnosis
                className="text-sm text-muted-foreground max-w-md mx-auto"
              >
                {diagnosis.message}
              </p>
            )}
            <p className="text-base font-medium">
              {item.prompt} = {learnAnswerRevealDisplay(item)}
            </p>
          </div>
        )}

        {phase === 'dont-know' && (
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-amber-600 dark:text-amber-500">
              No problem. Here it is:
            </div>
            <p className="text-base font-medium">
              {item.prompt} = {learnAnswerRevealDisplay(item)}
            </p>
            <p className="text-sm text-muted-foreground">
              You&apos;ll get another shot at it in a moment.
            </p>
          </div>
        )}

        {!answering && (
          <div className="flex justify-center">
            <ui.Button onClick={finish} className="text-lg h-14 sm:h-11 px-8">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </ui.Button>
          </div>
        )}
      </ui.CardContent>
    </ui.Card>
  );
}
