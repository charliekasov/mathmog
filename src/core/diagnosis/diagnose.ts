// @peakprep/mathmog/core/diagnosis — diagnosers (Phase 2D.2).
//
// `diagnoseMiss(topic, itemId, wrongAnswer)` is the pure reverse lookup
// from a wrong answer to its error story. Per topic:
// - times tables / squares / cubes: identities are MECHANICALLY derived
//   (wrong = a×(b±1), (n±1)², n²-for-n³ …) — no curation, so the lookup
//   also covers free-recall wrong answers that never appeared in a pool;
// - fractions: hand-annotated pool identities (fraction-identities.ts)
//   plus two curation-free detectors:
//   - UNDER-PRECISION: a faithful truncation/rounding below the precision
//     floor (0.5 for 5/9) — exactly the students the 2D.1 tightening
//     de-endorses; the copy validates the right start and teaches the
//     repeat.
//   - LAST-DIGIT SLIP: matches the true value at the preceding digits but
//     is off by one in the final digit (0.84 for 5/6).
//   Precedence: accepted → no diagnosis; then for repeating denominators
//   under-precision → pool identity → last-digit, while for terminating
//   denominators the pool identity outranks under-precision (rationale at
//   `diagnoseFractionMiss`); null = generic re-teach — never guess.
//
// Item ids are the Learn item ids ("6x8", "7^2", "7^3", "5/6"), which
// double as fact ids; the Drill side maps its Problem back to (topic,
// itemId) at capture time (2D.3). Identities attach to the (fact, topic)
// pair — "4^2" in squares diagnoses square-shaped confusions, "4x4" in
// times tables product-shaped ones — matching the 2A.2 curation precedent.

import {
  acceptedDecimalFamily,
  fractionBasesByDenominator,
  fractionPrecisionPolicy,
  repeatingDecimalDisplay,
  roundFraction,
  truncateFraction,
} from '../math-problems';
import type { MemorizeLearnTopic } from '../learn/mathmog-binding';
import type { MissDiagnosis } from './types';
import type { FractionDistractorIdentity } from './fraction-identities';
import { FRACTION_DISTRACTOR_IDENTITIES } from './fraction-identities';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Fractional digits of a number as the student typed it ("0.84" → 2). */
const decimalPlaces = (v: number): number => (String(v).split('.')[1] ?? '').length;

const sortedDigits = (v: number): string =>
  String(v).replace('.', '').split('').sort().join('');

/** Same digit multiset, different order — the transposition check. */
const isDigitSwap = (wrong: number, target: number): boolean =>
  wrong !== target &&
  String(target).replace('.', '').length > 1 &&
  sortedDigits(wrong) === sortedDigits(target);

/** Close a clause that may end in a repeating-display ellipsis. */
const endSentence = (text: string): string => (text.endsWith('…') ? text : `${text}.`);

// ---------------------------------------------------------------------------
// Times tables — wrong = (a±i) × (b±j), an addition slip, or a digit swap.
// ---------------------------------------------------------------------------

/** Search order IS the precedence: closest, most teachable identity first. */
const TT_OFFSETS: ReadonlyArray<{ da: number; db: number; code: string }> = [
  { da: 0, db: -1, code: 'tt-adjacent-product' },
  { da: 0, db: 1, code: 'tt-adjacent-product' },
  { da: -1, db: 0, code: 'tt-adjacent-product' },
  { da: 1, db: 0, code: 'tt-adjacent-product' },
  { da: -1, db: 1, code: 'tt-neighbor-fact' },
  { da: 1, db: -1, code: 'tt-neighbor-fact' },
  { da: -1, db: -1, code: 'tt-near-product' },
  { da: 1, db: 1, code: 'tt-near-product' },
  { da: 0, db: -2, code: 'tt-near-product' },
  { da: 0, db: 2, code: 'tt-near-product' },
  { da: -2, db: 0, code: 'tt-near-product' },
  { da: 2, db: 0, code: 'tt-near-product' },
];

