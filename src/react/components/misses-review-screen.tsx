"use client";

import * as React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { simplifyFraction } from '../../core/math-problems';
import type { MissedMathmogProblem } from '../../core/miss-types';
import { useMathmogUI } from '../ui/provider';

interface MissesReviewScreenProps {
  misses: MissedMathmogProblem[];
  onDone: () => void;
}

/**
 * Self-contained retry validator. Dispatches on the `validationKind`
 * captured at miss-time (problem-context.tsx's six-branch validation).
 * Multi-text and root-estimation kinds are filtered out at the queue
 * level — they're not safe to re-implement here.
 *
 * Returns `{ isCorrect, deviationPercent? }`. `deviationPercent` is set
 * only for the 'estimation' branch, mirroring the live validator's
 * behavior.
 *
 * PINNED: the `multi-text` and `root-estimation` filter (below) is current
 * behavior — extension is deferred to a follow-up PR.
 */
function checkRetry(
  miss: MissedMathmogProblem,
  retry: string
): { isCorrect: boolean; deviationPercent?: number } {
  const trimmed = retry.trim().toLowerCase();
  if (trimmed === '') return { isCorrect: false };

  const kind = miss.validationKind ?? 'default';

  if (kind === 'estimation' && typeof miss.correctAnswerNumeric === 'number') {
    const userNum = parseFloat(trimmed);
    if (isNaN(userNum)) return { isCorrect: false };
    const exact = miss.correctAnswerNumeric;
    const deviation = exact === 0 ? Math.abs(userNum) : Math.abs((userNum - exact) / exact);
    const deviationPercent = Math.round(deviation * 1000) / 10;
    return { isCorrect: deviation <= 0.10, deviationPercent };
  }

  if (kind === 'fraction') {
    const parts = trimmed.split('/');
    if (parts.length !== 2) return { isCorrect: false };
    const num = parseInt(parts[0].trim(), 10);
    const den = parseInt(parts[1].trim(), 10);
    if (isNaN(num) || isNaN(den) || den === 0) return { isCorrect: false };
    return { isCorrect: simplifyFraction(num, den) === miss.correctAnswer };
  }

  if (kind === 'number' && typeof miss.correctAnswerNumeric === 'number') {
    const userNum = parseFloat(trimmed);
    if (isNaN(userNum)) {
      return { isCorrect: trimmed === miss.correctAnswer.toLowerCase() };
    }
    return { isCorrect: Math.abs(userNum - miss.correctAnswerNumeric) < 0.0001 };
  }

  // default / number-fallback / pre-Slice-2a records without validationKind
  return { isCorrect: trimmed === miss.correctAnswer.toLowerCase() };
}

interface PerMissProps {
  miss: MissedMathmogProblem;
  onAdvance: () => void;
}

