/**
 * Unit tests for the Phase 2D.1 fraction precision policy — the derived
 * accepted-answer families that replaced the hand-typed `answers` maps.
 *
 * The old hand tables live on HERE as fixtures (the review's explicit
 * move): the generator's output is pinned in full for every fact, and the
 * deltas — values the policy deliberately stops accepting — are named one
 * by one. Where the generator deviates from a hand table, the deviation IS
 * the bug fix; this file pins the new truth.
 *
 * Also verified: the two grading defects logged in the 2A.2 fractions
 * HANDOFF §"Drill-side follow-ups" are demonstrably gone, and the
 * cross-fact false positives (0.5-for-5/9 etc.) no longer grade correct.
 */

import { describe, it, expect } from 'vitest';
import {
  REPEATING_PRECISION_FLOOR,
  acceptedDecimalFamily,
  fractionBasesByDenominator,
  fractionPrecisionPolicy,
  fractionToDecimalExplanation,
  fractionToPercentExplanation,
  repeatingDecimalDisplay,
  roundFraction,
  truncateFraction,
} from '../../src/core/math-problems';
import { FRACTION_ACCEPTED_DECIMALS } from '../../src/core/learn';

/** Every (numerator, denominator) fact the Drill generates. */
const ALL_FACTS: Array<[number, number]> = Object.entries(
  fractionBasesByDenominator
).flatMap(([den, base]) => base.numerators.map(num => [num, Number(den)] as [number, number]));

// ---------------------------------------------------------------------------
// The new truth: full family pin for all 27 facts.
// Order is precision-major, truncation before rounding.
// ---------------------------------------------------------------------------

const EXPECTED_FAMILIES: Record<string, number[]> = {
  // terminating — exact value only (unchanged behavior)
  '1/2': [0.5],
  '1/4': [0.25], '3/4': [0.75],
  '1/5': [0.2], '2/5': [0.4], '3/5': [0.6], '4/5': [0.8],
  '1/8': [0.125], '3/8': [0.375], '5/8': [0.625], '7/8': [0.875],
  // thirds — floor 2, canonical 2, ceiling 3
  '1/3': [0.33, 0.333],
  '2/3': [0.66, 0.67, 0.666, 0.667],
  // sixths — floor 2, canonical 3, ceiling 4
  '1/6': [0.16, 0.17, 0.166, 0.167, 0.1666, 0.1667],
  '5/6': [0.83, 0.833, 0.8333],
  // sevenths — floor 2, canonical 3, ceiling 4
  '1/7': [0.14, 0.142, 0.143, 0.1428, 0.1429],
  '2/7': [0.28, 0.29, 0.285, 0.286, 0.2857],
  '3/7': [0.42, 0.43, 0.428, 0.429, 0.4285, 0.4286],
  '4/7': [0.57, 0.571, 0.5714],
  '5/7': [0.71, 0.714, 0.7142, 0.7143],
  '6/7': [0.85, 0.86, 0.857, 0.8571],
  // ninths — floor 2, canonical 2, ceiling 3
  '1/9': [0.11, 0.111],
  '2/9': [0.22, 0.222],
  '4/9': [0.44, 0.444],
  '5/9': [0.55, 0.56, 0.555, 0.556],
  '7/9': [0.77, 0.78, 0.777, 0.778],
  '8/9': [0.88, 0.89, 0.888, 0.889],
};

// ---------------------------------------------------------------------------
// The retired hand tables (pre-2D.1 `answers` maps), kept as fixtures, and
// the per-fact deltas. Every delta is a removal; the policy adds nothing
// the hand tables didn't already accept.
// ---------------------------------------------------------------------------