const diagnoseTimesTablesMiss = (a: number, b: number, wrong: number): MissDiagnosis | null => {
  const answer = a * b;
  for (const { da, db, code } of TT_OFFSETS) {
    const f1 = a + da;
    const f2 = b + db;
    if (f1 < 1 || f2 < 1 || f1 * f2 !== wrong) continue;
    if (code === 'tt-adjacent-product') {
      // One factor moved by one row — name the derivation strategy: the
      // unchanged factor is the step between the two products.
      const step = da === 0 ? a : b;
      const direction = wrong > answer ? 'less' : 'more';
      return {
        code,
        message: `${wrong} is ${f1} × ${f2}. ${a} × ${b} is one ${step} ${direction}: ${answer}.`,
      };
    }
    if (code === 'tt-neighbor-fact') {
      return {
        code,
        message: `${wrong} is ${f1} × ${f2} — a neighbor fact. ${a} × ${b} = ${answer}.`,
      };
    }
    return {
      code,
      message: `${wrong} is ${f1} × ${f2}. ${a} × ${b} = ${answer}.`,
    };
  }
  if (wrong === a + b) {
    return {
      code: 'tt-added-instead',
      message: `${wrong} is ${a} + ${b}. Multiplying: ${a} × ${b} = ${answer}.`,
    };
  }
  if (isDigitSwap(wrong, answer)) {
    return {
      code: 'tt-digit-swap',
      message: `${wrong} is ${answer} with the digits swapped. ${a} × ${b} = ${answer}.`,
    };
  }
  return null;
};

// ---------------------------------------------------------------------------
// Perfect squares — adjacent squares, n(n±1), the cube slip, digit swaps.
// ---------------------------------------------------------------------------

const diagnoseSquareMiss = (n: number, wrong: number): MissDiagnosis | null => {
  const answer = n * n;
  for (const m of [n - 1, n + 1]) {
    if (m >= 1 && m * m === wrong) {
      return { code: 'sq-adjacent-square', message: `${wrong} is ${m}². ${n}² = ${answer}.` };
    }
  }
  for (const m of [n - 1, n + 1]) {
    if (m >= 1 && n * m === wrong) {
      const relation = m < n ? 'short of' : 'past';
      return {
        code: 'sq-row-product',
        message: `${wrong} is ${n} × ${m} — one ${n} ${relation} ${n} × ${n}. ${n}² = ${answer}.`,
      };
    }
  }
  if (n >= 2 && wrong === n * n * n) {
    return {
      code: 'sq-cube-slip',
      message: `${wrong} is ${n}³ — three ${n}s multiplied. Squaring uses two: ${n} × ${n} = ${answer}.`,
    };
  }
  for (const m of [n - 2, n + 2]) {
    if (m >= 1 && m * m === wrong) {
      return { code: 'sq-near-square', message: `${wrong} is ${m}². ${n}² = ${answer}.` };
    }
  }
  for (const m of [n - 2, n + 2]) {
    if (m >= 1 && n * m === wrong) {
      return {
        code: 'sq-near-product',
        message: `${wrong} is ${n} × ${m}. ${n}² is ${n} × ${n}: ${answer}.`,
      };
    }
  }
  if (isDigitSwap(wrong, answer)) {
    return {
      code: 'sq-digit-swap',
      message: `${wrong} is ${answer} with its digits rearranged. ${n}² = ${answer}.`,
    };
  }
  return null;
};

// ---------------------------------------------------------------------------
// Perfect cubes — the n² slip first (the single most common cube error),
// then adjacent cubes, ×3-style slips, wrong exponents, digit swaps.
// ---------------------------------------------------------------------------

