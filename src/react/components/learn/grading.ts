// @peakprep/mathmog/react/components/learn — pure support logic for the
// Learn tier components (Phase 2A.4).
//
// The 2A.3 machine deliberately never sees the student's answer — grading is
// the caller's seam (machine.ts header). This file IS that caller's grader:
// - Recall acceptance comes from the item's accepted family. For fraction
//   items that is the live `FRACTION_ACCEPTED_DECIMALS` table (derived from
//   the 2D.1 precision policy, so Learn and Drill literally cannot disagree);
//   every other topic grades exact.
// - Answer display: items with a multi-member accepted family are exactly
//   the repeating decimals, and teach/reveal surfaces render them with
//   `repeatingDecimalDisplay` ("0.8333…") — the honest full value, matching
//   the 2D.1 explanation strings, instead of a bare truncation that would
//   read as "the digits stop here". Terminating fractions and non-fraction
//   answers render exactly.

import {
  MEMORIZE_LEARN_TOPICS,
  parseMathmogLearnModuleId,
} from '../../../core/learn/mathmog-binding';
import type { MemorizeLearnTopic } from '../../../core/learn/mathmog-binding';
import { FRACTION_ACCEPTED_DECIMALS } from '../../../core/learn/modules';
import type { LearnItem } from '../../../core/learn/types';
import {
  fractionPrecisionPolicy,
  repeatingDecimalDisplay,
  roundFraction,
  truncateFraction,
} from '../../../core/math-problems';

/**
 * The topic segment of a Learn module id, narrowed to the diagnosable
 * union — the shape `diagnoseMiss` takes. Null when the id doesn't parse or
 * the topic isn't a Memorize topic (no diagnosis; the See re-teach is the
 * designed fallback).
 */
export function learnModuleTopic(moduleId: string): MemorizeLearnTopic | null {
  const parsed = parseMathmogLearnModuleId(moduleId);
  if (parsed === null) return null;
  return (MEMORIZE_LEARN_TOPICS as readonly string[]).includes(parsed.topic)
    ? (parsed.topic as MemorizeLearnTopic)
    : null;
}

/**
 * Every value the Recall grader accepts for an item: the live Drill family
 * for fraction items (any `FRACTION_ACCEPTED_DECIMALS` member — the 2A.2 /
 * 2D.1 contract), the exact answer for everything else.
 */
export function acceptedLearnAnswers(item: LearnItem<string, number>): number[] {
  return FRACTION_ACCEPTED_DECIMALS[item.id] ?? [item.answer];
}

export interface LearnRecallVerdict {
  correct: boolean;
  /** The parsed numeric answer (for `diagnoseMiss`); null if unparseable. */
  value: number | null;
}

/** "5/6" → { num: 5, den: 6 }; null for non-fraction item ids. */
function parseFractionItemId(id: string): { num: number; den: number } | null {
  const match = /^(\d+)\/(\d+)$/.exec(id);
  return match ? { num: Number(match[1]), den: Number(match[2]) } : null;
}

/**
 * Upper bound on typed decimal places the transcription check will verify.
 * Past ~10 places float comparison stops being trustworthy; nobody
 * faithfully transcribes that far from a teach card.
 */
const MAX_TRANSCRIPTION_PLACES = 10;

/** Grades a Recall-tier typed answer. Blank or non-numeric input is a miss. */
export function gradeLearnRecall(
  item: LearnItem<string, number>,
  typed: string
): LearnRecallVerdict {
  const trimmed = typed.trim();
  if (trimmed === '') return { correct: false, value: null };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { correct: false, value: null };
  if (acceptedLearnAnswers(item).includes(value)) return { correct: true, value };

  // Faithful-transcription acceptance (2A.4 math-ed reviewer, REQUIRED):
  // the teach card displays the full repeating form ("0.6666…"), so a
  // correct truncation or rounding of the true value at the typed
  // precision — any precision from the floor up — grades correct.
  // More-correct is never wrong; the product never grades its own teach
  // card's digits as a miss. Note this is Learn-side only: the Drill's
  // family (ceiling = canonical + 1) is 2D.1-ratified and untouched —
  // unification is a flagged 2D.3 question.
  const family = FRACTION_ACCEPTED_DECIMALS[item.id];
  if (family !== undefined && family.length > 1) {
    const frac = parseFractionItemId(item.id);
    const places = (trimmed.split('.')[1] ?? '').length;
    if (
      frac !== null &&
      places >= fractionPrecisionPolicy(frac.den).floorPlaces &&
      places <= MAX_TRANSCRIPTION_PLACES &&
      (value === truncateFraction(frac.num, frac.den, places) ||
        value === roundFraction(frac.num, frac.den, places))
    ) {
      return { correct: true, value };
    }
  }
  return { correct: false, value };
}

/**
 * How an item's answer renders on teach and reveal surfaces. A multi-member
 * accepted family marks a repeating decimal (terminating fractions and
 * non-fraction topics are single-member by construction), rendered as the
 * full repeating form with trailing ellipsis ("0.8333…").
 */
export function learnAnswerDisplay(item: LearnItem<string, number>): string {
  const family = FRACTION_ACCEPTED_DECIMALS[item.id];
  if (family !== undefined && family.length > 1) {
    const frac = parseFractionItemId(item.id);
    if (frac) return repeatingDecimalDisplay(frac.num, frac.den);
  }
  return String(item.answer);
}

/**
 * The miss/decline reveal variant: for repeating decimals, the repeating
 * form plus the canonical anchor — "0.6666… (0.66 or 0.67 at 2 decimal
 * places)" — so the reveal and the Recognize option (the bare canonical)
 * never read as two different right answers on one screen, and the Recall
 * student knows what a sufficient typed answer looks like (2A.4 math-ed
 * reviewer recommendation; truncation-first order per 2D.1). Everything
 * else renders as `learnAnswerDisplay`.
 */
export function learnAnswerRevealDisplay(item: LearnItem<string, number>): string {
  const family = FRACTION_ACCEPTED_DECIMALS[item.id];
  if (family === undefined || family.length <= 1) return learnAnswerDisplay(item);
  const frac = parseFractionItemId(item.id);
  if (!frac) return learnAnswerDisplay(item);
  const { canonicalPlaces } = fractionPrecisionPolicy(frac.den);
  const truncated = truncateFraction(frac.num, frac.den, canonicalPlaces);
  const rounded = roundFraction(frac.num, frac.den, canonicalPlaces);
  const forms = truncated === rounded ? `${truncated}` : `${truncated} or ${rounded}`;
  const placeWord = canonicalPlaces === 1 ? 'decimal place' : 'decimal places';
  return `${repeatingDecimalDisplay(frac.num, frac.den)} (${forms} at ${canonicalPlaces} ${placeWord})`;
}