const RETIRED_HAND_TABLES: Record<string, number[]> = {
  '1/3': [0.3, 0.33, 0.333],
  '2/3': [0.6, 0.66, 0.67, 0.666, 0.667],
  '1/6': [0.16, 0.17, 0.166, 0.167, 0.1666, 0.1667],
  '5/6': [0.83, 0.833, 0.8333],
  '1/7': [0.14, 0.142, 0.143, 0.1428, 0.1429],
  '2/7': [0.28, 0.29, 0.285, 0.286, 0.2857],
  '3/7': [0.42, 0.43, 0.428, 0.429, 0.4285, 0.4286],
  '4/7': [0.57, 0.571, 0.572, 0.5714],
  '5/7': [0.71, 0.714, 0.715, 0.7142, 0.7143],
  '6/7': [0.85, 0.86, 0.857, 0.858, 0.8571],
  '1/9': [0.1, 0.11, 0.111],
  '2/9': [0.2, 0.22, 0.222],
  '4/9': [0.4, 0.44, 0.444],
  '5/9': [0.5, 0.55, 0.56, 0.555, 0.556],
  '7/9': [0.7, 0.77, 0.78, 0.777, 0.778],
  '8/9': [0.8, 0.88, 0.89, 0.888, 0.889],
};

/**
 * What the policy stopped accepting, and why:
 * - one-place forms (below the ratified 2-place floor) — several were other
 *   facts' exact values (0.5 = 1/2, 0.2 = 1/5, 0.4 = 2/5, 0.8 = 4/5);
 * - 0.572 / 0.715 / 0.858 — never faithful renderings at ANY precision
 *   (4/7 = 0.5714… rounds to 0.571 at three places, not 0.572): hand-
 *   enumeration bugs of exactly the class the review predicted.
 */
const EXPECTED_REMOVALS: Record<string, number[]> = {
  '1/3': [0.3],
  '2/3': [0.6],
  '1/6': [], '5/6': [],
  '1/7': [], '2/7': [], '3/7': [],
  '4/7': [0.572],
  '5/7': [0.715],
  '6/7': [0.858],
  '1/9': [0.1],
  '2/9': [0.2],
  '4/9': [0.4],
  '5/9': [0.5],
  '7/9': [0.7],
  '8/9': [0.8],
};

describe('policy helpers', () => {
  it('truncateFraction is exact at every covered precision', () => {
    expect(truncateFraction(2, 3, 2)).toBe(0.66);
    expect(truncateFraction(5, 9, 2)).toBe(0.55);
    expect(truncateFraction(1, 7, 4)).toBe(0.1428);
    expect(truncateFraction(1, 8, 3)).toBe(0.125);
    expect(truncateFraction(1, 2, 1)).toBe(0.5);
  });

  it('roundFraction rounds half up at every covered precision', () => {
    expect(roundFraction(2, 3, 2)).toBe(0.67);
    expect(roundFraction(5, 9, 2)).toBe(0.56);
    expect(roundFraction(5, 6, 3)).toBe(0.833);
    expect(roundFraction(4, 7, 3)).toBe(0.571); // NOT 0.572
    expect(roundFraction(5, 7, 3)).toBe(0.714); // NOT 0.715
    expect(roundFraction(6, 7, 3)).toBe(0.857); // NOT 0.858
  });

  it('repeating denominators share the ratified 2-place floor', () => {
    for (const den of [3, 6, 7, 9]) {
      expect(fractionPrecisionPolicy(den).floorPlaces).toBe(REPEATING_PRECISION_FLOOR);
      expect(fractionPrecisionPolicy(den).floorPlaces).toBe(2);
    }
  });

  it('terminating denominators accept exactly the exact value', () => {
    for (const den of [2, 4, 5, 8]) {
      const policy = fractionPrecisionPolicy(den);
      expect(policy.floorPlaces).toBe(policy.canonicalPlaces);
      expect(policy.ceilingPlaces).toBe(policy.canonicalPlaces);
    }
  });

  it('repeating ceilings sit one place past the prompt precision (extra correct digit never punished)', () => {
    for (const den of [3, 6, 7, 9]) {
      const policy = fractionPrecisionPolicy(den);
      expect(policy.ceilingPlaces).toBe(policy.canonicalPlaces + 1);
    }
  });
});