const diagnoseCubeMiss = (n: number, wrong: number): MissDiagnosis | null => {
  const answer = n * n * n;
  if (n >= 2 && wrong === n * n) {
    return {
      code: 'cb-square-slip',
      message: `${wrong} is ${n}² — two ${n}s. A cube multiplies three: ${n} × ${n} × ${n} = ${answer}.`,
    };
  }
  for (const m of [n - 1, n + 1]) {
    if (m >= 1 && m * m * m === wrong) {
      return { code: 'cb-adjacent-cube', message: `${wrong} is ${m}³. ${n}³ = ${answer}.` };
    }
  }
  if (wrong === 3 * n && wrong !== answer) {
    return {
      code: 'cb-times-three',
      message: `${wrong} is ${n} × 3. ${n}³ means ${n} × ${n} × ${n} = ${answer}.`,
    };
  }
  for (const k of [2, 3]) {
    if (n >= 2 && wrong === n * n * k) {
      return {
        code: 'cb-square-multiple',
        message: `${wrong} is ${n}² × ${k}. Cubing multiplies by ${n} again: ${n}² × ${n} = ${answer}.`,
      };
    }
  }
  for (const [power, label] of [[4, '⁴ — four'], [5, '⁵ — five']] as const) {
    if (n >= 2 && wrong === n ** power) {
      return {
        code: 'cb-power-slip',
        message: `${wrong} is ${n}${label} ${n}s. A cube is three: ${n} × ${n} × ${n} = ${answer}.`,
      };
    }
  }
  for (const m of [n - 2, n + 2]) {
    if (m >= 1 && m * m * m === wrong) {
      return { code: 'cb-near-cube', message: `${wrong} is ${m}³. ${n}³ = ${answer}.` };
    }
  }
  if (isDigitSwap(wrong, answer)) {
    return {
      code: 'cb-digit-swap',
      message: `${wrong} is ${answer} with its digits rearranged. ${n}³ = ${answer}.`,
    };
  }
  return null;
};

// ---------------------------------------------------------------------------
// Fractions — detectors + the hand-annotated pool identities.
// ---------------------------------------------------------------------------

/** "0.8333…" for repeating fractions, "0.375" for terminating ones. */
const fractionValueDisplay = (num: number, den: number): string => {
  const { repeating, precision } = fractionBasesByDenominator[den];
  return repeating
    ? repeatingDecimalDisplay(num, den)
    : String(truncateFraction(num, den, precision));
};

/** "0.55 or 0.56" — accepted forms at one precision, truncation first. */
const acceptedFormsAt = (num: number, den: number, places: number): string => {
  const truncated = truncateFraction(num, den, places);
  const rounded = roundFraction(num, den, places);
  return truncated === rounded ? `${truncated}` : `${truncated} or ${rounded}`;
};

const parseFractionId = (itemId: string): { num: number; den: number } | null => {
  const match = /^([1-9]\d*)\/([1-9]\d*)$/.exec(itemId);
  if (!match) return null;
  const num = Number(match[1]);
  const den = Number(match[2]);
  if (!fractionBasesByDenominator[den]?.numerators.includes(num)) return null;
  return { num, den };
};

/**
 * Under-precision: a faithful truncation or rounding of the true value at
 * a precision below the floor. The copy validates the right start and
 * teaches the repeat (master plan 2D block, Charlie's 0.5-for-5/9 case).
 */
