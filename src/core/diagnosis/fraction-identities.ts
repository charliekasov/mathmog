// @peakprep/mathmog/core/diagnosis — fraction error identities (Phase 2D.2).
//
// The hand pass over the 27 curated fraction pools: every distractor in
// `FRACTION_DISTRACTORS` (learn/modules/fractions.ts) is classified by the
// error it was curated to represent. This is a SIBLING table, not an
// annotation on the pools themselves — the pools are validated, reviewer-
// gated curation surfaces with composition tests, and they stay bare
// numbers. A consistency test pins this table against the pools both ways
// (no orphan annotations; every pool entry annotated or deliberately
// pinned as unannotated).
//
// The classifications come from the 2A.2 curation rationale (the fractions
// file header + the reviewer pass in
// HANDOFF-mathmog-redesign-phase-2a-2-fractions.md). Dual-identity entries
// (0.56 for 5/6 = digits slip AND 5/9's value) carry ONE primary identity —
// whichever stated fact teaches the sharper contrast; the message is true
// either way, which is the whole point of the fact-about-the-number rule.
//
// Messages are template-derived from the identity kind (diagnose.ts), so
// the register stays uniform and the reviewer gates templates + this
// classification table rather than ~110 bespoke strings.

/** Why a curated fraction distractor is wrong — the curation's error story. */
export type FractionDistractorIdentity =
  /** The value IS another fact's accepted decimal (or its truncation). */
  | { kind: 'other-fact'; fraction: string }
  /** Another fact's value, specifically the complement (d−n)/d. */
  | { kind: 'complement'; fraction: string }
  /** Sevenths: another rotation of the 142857 wheel. */
  | { kind: 'rotation'; fraction: string }
  /** Reads the fraction's own digits straight across (3/8 → 0.38). */
  | { kind: 'digits' }
  /** A correct form with two digits swapped (0.143 → 0.134). */
  | { kind: 'digit-swap'; of: number }
  /** Percent-magnitude slip (1/5 → 0.05, i.e. 5% for 20%). */
  | { kind: 'percent-slip' }
  /** The numerator or denominator alone, read as a decimal (1/4 → 0.4). */
  | { kind: 'part-as-decimal'; part: 'numerator' | 'denominator' };

export interface FractionDistractorIdentityEntry {
  /** The pool value this identity belongs to (exact match at lookup). */
  value: number;
  identity: FractionDistractorIdentity;
}

/**
 * Keyed by item id ("5/6"). REPEATING-denominator entries whose value is
 * also a faithful truncation/rounding of the item below the precision
 * floor (0.4 for 3/7, 0.2 for 1/6, 0.6 for 4/7) are shadowed at lookup
 * time by the under-precision detector, which outranks the pool there —
 * validating a right start beats naming a different fact when both are
 * true. They stay annotated so the table fully mirrors the pools. For
 * terminating denominators the pool identity wins instead (rationale in
 * diagnose.ts).
 *
 * Deliberately unannotated (no defensible single error story, or the
 * detector already produces the best line): 0.35 for 3/8 (generic
 * re-teach), 0.45 for 4/9 (last-digit detector covers it).
 */