describe('derived families — the new truth, pinned in full', () => {
  it('covers exactly the 27 Drill facts', () => {
    expect(ALL_FACTS.map(([n, d]) => `${n}/${d}`).sort()).toEqual(
      Object.keys(EXPECTED_FAMILIES).sort()
    );
  });

  it.each(Object.entries(EXPECTED_FAMILIES))('%s family is exactly %j', (fact, family) => {
    const [num, den] = fact.split('/').map(Number);
    expect(acceptedDecimalFamily(num, den)).toEqual(family);
  });

  it('the Drill answers maps are the derived families (same data, not a copy that can drift)', () => {
    for (const [num, den] of ALL_FACTS) {
      const entry = fractionBasesByDenominator[den];
      if (!entry.repeating) {
        expect(entry.answers).toBeUndefined();
        continue;
      }
      expect(entry.answers?.[num]).toEqual(acceptedDecimalFamily(num, den));
    }
  });

  it('FRACTION_ACCEPTED_DECIMALS (the 2A.4 Recall grader source) matches the policy for every fact', () => {
    for (const [num, den] of ALL_FACTS) {
      expect(FRACTION_ACCEPTED_DECIMALS[`${num}/${den}`]).toEqual(
        acceptedDecimalFamily(num, den)
      );
    }
  });
});

describe('deltas from the retired hand tables — removals only, each one named', () => {
  it.each(Object.entries(RETIRED_HAND_TABLES))(
    '%s: derived family = hand table minus the named removals',
    (fact, handTable) => {
      const [num, den] = fact.split('/').map(Number);
      const family = acceptedDecimalFamily(num, den);
      const removals = EXPECTED_REMOVALS[fact];
      expect(handTable.filter(v => !family.includes(v))).toEqual(removals);
    }
  );

  it('the policy accepts nothing the hand tables did not (pure tightening)', () => {
    for (const [fact, handTable] of Object.entries(RETIRED_HAND_TABLES)) {
      const [num, den] = fact.split('/').map(Number);
      const additions = acceptedDecimalFamily(num, den).filter(v => !handTable.includes(v));
      expect(additions, `${fact} gained ${additions}`).toEqual([]);
    }
  });
});

describe('logged Drill defects (2A.2 fractions HANDOFF) — demonstrably gone', () => {
  it('defect 1 — truncation/rounding symmetry: both forms accepted at every covered precision', () => {
    // Was: 0.8-but-not-0.9 for 8/9, 0.7-not-0.8 for 7/9 — a rounder marked
    // wrong while a truncator passed. Now trunc and round are both in the
    // family at every precision the family covers.
    for (const [num, den] of ALL_FACTS) {
      if (!fractionBasesByDenominator[den].repeating) continue;
      const family = acceptedDecimalFamily(num, den);
      const { floorPlaces, ceilingPlaces } = fractionPrecisionPolicy(den);
      for (let p = floorPlaces; p <= ceilingPlaces; p++) {
        expect(family, `${num}/${den} missing truncation at ${p}`).toContain(
          truncateFraction(num, den, p)
        );
        expect(family, `${num}/${den} missing rounding at ${p}`).toContain(
          roundFraction(num, den, p)
        );
      }
    }
  });

  it('defect 2 — sixths/ninths precision asymmetry: same floor everywhere', () => {
    // Was: ninths accepted one place, sixths did not. Now no repeating
    // denominator accepts anything below the shared floor.
    for (const [num, den] of ALL_FACTS) {
      if (!fractionBasesByDenominator[den].repeating) continue;
      for (const v of acceptedDecimalFamily(num, den)) {
        const places = (String(v).split('.')[1] ?? '').length;
        expect(places, `${num}/${den} accepts ${v} below the floor`).toBeGreaterThanOrEqual(
          REPEATING_PRECISION_FLOOR
        );
      }
    }
  });

  it('the one-place asymmetry pair itself: 8/9 now accepts neither 0.8 nor 0.9', () => {
    const family = acceptedDecimalFamily(8, 9);
    expect(family).not.toContain(0.8);
    expect(family).not.toContain(0.9);
  });
});