const detectUnderPrecision = (num: number, den: number, wrong: number): MissDiagnosis | null => {
  const { repeating } = fractionBasesByDenominator[den];
  const { floorPlaces, canonicalPlaces } = fractionPrecisionPolicy(den);
  const places = decimalPlaces(wrong);
  if (wrong <= 0 || wrong >= 1 || places < 1 || places >= floorPlaces) return null;
  const itemId = `${num}/${den}`;
  const display = fractionValueDisplay(num, den);
  if (wrong === truncateFraction(num, den, places)) {
    return {
      code: 'frac-under-precision',
      message: repeating
        ? `Right idea — ${itemId} starts with ${wrong}, but the digits keep going: ${display} At ${canonicalPlaces} decimals, that's ${acceptedFormsAt(num, den, canonicalPlaces)}.`
        : `Right start — ${itemId} does begin with ${wrong}. The full value is ${display}.`,
    };
  }
  if (wrong === roundFraction(num, den, places)) {
    const placeWord = places === 1 ? 'decimal' : 'decimals';
    return {
      code: 'frac-under-precision',
      message: repeating
        ? `Right idea — ${wrong} is ${itemId} rounded at ${places} ${placeWord}. The digits keep going: ${display} At ${canonicalPlaces} decimals, that's ${acceptedFormsAt(num, den, canonicalPlaces)}.`
        : `Right idea — ${wrong} is ${itemId} rounded at ${places} ${placeWord}. The full value is ${display}.`,
    };
  }
  return null;
};

/**
 * Last-digit slip: right up to the final digit, off by one there —
 * the 0.84-for-5/6 case. Only at precisions the family covers, so a
 * one-tick gap at a meaningless precision can't masquerade as "so close".
 */
const detectLastDigitSlip = (num: number, den: number, wrong: number): MissDiagnosis | null => {
  const { floorPlaces, ceilingPlaces } = fractionPrecisionPolicy(den);
  const places = decimalPlaces(wrong);
  if (wrong <= 0 || wrong >= 1 || places < floorPlaces || places > ceilingPlaces) return null;
  const scale = 10 ** places;
  const wrongScaled = Math.round(wrong * scale);
  const truncScaled = Math.round(truncateFraction(num, den, places) * scale);
  const roundScaled = Math.round(roundFraction(num, den, places) * scale);
  if (Math.abs(wrongScaled - truncScaled) !== 1 && Math.abs(wrongScaled - roundScaled) !== 1) {
    return null;
  }
  const placeWord = places === 1 ? 'decimal' : 'decimals';
  return {
    code: 'frac-last-digit',
    message: `So close — ${wrong} is one digit off in the last place. ${num}/${den} = ${endSentence(fractionValueDisplay(num, den))} At ${places} ${placeWord}, that's ${acceptedFormsAt(num, den, places)}.`,
  };
};

/** The student-facing line for one hand-annotated pool identity. */
const fractionIdentityMessage = (
  num: number,
  den: number,
  wrong: number,
  identity: FractionDistractorIdentity
): string => {
  const itemId = `${num}/${den}`;
  const display = endSentence(fractionValueDisplay(num, den));
  switch (identity.kind) {
    case 'other-fact': {
      const [refNum, refDen] = identity.fraction.split('/').map(Number);
      const inFamily = acceptedDecimalFamily(refNum, refDen).includes(wrong);
      const comparison = num / den > wrong ? 'more' : 'less';
      const closeness = Math.abs(num / den - wrong) < 0.1 ? 'a bit ' : '';
      if (inFamily) {
        return `${wrong} is what ${identity.fraction} comes to. ${itemId} is ${closeness}${comparison}: ${display}`;
      }
      return `${wrong} is ${identity.fraction} cut short — ${identity.fraction} = ${endSentence(fractionValueDisplay(refNum, refDen))} ${itemId} is ${closeness}${comparison}: ${display}`;
    }
    case 'complement':
      return `${wrong} is what ${identity.fraction} comes to — that's the rest of the whole after ${itemId}. ${itemId} itself is ${display}`;
    case 'rotation':
      // No directional claim ("starts later") — it would be false for 1/7
      // and 3/7; reviewer R1.
      return `${wrong} is what ${identity.fraction} comes to — sevenths all run the same 142857 loop, just starting at different digits. ${itemId} is ${display}`;
    case 'digits':
      return `${wrong} reads the ${num} and ${den} straight across. ${itemId} means ${num} ÷ ${den}: ${display}`;
    case 'digit-swap':
      return `${wrong} is ${identity.of} with two digits swapped. ${itemId} is ${display}`;
    case 'percent-slip': {
      const wrongPercent = Math.round(wrong * 100);
      const percentDisplay = fractionBasesByDenominator[den].repeating
        ? repeatingDecimalDisplay(num * 100, den)
        : String(truncateFraction(num * 100, den, 1));
      return `${wrong} means ${wrongPercent}%. ${itemId} is ${percentDisplay}% — as a decimal, ${display}`;
    }
    case 'part-as-decimal': {
      const digit = identity.part === 'numerator' ? num : den;
      const position = identity.part === 'numerator' ? 'top' : 'bottom';
      return `${wrong} grabs the ${digit} from the ${position} of ${itemId}. ${itemId} means ${num} ÷ ${den}: ${display}`;
    }
  }
};

