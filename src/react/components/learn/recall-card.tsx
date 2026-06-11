"use client";

import * as React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { diagnoseMiss } from '../../../core/diagnosis';
import type { MissDiagnosis } from '../../../core/diagnosis';
import type { MemorizeLearnTopic } from '../../../core/learn/mathmog-binding';
import type { LearnItem } from '../../../core/learn/types';
import { useMathmogUI } from '../../ui/provider';
import { gradeLearnRecall, learnAnswerRevealDisplay } from './grading';
import { useAnyKeyContinue } from './use-any-key-continue';

interface LearnRecallCardProps {
  item: LearnItem<string, number>;
  /** For the miss-identity line; null disables diagnosis (null = nothing extra). */
  topic: MemorizeLearnTopic | null;
  /**
   * Called once the student dismisses the feedback beat — the host applies
   * the machine action then. "Don't know?" reports `false` (a miss).
   */
  onAnswer: (correct: boolean) => void;
}

type RecallPhase = 'answering' | 'correct' | 'miss' | 'dont-know';

/**
 * The Recall tier: free recall with the Drill's number-input conventions
 * (type="number" for the mobile numeric keypad, centered text-xl input,
 * delayed autofocus, Enter to check — `problem-display.tsx` is the
 * register cousin). Grading is `gradeLearnRecall`: any accepted-family
 * member passes for fraction items (the live `FRACTION_ACCEPTED_DECIMALS`
 * table), exact match everywhere else. A wrong typed answer gets the same
 * `diagnoseMiss` identity line as a recognize miss — the 2D.2 diagnosers
 * cover free-recall wrong answers for TT/squares/cubes mechanically and
 * fractions via the detectors.
 */
export function LearnRecallCard({ item, topic, onAnswer }: LearnRecallCardProps) {
  const ui = useMathmogUI();
  const [typed, setTyped] = React.useState('');
  const [phase, setPhase] = React.useState<RecallPhase>('answering');
  const [diagnosis, setDiagnosis] = React.useState<MissDiagnosis | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const answering = phase === 'answering';

  React.useEffect(() => {
    // Delay focus slightly to help mobile browsers trigger the keyboard
    // (same convention as ProblemDisplay).
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const check = () => {
    if (!answering || typed.trim() === '') return;
    const verdict = gradeLearnRecall(item, typed);
    if (verdict.correct) {
      setPhase('correct');
      return;
    }
    setDiagnosis(
      topic !== null && verdict.value !== null
        ? diagnoseMiss(topic, item.id, verdict.value)
        : null
    );
    setPhase('miss');
  };

  const finish = () => onAnswer(phase === 'correct');

  useAnyKeyContinue(!answering, finish);

  return (
    <ui.Card
      data-tour="mathmog-learn-recall"
      className="border-t-2 border-t-amber-300 shadow-md"
    >
      <ui.CardContent className="pt-6 pb-8 space-y-6">
        <p className="text-2xl md:text-3xl font-bold text-center">
          {item.prompt} = ?
        </p>

        <div className="max-w-md mx-auto space-y-3">
          <ui.Input
            ref={inputRef}
            type="number"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') check();
            }}
            placeholder="Your answer..."
            data-tour="mathmog-learn-recall-input"
            className="p-4 text-xl text-center h-14 focus-visible:ring-amber-500"
            disabled={!answering}
          />

          {answering && (
            <>
              <ui.Button
                onClick={check}
                disabled={typed.trim() === ''}
                className="w-full text-lg h-14 sm:h-11"
              >
                <Check className="w-5 h-5 mr-2" /> Check Answer
              </ui.Button>
              <div className="flex justify-center">
                <ui.Button
                  variant="ghost"
                  size="sm"
                  className="h-11 sm:h-9"
                  onClick={() => setPhase('dont-know')}
                >
                  Don&apos;t know?
                </ui.Button>
              </div>
            </>
          )}
        </div>

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
