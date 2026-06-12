// Phase 2D.3 — THE shared faithful-transcription check.
//
// `isFaithfulFractionTranscription` is the single source of over-precision
// acceptance for BOTH graders: Learn's `gradeLearnRecall` (2A.4 §4
// reviewer-required) and the Drill validator's array-answer branch (the
// Charlie-ratified 2026-06-11 unification). These tests pin the helper
// itself; the agreement-by-construction sweep lives in
// tests/react/components/learn/grading.test.ts, and the Drill-side wiring
// pins live in tests/react/components/problem-display.test.tsx.
//
// Ratified boundary (do not loosen): this is VALIDATOR behavior only. The
// 2D.1 policy table, the displayed families, and the explanation strings
// are untouched — `acceptedDecimalFamily` output is pinned separately in
// fraction-families.test.ts and must not change in this slice.

import { describe, it, expect } from 'vitest';
import {
  acceptedDecimalFamily,
  fractionPrecisionPolicy,
  isFaithfulFractionTranscription,
  MAX_TRANSCRIPTION_PLACES,
  roundFraction,
  truncateFraction,
} from '../../src/core/math-problems';

const REPEATING: Array<[number, number]> = [
  [1, 3], [2, 3],
  [1, 6], [5, 6],
  [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7],
  [1, 9], [2, 9], [4, 9], [5, 9], [7, 9], [8, 9],
];

describe('isFaithfulFractionTranscription — decimal space', () => {
  it('accepts the headline ratified cases: 0.3333 for 1/3, 0.142857 for 1/7', () => {
    expect(isFaithfulFractionTranscription('1/3', '0.3333')).toBe(true);
    expect(isFaithfulFractionTranscription('1/7', '0.142857')).toBe(true);
  });

  it('rejects the headline counter-cases: 0.3334 and unfaithful roundings', () => {
    expect(isFaithfulFractionTranscription('1/3', '0.3334')).toBe(false);
    expect(isFaithfulFractionTranscription('5/6', '0.8334')).toBe(false);
    expect(isFaithfulFractionTranscription('5/9', '0.5554')).toBe(false);
  });

  it('accepts every truncation AND rounding from the floor through 8 places, for every repeating fact', () => {
    for (const [num, den] of REPEATING) {
      const { floorPlaces } = fractionPrecisionPolicy(den);
      for (let places = floorPlaces; places <= 8; places++) {
        for (const v of [truncateFraction(num, den, places), roundFraction(num, den, places)]) {
          expect(
            isFaithfulFractionTranscription(`${num}/${den}`, String(v)),
            `${num}/${den} should accept ${v}`
          ).toBe(true);
        }
      }
    }
  });

  it('rejects a corrupted final digit at every covered precision', () => {
    for (const [num, den] of REPEATING) {
      const { floorPlaces } = fractionPrecisionPolicy(den);
      for (let places = floorPlaces; places <= 8; places++) {
        const s = String(truncateFraction(num, den, places));
        const lastDigit = Number(s[s.length - 1]);
        const corrupted = s.slice(0, -1) + String((lastDigit + 2) % 10);
        expect(
          isFaithfulFractionTranscription(`${num}/${den}`, corrupted),
          `${num}/${den} should reject ${corrupted}`
        ).toBe(false);
      }
    }
  });

  it('rejects below the policy floor (the 2D.1 tightening is not reopened)', () => {
    expect(isFaithfulFractionTranscription('1/3', '0.3')).toBe(false);
    expect(isFaithfulFractionTranscription('5/9', '0.6')).toBe(false);
    expect(isFaithfulFractionTranscription('5/6', '0.8')).toBe(false);
  });

  it('rejects past MAX_TRANSCRIPTION_PLACES, accepts at the boundary', () => {
    expect(isFaithfulFractionTranscription('1/3', `0.${'3'.repeat(MAX_TRANSCRIPTION_PLACES)}`)).toBe(true);
    expect(isFaithfulFractionTranscription('1/3', `0.${'3'.repeat(MAX_TRANSCRIPTION_PLACES + 1)}`)).toBe(false);
  });

  it('rejects digits that assert a false continuation (trailing zero)', () => {
    // "0.83330" claims the 5th digit is 0; 5/6 continues with 3s.
    expect(isFaithfulFractionTranscription('5/6', '0.83330')).toBe(false);
  });

  it('returns false for terminating fractions (exact value only, unchanged)', () => {
    expect(isFaithfulFractionTranscription('1/8', '0.125')).toBe(false);
    expect(isFaithfulFractionTranscription('1/8', '0.1250')).toBe(false);
    expect(isFaithfulFractionTranscription('1/2', '0.5')).toBe(false);
  });

  it('returns false for non-fraction item ids, garbage, and blank input', () => {
    expect(isFaithfulFractionTranscription('6x8', '48')).toBe(false);
    expect(isFaithfulFractionTranscription('7^2', '49')).toBe(false);
    expect(isFaithfulFractionTranscription('5/6', 'abc')).toBe(false);
    expect(isFaithfulFractionTranscription('5/6', '')).toBe(false);
    expect(isFaithfulFractionTranscription('5/6', '  ')).toBe(false);
  });

  it('trims whitespace like the live validators do', () => {
    expect(isFaithfulFractionTranscription('5/6', ' 0.83333 ')).toBe(true);
  });

  it('never contradicts the displayed family (every family member at floor+ is also faithful)', () => {
    // The family is the displayed contract; the transcription check is a
    // superset of its repeating members at floor..ceiling by construction.
    for (const [num, den] of REPEATING) {
      for (const member of acceptedDecimalFamily(num, den)) {
        expect(
          isFaithfulFractionTranscription(`${num}/${den}`, String(member)),
          `${num}/${den} family member ${member}`
        ).toBe(true);
      }
    }
  });
});

describe('isFaithfulFractionTranscription — percent space (fracToPerc)', () => {
  it('accepts faithful percent transcriptions past the prompt precision', () => {
    expect(isFaithfulFractionTranscription('1/3', '33.33', 'percent')).toBe(true);
    expect(isFaithfulFractionTranscription('5/6', '83.33', 'percent')).toBe(true);
    expect(isFaithfulFractionTranscription('1/7', '14.285714', 'percent')).toBe(true);
    expect(isFaithfulFractionTranscription('5/9', '55.55', 'percent')).toBe(true);
  });

  it('accepts whole-percent truncations and roundings (floor shifts two places)', () => {
    expect(isFaithfulFractionTranscription('1/3', '33', 'percent')).toBe(true);
    expect(isFaithfulFractionTranscription('5/6', '83', 'percent')).toBe(true);
    expect(isFaithfulFractionTranscription('5/9', '56', 'percent')).toBe(true); // rounded
  });

  it('rejects unfaithful percent values', () => {
    expect(isFaithfulFractionTranscription('1/3', '34', 'percent')).toBe(false);
    expect(isFaithfulFractionTranscription('5/6', '83.34', 'percent')).toBe(false);
    expect(isFaithfulFractionTranscription('5/9', '55.54', 'percent')).toBe(false);
  });

  it('does not accept decimal-space answers on percent questions', () => {
    expect(isFaithfulFractionTranscription('1/3', '0.3333', 'percent')).toBe(false);
  });

  it('returns false for terminating fractions in percent space too', () => {
    expect(isFaithfulFractionTranscription('1/4', '25', 'percent')).toBe(false);
  });
});