const diagnoseFractionMiss = (num: number, den: number, wrong: number): MissDiagnosis | null => {
  if (acceptedDecimalFamily(num, den).includes(wrong)) return null; // not a miss
  const poolEntry = FRACTION_DISTRACTOR_IDENTITIES[`${num}/${den}`]?.find(e => e.value === wrong);
  const poolDiagnosis: MissDiagnosis | null = poolEntry
    ? {
        code: `frac-${poolEntry.identity.kind}`,
        message: fractionIdentityMessage(num, den, wrong, poolEntry.identity),
      }
    : null;
  // Precedence: for REPEATING denominators under-precision outranks the
  // pool — a short answer is a genuine right-start there, and these are
  // exactly the answers the 2D.1 floor de-endorsed; validating the start
  // is the kinder true fact. For TERMINATING denominators nothing was
  // tightened and a short answer is more likely the curated confusion
  // than a precision choice (0.38 for 3/8 is the digits slip, even though
  // it also rounds 0.375), so the curated identity wins.
  if (fractionBasesByDenominator[den].repeating) {
    return detectUnderPrecision(num, den, wrong) ?? poolDiagnosis ?? detectLastDigitSlip(num, den, wrong);
  }
  return poolDiagnosis ?? detectUnderPrecision(num, den, wrong) ?? detectLastDigitSlip(num, den, wrong);
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const parseBase = (itemId: string, exponent: 2 | 3): number | null => {
  const match = new RegExp(`^([1-9]\\d*)\\^${exponent}$`).exec(itemId);
  return match ? Number(match[1]) : null;
};

/**
 * Diagnose a wrong answer for one Memorize fact. Returns null whenever no
 * identity confidently matches — including unparseable item ids, topics
 * without a diagnoser yet, and answers equal to (or, for fractions, inside
 * the accepted family of) the true value. Callers render nothing extra on
 * null: the generic re-teach is the designed failure mode.
 */
export const diagnoseMiss = (
  topic: MemorizeLearnTopic,
  itemId: string,
  wrongAnswer: number
): MissDiagnosis | null => {
  if (!Number.isFinite(wrongAnswer)) return null;
  switch (topic) {
    case 'times_tables': {
      const match = /^([1-9]\d*)x([1-9]\d*)$/.exec(itemId);
      if (!match) return null;
      const a = Number(match[1]);
      const b = Number(match[2]);
      if (wrongAnswer === a * b) return null;
      return diagnoseTimesTablesMiss(a, b, wrongAnswer);
    }
    case 'perfect_squares': {
      const n = parseBase(itemId, 2);
      if (n === null || wrongAnswer === n * n) return null;
      return diagnoseSquareMiss(n, wrongAnswer);
    }
    case 'perfect_cubes': {
      const n = parseBase(itemId, 3);
      if (n === null || wrongAnswer === n * n * n) return null;
      return diagnoseCubeMiss(n, wrongAnswer);
    }
    case 'fraction_conversions': {
      const parsed = parseFractionId(itemId);
      if (!parsed) return null;
      return diagnoseFractionMiss(parsed.num, parsed.den, wrongAnswer);
    }
    default:
      return null;
  }
};