export const FRACTION_DISTRACTOR_IDENTITIES: Record<string, FractionDistractorIdentityEntry[]> = {
  '1/2': [
    { value: 0.12, identity: { kind: 'digits' } },
    { value: 0.2, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.25, identity: { kind: 'other-fact', fraction: '1/4' } },
    { value: 0.75, identity: { kind: 'other-fact', fraction: '3/4' } },
  ],
  '1/3': [
    { value: 0.67, identity: { kind: 'complement', fraction: '2/3' } },
    { value: 0.66, identity: { kind: 'complement', fraction: '2/3' } },
    { value: 0.13, identity: { kind: 'digits' } },
    { value: 0.25, identity: { kind: 'other-fact', fraction: '1/4' } },
    { value: 0.44, identity: { kind: 'other-fact', fraction: '4/9' } },
  ],
  '2/3': [
    { value: 0.33, identity: { kind: 'complement', fraction: '1/3' } },
    { value: 0.23, identity: { kind: 'digits' } },
    { value: 0.75, identity: { kind: 'other-fact', fraction: '3/4' } },
    { value: 0.56, identity: { kind: 'other-fact', fraction: '5/9' } },
  ],
  '1/4': [
    { value: 0.4, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.14, identity: { kind: 'digits' } },
    { value: 0.75, identity: { kind: 'complement', fraction: '3/4' } },
    { value: 0.2, identity: { kind: 'other-fact', fraction: '1/5' } },
  ],
  '3/4': [
    { value: 0.25, identity: { kind: 'complement', fraction: '1/4' } },
    { value: 0.34, identity: { kind: 'digits' } },
    { value: 0.8, identity: { kind: 'other-fact', fraction: '4/5' } },
    { value: 0.67, identity: { kind: 'other-fact', fraction: '2/3' } },
  ],
  '1/5': [
    { value: 0.5, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.15, identity: { kind: 'digits' } },
    { value: 0.25, identity: { kind: 'other-fact', fraction: '1/4' } },
    { value: 0.05, identity: { kind: 'percent-slip' } },
  ],
  '2/5': [
    { value: 0.25, identity: { kind: 'digits' } },
    { value: 0.5, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.2, identity: { kind: 'part-as-decimal', part: 'numerator' } },
    { value: 0.6, identity: { kind: 'complement', fraction: '3/5' } },
  ],
  '3/5': [
    { value: 0.35, identity: { kind: 'digits' } },
    { value: 0.4, identity: { kind: 'complement', fraction: '2/5' } },
    { value: 0.3, identity: { kind: 'part-as-decimal', part: 'numerator' } },
    { value: 0.57, identity: { kind: 'other-fact', fraction: '4/7' } },
    { value: 0.75, identity: { kind: 'other-fact', fraction: '3/4' } },
  ],
  '4/5': [
    { value: 0.45, identity: { kind: 'digits' } },
    { value: 0.4, identity: { kind: 'part-as-decimal', part: 'numerator' } },
    { value: 0.2, identity: { kind: 'complement', fraction: '1/5' } },
    { value: 0.75, identity: { kind: 'other-fact', fraction: '3/4' } },
    { value: 0.875, identity: { kind: 'other-fact', fraction: '7/8' } },
  ],
  '1/6': [
    { value: 0.6, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.125, identity: { kind: 'other-fact', fraction: '1/8' } },
    // shadowed by under-precision (0.2 = 1/6 rounded at one place)
    { value: 0.2, identity: { kind: 'other-fact', fraction: '1/5' } },
    { value: 0.667, identity: { kind: 'other-fact', fraction: '2/3' } },
  ],
  '5/6': [
    { value: 0.56, identity: { kind: 'digits' } },
    { value: 0.875, identity: { kind: 'other-fact', fraction: '7/8' } },
    { value: 0.6, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.857, identity: { kind: 'other-fact', fraction: '6/7' } },
  ],
  '1/7': [
    { value: 0.17, identity: { kind: 'digits' } },
    { value: 0.125, identity: { kind: 'other-fact', fraction: '1/8' } },
    { value: 0.134, identity: { kind: 'digit-swap', of: 0.143 } },
    { value: 0.286, identity: { kind: 'rotation', fraction: '2/7' } },
  ],
  '2/7': [
    { value: 0.27, identity: { kind: 'digits' } },
    { value: 0.143, identity: { kind: 'rotation', fraction: '1/7' } },
    { value: 0.268, identity: { kind: 'digit-swap', of: 0.286 } },
    { value: 0.25, identity: { kind: 'other-fact', fraction: '1/4' } },
    { value: 0.429, identity: { kind: 'rotation', fraction: '3/7' } },
  ],
  '3/7': [
    { value: 0.37, identity: { kind: 'digits' } },
    { value: 0.492, identity: { kind: 'digit-swap', of: 0.429 } },
    { value: 0.571, identity: { kind: 'rotation', fraction: '4/7' } },
    // shadowed by under-precision (0.4 = 3/7 truncated at one place)
    { value: 0.4, identity: { kind: 'other-fact', fraction: '2/5' } },
  ],
  '4/7': [
    { value: 0.47, identity: { kind: 'digits' } },
    { value: 0.517, identity: { kind: 'digit-swap', of: 0.571 } },
    { value: 0.429, identity: { kind: 'rotation', fraction: '3/7' } },
    // shadowed by under-precision (0.6 = 4/7 rounded at one place)
    { value: 0.6, identity: { kind: 'other-fact', fraction: '3/5' } },
  ],
  '5/7': [
    { value: 0.57, identity: { kind: 'digits' } },
    { value: 0.741, identity: { kind: 'digit-swap', of: 0.714 } },
    { value: 0.75, identity: { kind: 'other-fact', fraction: '3/4' } },
    { value: 0.286, identity: { kind: 'rotation', fraction: '2/7' } },
  ],
  '6/7': [
    { value: 0.67, identity: { kind: 'digits' } },
    { value: 0.875, identity: { kind: 'other-fact', fraction: '7/8' } },
    { value: 0.833, identity: { kind: 'other-fact', fraction: '5/6' } },
    { value: 0.143, identity: { kind: 'rotation', fraction: '1/7' } },
  ],
  '1/8': [
    { value: 0.8, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.18, identity: { kind: 'digits' } },
    { value: 0.25, identity: { kind: 'other-fact', fraction: '1/4' } },
    { value: 0.375, identity: { kind: 'other-fact', fraction: '3/8' } },
    { value: 0.111, identity: { kind: 'other-fact', fraction: '1/9' } },
  ],
  '3/8': [
    { value: 0.38, identity: { kind: 'digits' } },
    { value: 0.625, identity: { kind: 'complement', fraction: '5/8' } },
    { value: 0.357, identity: { kind: 'digit-swap', of: 0.375 } },
    // 0.35: deliberately unannotated
  ],
  '5/8': [
    { value: 0.58, identity: { kind: 'digits' } },
    { value: 0.375, identity: { kind: 'complement', fraction: '3/8' } },
    { value: 0.652, identity: { kind: 'digit-swap', of: 0.625 } },
    { value: 0.6, identity: { kind: 'other-fact', fraction: '3/5' } },
  ],
  '7/8': [
    { value: 0.78, identity: { kind: 'digits' } },
    { value: 0.857, identity: { kind: 'other-fact', fraction: '6/7' } },
    { value: 0.125, identity: { kind: 'complement', fraction: '1/8' } },
    { value: 0.8, identity: { kind: 'other-fact', fraction: '4/5' } },
    { value: 0.89, identity: { kind: 'other-fact', fraction: '8/9' } },
  ],
  '1/9': [
    { value: 0.19, identity: { kind: 'digits' } },
    { value: 0.9, identity: { kind: 'part-as-decimal', part: 'denominator' } },
    { value: 0.125, identity: { kind: 'other-fact', fraction: '1/8' } },
    { value: 0.22, identity: { kind: 'other-fact', fraction: '2/9' } },
    { value: 0.09, identity: { kind: 'percent-slip' } },
  ],
  '2/9': [
    { value: 0.29, identity: { kind: 'digits' } },
    { value: 0.25, identity: { kind: 'other-fact', fraction: '1/4' } },
    { value: 0.11, identity: { kind: 'other-fact', fraction: '1/9' } },
    { value: 0.286, identity: { kind: 'other-fact', fraction: '2/7' } },
  ],
  '4/9': [
    { value: 0.49, identity: { kind: 'digits' } },
    { value: 0.33, identity: { kind: 'other-fact', fraction: '1/3' } },
    { value: 0.429, identity: { kind: 'other-fact', fraction: '3/7' } },
    // 0.45: deliberately unannotated (last-digit detector covers it)
  ],
  '5/9': [
    { value: 0.59, identity: { kind: 'digits' } },
    { value: 0.44, identity: { kind: 'other-fact', fraction: '4/9' } },
    { value: 0.571, identity: { kind: 'other-fact', fraction: '4/7' } },
    { value: 0.65, identity: { kind: 'digit-swap', of: 0.56 } },
  ],
  '7/9': [
    { value: 0.79, identity: { kind: 'digits' } },
    { value: 0.875, identity: { kind: 'other-fact', fraction: '7/8' } },
    { value: 0.22, identity: { kind: 'complement', fraction: '2/9' } },
    { value: 0.87, identity: { kind: 'other-fact', fraction: '7/8' } },
  ],
  '8/9': [
    { value: 0.98, identity: { kind: 'digit-swap', of: 0.89 } },
    { value: 0.875, identity: { kind: 'other-fact', fraction: '7/8' } },
    { value: 0.11, identity: { kind: 'complement', fraction: '1/9' } },
    { value: 0.83, identity: { kind: 'other-fact', fraction: '5/6' } },
  ],
};