function PerMiss({ miss, onAdvance }: PerMissProps) {
  const ui = useMathmogUI();
  const [retry, setRetry] = React.useState('');
  const [revealed, setRevealed] = React.useState(false);
  const [retryAttempted, setRetryAttempted] = React.useState(false);
  const [retryFeedback, setRetryFeedback] = React.useState<
    null | { isCorrect: boolean; deviationPercent?: number }
  >(null);

  const handleTryAgain = () => {
    const result = checkRetry(miss, retry);
    setRetryFeedback(result);
    setRetryAttempted(true);
    if (!result.isCorrect) {
      // Per Decision #4: one retry allowed; second wrong auto-reveals so
      // the student isn't stuck in a loop.
      setRevealed(true);
    }
  };

  const handleShowAnswer = () => {
    setRevealed(true);
  };

  const studentAnswerLabel =
    miss.studentAnswer && miss.studentAnswer.trim() !== ''
      ? `You said: ${miss.studentAnswer}`
      : 'You left this blank.';

  return (
    <ui.Card className="border-t-2 border-t-amber-300 shadow-sm">
      <ui.CardContent className="pt-6 space-y-4">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            From your drill
          </div>
          <p className="text-xl md:text-2xl font-bold">{miss.prompt}</p>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          {studentAnswerLabel}
        </p>

        {!revealed && !retryFeedback?.isCorrect ? (
          <div className="max-w-md mx-auto space-y-3">
            <ui.Input
              value={retry}
              onChange={(e) => setRetry(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && retry.trim() !== '' && !retryAttempted) {
                  handleTryAgain();
                }
              }}
              placeholder="Try the answer again..."
              className="p-4 text-lg text-center h-14 focus-visible:ring-amber-500"
              disabled={retryAttempted}
              autoFocus
            />
            {retryFeedback && !retryFeedback.isCorrect && (
              <div className="text-sm text-amber-700 dark:text-amber-500 text-center">
                Not quite. Here&apos;s the answer.
              </div>
            )}
            {!retryAttempted && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <ui.Button
                  onClick={handleTryAgain}
                  disabled={retry.trim() === ''}
                  className="flex-1 sm:flex-initial sm:min-w-[140px]"
                >
                  <Check className="w-4 h-4 mr-2" /> Try again
                </ui.Button>
                <ui.Button onClick={handleShowAnswer} variant="outline">
                  Show answer
                </ui.Button>
              </div>
            )}
          </div>
        ) : null}

        {revealed && (
          <ui.Alert>
            <ui.AlertTitle>Answer</ui.AlertTitle>
            <ui.AlertDescription className="font-medium">
              {miss.correctAnswer}
            </ui.AlertDescription>
          </ui.Alert>
        )}

        {retryFeedback?.isCorrect && (
          <div className="text-center text-lg font-semibold text-green-600">
            <span className="text-2xl">✅</span> Correct — nice recovery!
            {retryFeedback.deviationPercent !== undefined &&
              retryFeedback.deviationPercent > 0 && (
                <div className="text-sm text-muted-foreground font-normal mt-1">
                  {retryFeedback.deviationPercent}% off — within 10% counts as correct.
                </div>
              )}
          </div>
        )}

        {(revealed || retryFeedback?.isCorrect) && miss.explanation && (
          <p
            data-noah="mathmog-miss-explanation"
            className="text-sm text-muted-foreground mt-2"
          >
            {miss.explanation}
          </p>
        )}

        {miss.deviationPercent !== undefined && revealed && !retryFeedback?.isCorrect && (
          <p className="text-xs text-muted-foreground text-center">
            On your first try you were {miss.deviationPercent}% off. Within 10% counts as correct.
          </p>
        )}

        <div className="flex justify-center pt-2">
          <ui.Button onClick={onAdvance} variant={revealed || retryFeedback?.isCorrect ? 'default' : 'ghost'}>
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </ui.Button>
        </div>
      </ui.CardContent>
    </ui.Card>
  );
}

/**
 * Inline review surface that walks the student through each miss with
 * an optional retry attempt + reveal. Filters out kinds whose retry
 * validation we can't safely re-implement (multi-text, root-estimation).
 *
 * Reused by both the free-practice Drill flow (inserted between the
 * end of the drill and the quiet completion screen) and the homework
 * flow (entered via a button on the celebratory completion screen).
 */
export function MissesReviewScreen({ misses, onDone }: MissesReviewScreenProps) {
  const ui = useMathmogUI();
  const reviewable = React.useMemo(
    () =>
      misses.filter(
        (m) => m.validationKind !== 'multi-text' && m.validationKind !== 'root-estimation'
      ),
    [misses]
  );
  const skippedCount = misses.length - reviewable.length;
  const [index, setIndex] = React.useState(0);
  const [keyEpoch, setKeyEpoch] = React.useState(0);

  const handleAdvance = React.useCallback(() => {
    if (index + 1 >= reviewable.length) {
      onDone();
      return;
    }
    setIndex((i) => i + 1);
    setKeyEpoch((k) => k + 1);
  }, [index, reviewable.length, onDone]);

  if (reviewable.length === 0) {
    // Everything was filtered out — show an honest note and bail.
    return (
      <div
        data-noah="mathmog-misses-review"
        data-tour="mathmog-misses-review"
        className="text-center space-y-4 py-8 max-w-md mx-auto"
      >
        <h2 className="text-xl font-semibold">Nothing to replay</h2>
        <p className="text-sm text-muted-foreground">
          Your misses used answer formats this review can&apos;t replay. Take a
          look at the explanations on the drill if you want a second pass.
        </p>
        <ui.Button onClick={onDone}>Done</ui.Button>
      </div>
    );
  }

  const currentMiss = reviewable[index];

  return (
    <div
      data-noah="mathmog-misses-review"
      data-tour="mathmog-misses-review"
      className="space-y-4"
    >
      <div className="text-center text-sm text-muted-foreground">
        Reviewing miss {index + 1} of {reviewable.length}
        {skippedCount > 0 && (
          <span className="block text-xs mt-1">
            {skippedCount} miss{skippedCount === 1 ? '' : 'es'} skipped — these used answer formats the review can&apos;t replay.
          </span>
        )}
      </div>
      <PerMiss key={keyEpoch} miss={currentMiss} onAdvance={handleAdvance} />
    </div>
  );
}
