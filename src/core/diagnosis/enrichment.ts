// @peakprep/mathmog/core/diagnosis — correct-but-enriched postscript (2D.3).
//
// Review proposal (c): when an untimed Drill / Free Play student types an
// accepted NON-CANONICAL member of a repeating fraction's family (a rounded
// form, a shorter truncation, or an over-precision transcription), one muted
// line tells the full story — the repeating form and why the sibling answers
// all count. Returns null for: the canonical truncation itself (the taught
// answer needs no enrichment), terminating fractions (wallpaper risk —
// reviewer-ratified), non-fraction item ids, and any value the grader does
// not accept. Speed suppression is the caller's job: the speed feedback
// block renders nothing extra mid-drill (2D.3 rail), so this never runs
// there.

import {
  acceptedDecimalFamily,
  fractionBasesByDenominator,
  fractionPrecisionPolicy,
  isFaithfulFractionTranscription,
  repeatingDecimalDisplay,
  roundFraction,
  truncateFraction,
} from '../math-problems';

/**
 * The muted one-liner under "✅ Correct!" for a non-canonical accepted
 * answer to a repeating-fraction decimal conversion, or null when no
 * enrichment should render. `typed` is the student's raw input (decimal
 * space — fracToPerc answers are deliberately not enriched in 2D.3).
 */
export const fractionEnrichmentPostscript = (itemId: string, typed: string): string | null => {
  const match = /^([1-9]\d*)\/([1-9]\d*)$/.exec(itemId);
  if (!match) return null;
  const num = Number(match[1]);
  const den = Number(match[2]);
  const base = fractionBasesByDenominator[den];
  if (!base?.repeating || !base.numerators.includes(num)) return null;
  const trimmed = typed.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return null;
  const accepted =
    acceptedDecimalFamily(num, den).includes(value) ||
    isFaithfulFractionTranscription(itemId, trimmed);
  if (!accepted) return null;
  const { floorPlaces, canonicalPlaces } = fractionPrecisionPolicy(den);
  if (value === truncateFraction(num, den, canonicalPlaces)) return null; // the taught answer
  const display = repeatingDecimalDisplay(num, den);
  const places = (trimmed.split('.')[1] ?? '').length;
  const truncatedAtTyped = truncateFraction(num, den, places);
  if (value === roundFraction(num, den, places) && value !== truncatedAtTyped) {
    return `${value} is the rounded form. The exact value is ${display}, so ${truncatedAtTyped} or ${value} both count.`;
  }
  const shortForm = truncateFraction(num, den, floorPlaces);
  const longerForm = truncateFraction(num, den, floorPlaces + 1);
  // "and so on", never "…": this is the one line whose job is to teach what
  // the ellipsis in the repeating display means — reusing it as list
  // elision would give it two meanings in one sentence (reviewer R3).
  return `Full story: ${itemId} = ${display} The digits repeat forever, so ${shortForm}, ${longerForm}, and so on all count.`;
};