describe('cross-fact collisions — other facts\' exact values no longer grade correct', () => {
  const COLLISIONS: Array<[string, number, string]> = [
    ['5/9', 0.5, '1/2'],
    ['2/9', 0.2, '1/5'],
    ['4/9', 0.4, '2/5'],
    ['8/9', 0.8, '4/5'],
  ];

  it.each(COLLISIONS)('%s no longer accepts %d', (fact, value) => {
    const [num, den] = fact.split('/').map(Number);
    expect(acceptedDecimalFamily(num, den)).not.toContain(value);
  });

  it.each(COLLISIONS)('…while %s\'s %d still IS %s\'s exact value', (_fact, value, owner) => {
    const [num, den] = owner.split('/').map(Number);
    expect(acceptedDecimalFamily(num, den)).toContain(value);
  });

  it('no family member is any other fact\'s exact (terminating) value', () => {
    const exactByValue = new Map<number, string>();
    for (const [num, den] of ALL_FACTS) {
      if (!fractionBasesByDenominator[den].repeating) {
        exactByValue.set(num / den, `${num}/${den}`);
      }
    }
    for (const [num, den] of ALL_FACTS) {
      for (const v of acceptedDecimalFamily(num, den)) {
        const owner = exactByValue.get(v);
        if (owner && owner !== `${num}/${den}`) {
          throw new Error(`${num}/${den} accepts ${v}, which is exactly ${owner}`);
        }
      }
    }
  });
});

describe('repeating display + explanation strings (Learn-aligned)', () => {
  it('repeatingDecimalDisplay shows the repetend then an ellipsis', () => {
    expect(repeatingDecimalDisplay(2, 3)).toBe('0.6666…');
    expect(repeatingDecimalDisplay(1, 6)).toBe('0.1666…');
    expect(repeatingDecimalDisplay(5, 9)).toBe('0.5555…');
    expect(repeatingDecimalDisplay(1, 7)).toBe('0.142857…');
    expect(repeatingDecimalDisplay(200, 3)).toBe('66.6666…');
    expect(() => repeatingDecimalDisplay(1, 8)).toThrow(RangeError);
  });

  it('fracToDec explanations carry the repeating form and lead with the truncated canonical', () => {
    expect(fractionToDecimalExplanation(2, 3)).toBe(
      '2/3 = 2 ÷ 3 = 0.6666… — to 2 decimal places, 0.66 or 0.67'
    );
    expect(fractionToDecimalExplanation(5, 6)).toBe(
      '5/6 = 5 ÷ 6 = 0.8333… — to 3 decimal places, 0.833'
    );
    expect(fractionToDecimalExplanation(1, 7)).toBe(
      '1/7 = 1 ÷ 7 = 0.142857… — to 3 decimal places, 0.142 or 0.143'
    );
    expect(fractionToDecimalExplanation(5, 9)).toBe(
      '5/9 = 5 ÷ 9 = 0.5555… — to 2 decimal places, 0.55 or 0.56'
    );
  });

  it('terminating fracToDec explanations state the exact value with =, not ≈', () => {
    expect(fractionToDecimalExplanation(3, 8)).toBe('3/8 = 3 ÷ 8 = 0.375');
    expect(fractionToDecimalExplanation(1, 2)).toBe('1/2 = 1 ÷ 2 = 0.5');
  });

  it('fracToPerc explanations align with the same truncated canonicals', () => {
    expect(fractionToPercentExplanation(2, 3, 0)).toBe(
      '2/3 = 0.6666… = 66.6666…% — as a whole-number percent, 66% or 67%'
    );
    expect(fractionToPercentExplanation(1, 6, 1)).toBe(
      '1/6 = 0.1666… = 16.6666…% — to 1 decimal place, 16.6% or 16.7%'
    );
    expect(fractionToPercentExplanation(5, 6, 1)).toBe(
      '5/6 = 0.8333… = 83.3333…% — to 1 decimal place, 83.3%'
    );
    expect(fractionToPercentExplanation(3, 8, 1)).toBe('3/8 = 0.375 = 37.5%');
  });

  it('every truncated canonical the explanations lead with is an accepted family member', () => {
    for (const [num, den] of ALL_FACTS) {
      const { canonicalPlaces } = fractionPrecisionPolicy(den);
      expect(acceptedDecimalFamily(num, den)).toContain(
        truncateFraction(num, den, canonicalPlaces)
      );
    }
  });
});
