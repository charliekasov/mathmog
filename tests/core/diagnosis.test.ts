/**
 * Unit tests for `core/diagnosis` (Phase 2D.2 — error-identity substrate).
 *
 * Covers: the fraction identity table's lockstep with the curated pools
 * (sibling-table consistency both ways), exact message pins for every
 * identity kind and both detectors, the ratified precedence
 * (accepted → under-precision → pool identity → last-digit → null), the
 * mechanical TT/squares/cubes diagnosers, and a full pool-coverage
 * snapshot pinning exactly which curated distractors diagnose to null
 * (the generic-re-teach fallback — rail: never guess).
 */

import { describe, it, expect } from 'vitest';
import {
  diagnoseMiss,
  FRACTION_DISTRACTOR_IDENTITIES,
} from '../../src/core/diagnosis';
import {
  acceptedDecimalFamily,
  fractionBasesByDenominator,
} from '../../src/core/math-problems';
import {
  TIMES_TABLES_LEARN_MODULES,
  PERFECT_SQUARES_LEARN_MODULES,
  PERFECT_CUBES_LEARN_MODULES,
  FRACTION_CONVERSIONS_LEARN_MODULES,
} from '../../src/core/learn';

const fullModule = (modules: { id: string; distractorSets: { itemId: string; distractors: number[] }[] }[], suffix: string) => {
  const def = modules.find(m => m.id.endsWith(suffix));
  if (!def) throw new Error(`no module ${suffix}`);
  return def;
};

const TT_FULL = fullModule(TIMES_TABLES_LEARN_MODULES, '/tt_full');
const SQUARES_FULL = fullModule(PERFECT_SQUARES_LEARN_MODULES, '/squares_full');
const CUBES_FULL = fullModule(PERFECT_CUBES_LEARN_MODULES, '/cubes_full');
const FRACTIONS_FULL = fullModule(FRACTION_CONVERSIONS_LEARN_MODULES, '/fractions_full');

/** Pool entries deliberately without an annotation (see fraction-identities.ts). */
const UNANNOTATED_FRACTION_ENTRIES = new Set(['3/8:0.35', '4/9:0.45']);

describe('fraction identity table — lockstep with the curated pools', () => {
  it('every annotated value is an entry in the item\'s pool (no orphans)', () => {
    const poolByItem = Object.fromEntries(
      FRACTIONS_FULL.distractorSets.map(s => [s.itemId, new Set(s.distractors)])
    );
    for (const [itemId, entries] of Object.entries(FRACTION_DISTRACTOR_IDENTITIES)) {
      for (const { value } of entries) {
        expect(
          poolByItem[itemId]?.has(value),
          `${itemId} annotates ${value}, which is not in the pool`
        ).toBe(true);
      }
    }
  });

  it('every pool entry is annotated, except the pinned unannotated two', () => {
    for (const set of FRACTIONS_FULL.distractorSets) {
      const annotated = new Set(
        (FRACTION_DISTRACTOR_IDENTITIES[set.itemId] ?? []).map(e => e.value)
      );
      for (const value of set.distractors) {
        const key = `${set.itemId}:${value}`;
        if (UNANNOTATED_FRACTION_ENTRIES.has(key)) {
          expect(annotated.has(value), `${key} is pinned unannotated but has an annotation`).toBe(false);
        } else {
          expect(annotated.has(value), `${key} has no identity annotation`).toBe(true);
        }
      }
    }
  });

  it('no annotation value sits inside the item\'s own accepted family', () => {
    for (const [itemId, entries] of Object.entries(FRACTION_DISTRACTOR_IDENTITIES)) {
      const [num, den] = itemId.split('/').map(Number);
      const family = new Set(acceptedDecimalFamily(num, den));
      for (const { value } of entries) {
        expect(family.has(value), `${itemId}: ${value} is an accepted answer`).toBe(false);
      }
    }
  });

  it('other-fact / complement / rotation references are real facts, never the item itself', () => {
    const factIds = new Set(Object.keys(FRACTION_DISTRACTOR_IDENTITIES));
    for (const [itemId, entries] of Object.entries(FRACTION_DISTRACTOR_IDENTITIES)) {
      for (const { value, identity } of entries) {
        if (!('fraction' in identity)) continue;
        expect(factIds.has(identity.fraction), `${itemId}: ${value} references unknown ${identity.fraction}`).toBe(true);
        expect(identity.fraction).not.toBe(itemId);
      }
    }
  });

  it('complement references are exactly (d−n)/d', () => {
    for (const [itemId, entries] of Object.entries(FRACTION_DISTRACTOR_IDENTITIES)) {
      const [num, den] = itemId.split('/').map(Number);
      for (const { identity } of entries) {
        if (identity.kind !== 'complement') continue;
        expect(identity.fraction).toBe(`${den - num}/${den}`);
      }
    }
  });

  it('rotation identities appear only on sevenths and reference sevenths', () => {
    for (const [itemId, entries] of Object.entries(FRACTION_DISTRACTOR_IDENTITIES)) {
      for (const { identity } of entries) {
        if (identity.kind !== 'rotation') continue;
        expect(itemId.endsWith('/7')).toBe(true);
        expect(identity.fraction.endsWith('/7')).toBe(true);
      }
    }
  });

  it('digit-swap sources are accepted forms of the item with the same digit multiset', () => {
    const digits = (v: number) => String(v).replace('.', '').split('').sort().join('');
    for (const [itemId, entries] of Object.entries(FRACTION_DISTRACTOR_IDENTITIES)) {
      const [num, den] = itemId.split('/').map(Number);
      const family = new Set(acceptedDecimalFamily(num, den));
      for (const { value, identity } of entries) {
        if (identity.kind !== 'digit-swap') continue;
        expect(family.has(identity.of), `${itemId}: swap source ${identity.of} not accepted`).toBe(true);
        expect(digits(value)).toBe(digits(identity.of));
      }
    }
  });
});

describe('diagnoseMiss — fractions: detectors', () => {
  it('0.5 for 5/9 → under-precision, validating the right start (the de-endorsed student)', () => {
    expect(diagnoseMiss('fraction_conversions', '5/9', 0.5)).toEqual({
      code: 'frac-under-precision',
      message:
        'Right idea. 5/9 starts with 0.5, but the digits keep going: 0.5555… At 2 decimal places, that\'s 0.55 or 0.56.',
    });
  });

  it('the retired one-place asymmetry pair both diagnose now: 0.8 AND 0.9 for 8/9', () => {
    expect(diagnoseMiss('fraction_conversions', '8/9', 0.8)?.code).toBe('frac-under-precision');
    expect(diagnoseMiss('fraction_conversions', '8/9', 0.9)).toEqual({
      code: 'frac-under-precision',
      message:
        'Right idea. 0.9 is 8/9 rounded at 1 decimal place. The digits keep going: 0.8888… At 2 decimal places, that\'s 0.88 or 0.89.',
    });
  });

  it('0.8 for 5/6 (the review\'s punish-adjacent case) → under-precision', () => {
    expect(diagnoseMiss('fraction_conversions', '5/6', 0.8)).toEqual({
      code: 'frac-under-precision',
      message:
        'Right idea. 5/6 starts with 0.8, but the digits keep going: 0.8333… At 3 decimal places, that\'s 0.833.',
    });
  });

  it('terminating under-precision: 0.12 and 0.13 for 1/8', () => {
    expect(diagnoseMiss('fraction_conversions', '1/8', 0.12)).toEqual({
      code: 'frac-under-precision',
      message: 'Right start. 1/8 does begin with 0.12. The full value is 0.125.',
    });
    expect(diagnoseMiss('fraction_conversions', '1/8', 0.13)).toEqual({
      code: 'frac-under-precision',
      message: 'Right idea. 0.13 is 1/8 rounded at 2 decimal places. The full value is 0.125.',
    });
  });

  it('0.84 for 5/6 (the review\'s last-digit case)', () => {
    expect(diagnoseMiss('fraction_conversions', '5/6', 0.84)).toEqual({
      code: 'frac-last-digit',
      message:
        'So close. 0.84 is one digit off in the last place. 5/6 = 0.8333… At 2 decimal places, that\'s 0.83.',
    });
  });

  it('last-digit fires at every covered precision (floor, canonical, ceiling)', () => {
    expect(diagnoseMiss('fraction_conversions', '5/9', 0.54)?.code).toBe('frac-last-digit');
    expect(diagnoseMiss('fraction_conversions', '5/6', 0.832)?.code).toBe('frac-last-digit');
    expect(diagnoseMiss('fraction_conversions', '5/6', 0.8334)?.code).toBe('frac-last-digit');
    expect(diagnoseMiss('fraction_conversions', '1/8', 0.126)?.code).toBe('frac-last-digit');
  });

  it('last-digit does NOT fire below the floor or past the ceiling', () => {
    // 0.4 vs 1/3: one tick at p=1, but p=1 is below the floor — a one-place
    // gap is a different fact, not "so close" (it is also not faithful, so
    // under-precision stays silent: null → generic re-teach).
    expect(diagnoseMiss('fraction_conversions', '1/3', 0.4)).toBeNull();
    // five places is past the ceiling for sixths
    expect(diagnoseMiss('fraction_conversions', '5/6', 0.83334)).toBeNull();
  });

  it('0.45 for 4/9 — unannotated pool entry, covered by the last-digit detector', () => {
    expect(diagnoseMiss('fraction_conversions', '4/9', 0.45)?.code).toBe('frac-last-digit');
  });
});

describe('diagnoseMiss — fractions: pool identities (one exact pin per kind)', () => {
  it('other-fact: 0.875 for 4/5', () => {
    expect(diagnoseMiss('fraction_conversions', '4/5', 0.875)).toEqual({
      code: 'frac-other-fact',
      message: '0.875 is what 7/8 comes to. 4/5 is a bit less: 0.8.',
    });
  });

  it('other-fact, truncated reference: 0.87 for 7/9', () => {
    expect(diagnoseMiss('fraction_conversions', '7/9', 0.87)).toEqual({
      code: 'frac-other-fact',
      message: '0.87 is 7/8 cut short. 7/8 = 0.875. 7/9 is a bit less: 0.7777…',
    });
  });

  it('complement: 0.67 for 1/3', () => {
    expect(diagnoseMiss('fraction_conversions', '1/3', 0.67)).toEqual({
      code: 'frac-complement',
      message:
        '0.67 is what 2/3 comes to. That\'s the rest of the whole after 1/3. 1/3 itself is 0.3333…',
    });
  });

  it('rotation: 0.286 for 5/7', () => {
    expect(diagnoseMiss('fraction_conversions', '5/7', 0.286)).toEqual({
      code: 'frac-rotation',
      message:
        '0.286 is what 2/7 comes to. Sevenths all run the same 142857 loop, just starting at different digits. 5/7 is 0.714285…',
    });
  });

  it('digits: 0.38 for 3/8', () => {
    expect(diagnoseMiss('fraction_conversions', '3/8', 0.38)).toEqual({
      code: 'frac-digits',
      message: '0.38 reads the 3 and 8 straight across. 3/8 means 3 ÷ 8: 0.375.',
    });
  });

  it('digit-swap: 0.134 for 1/7', () => {
    expect(diagnoseMiss('fraction_conversions', '1/7', 0.134)).toEqual({
      code: 'frac-digit-swap',
      message: '0.134 is 0.143 with two digits swapped. 1/7 is 0.142857…',
    });
  });

  it('percent-slip: 0.05 for 1/5', () => {
    expect(diagnoseMiss('fraction_conversions', '1/5', 0.05)).toEqual({
      code: 'frac-percent-slip',
      message: '0.05 means 5%. 1/5 is 20%. As a decimal, 0.2.',
    });
  });

  it('part-as-decimal: 0.9 for 1/9', () => {
    expect(diagnoseMiss('fraction_conversions', '1/9', 0.9)).toEqual({
      code: 'frac-part-as-decimal',
      message: '0.9 grabs the 9 from the bottom of 1/9. 1/9 means 1 ÷ 9: 0.1111…',
    });
  });
});

describe('diagnoseMiss — fractions: precedence', () => {
  it('accepted family members are never diagnosed (not a miss)', () => {
    expect(diagnoseMiss('fraction_conversions', '5/6', 0.83)).toBeNull();
    expect(diagnoseMiss('fraction_conversions', '5/9', 0.56)).toBeNull();
    expect(diagnoseMiss('fraction_conversions', '1/2', 0.5)).toBeNull();
  });

  it('repeating: under-precision outranks a pool identity (0.2 for 1/6 is 1/5\'s value AND a faithful rounding)', () => {
    for (const [itemId, wrong] of [
      ['1/6', 0.2], ['3/7', 0.4], ['4/7', 0.6],
    ] as const) {
      expect(diagnoseMiss('fraction_conversions', itemId, wrong)?.code, `${itemId} ${wrong}`).toBe(
        'frac-under-precision'
      );
    }
  });

  it('terminating: the curated identity outranks under-precision (nothing was tightened there)', () => {
    for (const [itemId, wrong, code] of [
      ['1/4', 0.2, 'frac-other-fact'],
      ['5/8', 0.6, 'frac-other-fact'],
      ['7/8', 0.8, 'frac-other-fact'],
      ['3/8', 0.38, 'frac-digits'],
    ] as const) {
      expect(diagnoseMiss('fraction_conversions', itemId, wrong)?.code, `${itemId} ${wrong}`).toBe(code);
    }
  });

  it('a pool identity outranks the last-digit detector (0.44 for 5/9 names 4/9, not "one off")', () => {
    // 0.44 is one tick below 0.45? No — it is 4/9's value AND |44−55| > 1,
    // so use a sharper case: 0.56 for 2/3 is one off 0.66 at p=2 in the
    // tens digit (not last digit), but 0.67−0.66 style collisions can't
    // exist (family members are excluded first). The live overlap case:
    expect(diagnoseMiss('fraction_conversions', '4/9', 0.43)?.code).toBe('frac-last-digit');
    expect(diagnoseMiss('fraction_conversions', '5/9', 0.44)?.code).toBe('frac-other-fact');
  });

  it('unmatched wrong answers return null — generic re-teach, never a guess', () => {
    expect(diagnoseMiss('fraction_conversions', '5/9', 0.46)).toBeNull();
    expect(diagnoseMiss('fraction_conversions', '3/8', 0.35)).toBeNull();
    expect(diagnoseMiss('fraction_conversions', '5/6', 0.123)).toBeNull();
  });

  it('unknown item ids and topics return null', () => {
    expect(diagnoseMiss('fraction_conversions', '2/4', 0.4)).toBeNull();
    expect(diagnoseMiss('fraction_conversions', '10/9', 0.9)).toBeNull();
    expect(diagnoseMiss('fraction_conversions', 'nonsense', 0.4)).toBeNull();
    expect(diagnoseMiss('advanced_squares', '40^2', 160)).toBeNull();
    expect(diagnoseMiss('times_tables', '6x8', NaN)).toBeNull();
  });
});

describe('diagnoseMiss — times tables (mechanical)', () => {
  it('adjacent product, the review\'s exact case: 54 for 6 × 8', () => {
    expect(diagnoseMiss('times_tables', '6x8', 54)).toEqual({
      code: 'tt-adjacent-product',
      message: '54 is 6 × 9. 6 × 8 is one 6 less: 48.',
    });
  });

  it('adjacent product below: 42 for 6 × 8', () => {
    expect(diagnoseMiss('times_tables', '6x8', 42)).toEqual({
      code: 'tt-adjacent-product',
      message: '42 is 6 × 7. 6 × 8 is one 6 more: 48.',
    });
  });

  it('neighbor fact: 56 for 6 × 9', () => {
    expect(diagnoseMiss('times_tables', '6x9', 56)).toEqual({
      code: 'tt-neighbor-fact',
      message: '56 is 7 × 8, a neighbor fact. 6 × 9 = 54.',
    });
  });

  it('two-off product: 35 for 5 × 9', () => {
    expect(diagnoseMiss('times_tables', '5x9', 35)).toEqual({
      code: 'tt-near-product',
      message: '35 is 5 × 7. 5 × 9 = 45.',
    });
  });

  it('added instead of multiplied: 5 for 2 × 3', () => {
    expect(diagnoseMiss('times_tables', '2x3', 5)).toEqual({
      code: 'tt-added-instead',
      message: '5 is 2 + 3. Multiplying: 2 × 3 = 6.',
    });
  });

  it('digit swap: 65 for 7 × 8 (presented 8 × 7)', () => {
    expect(diagnoseMiss('times_tables', '8x7', 65)).toEqual({
      code: 'tt-digit-swap',
      message: '65 is 56 with the digits swapped. 8 × 7 = 56.',
    });
  });

  it('a product identity outranks the digit swap: 45 for 6 × 9', () => {
    expect(diagnoseMiss('times_tables', '6x9', 45)?.code).toBe('tt-adjacent-product');
  });

  it('works for either presentation order of a fact', () => {
    expect(diagnoseMiss('times_tables', '5x2', 8)?.code).toBe('tt-adjacent-product');
  });

  it('the correct answer and far-off values return null', () => {
    expect(diagnoseMiss('times_tables', '6x8', 48)).toBeNull();
    expect(diagnoseMiss('times_tables', '12x12', 124)).toBeNull();
  });
});

describe('diagnoseMiss — perfect squares (mechanical)', () => {
  it('adjacent square: 49 for 8²', () => {
    expect(diagnoseMiss('perfect_squares', '8^2', 49)).toEqual({
      code: 'sq-adjacent-square',
      message: '49 is 7². 8² = 64.',
    });
  });

  it('row product: 72 for 9²', () => {
    expect(diagnoseMiss('perfect_squares', '9^2', 72)).toEqual({
      code: 'sq-row-product',
      message: '72 is 9 × 8, one 9 short of 9 × 9. 9² = 81.',
    });
  });

  it('cube slip: 27 for 3²', () => {
    expect(diagnoseMiss('perfect_squares', '3^2', 27)).toEqual({
      code: 'sq-cube-slip',
      message: '27 is 3³, three 3s multiplied. Squaring uses two: 3 × 3 = 9.',
    });
  });

  it('two-off square and product: 361 and 99', () => {
    expect(diagnoseMiss('perfect_squares', '17^2', 361)?.code).toBe('sq-near-square');
    expect(diagnoseMiss('perfect_squares', '9^2', 99)).toEqual({
      code: 'sq-near-product',
      message: '99 is 9 × 11. 9² is 9 × 9: 81.',
    });
  });

  it('digit swap: 265 for 16²', () => {
    expect(diagnoseMiss('perfect_squares', '16^2', 265)).toEqual({
      code: 'sq-digit-swap',
      message: '265 is 256 with its digits rearranged. 16² = 256.',
    });
  });
});

describe('diagnoseMiss — perfect cubes (mechanical)', () => {
  it('the square slip — the most common cube error: 49 for 7³', () => {
    expect(diagnoseMiss('perfect_cubes', '7^3', 49)).toEqual({
      code: 'cb-square-slip',
      message: '49 is 7², two 7s. A cube multiplies three: 7 × 7 × 7 = 343.',
    });
  });

  it('adjacent cube: 216 for 7³', () => {
    expect(diagnoseMiss('perfect_cubes', '7^3', 216)).toEqual({
      code: 'cb-adjacent-cube',
      message: '216 is 6³. 7³ = 343.',
    });
  });

  it('times three: 6 for 2³', () => {
    expect(diagnoseMiss('perfect_cubes', '2^3', 6)).toEqual({
      code: 'cb-times-three',
      message: '6 is 2 × 3. 2³ means 2 × 2 × 2 = 8.',
    });
  });

  it('square multiple: 147 for 7³', () => {
    expect(diagnoseMiss('perfect_cubes', '7^3', 147)).toEqual({
      code: 'cb-square-multiple',
      message: '147 is 7² × 3. Cubing multiplies by 7 again: 7² × 7 = 343.',
    });
  });

  it('power slip: 625 for 5³', () => {
    expect(diagnoseMiss('perfect_cubes', '5^3', 625)).toEqual({
      code: 'cb-power-slip',
      message: '625 is 5⁴, four 5s. A cube is three: 5 × 5 × 5 = 125.',
    });
  });

  it('digit swap: 126 for 6³', () => {
    expect(diagnoseMiss('perfect_cubes', '6^3', 126)).toEqual({
      code: 'cb-digit-swap',
      message: '126 is 216 with its digits rearranged. 6³ = 216.',
    });
  });

  it('zero-count slips on 10³ resolve mechanically', () => {
    expect(diagnoseMiss('perfect_cubes', '10^3', 100)?.code).toBe('cb-square-slip');
    expect(diagnoseMiss('perfect_cubes', '10^3', 10000)?.code).toBe('cb-power-slip');
  });
});

describe('pool coverage snapshot — exactly these curated distractors diagnose to null', () => {
  /**
   * Each entry is (itemId, value) for a pool member with no mechanical or
   * curated identity — the generic re-teach handles it by design. Any rule
   * change that grows or shrinks this set must update the pin (and the
   * grown set should be justified: a new null means a curated distractor
   * lost its diagnosis).
   */
  const EXPECTED_NULLS: Record<string, Array<[string, number]>> = {
    // module enumeration order: the 2× block first, then row-major
    times_tables: [
      ['2x2', 5],
      ['6x2', 13],
      ['7x2', 13],
      ['8x2', 15],
      ['9x2', 17],
      ['10x2', 21],
      ['11x2', 21],
      ['3x3', 27],
      ['5x3', 35],
      ['4x4', 18],
      ['11x11', 111],
      ['12x11', 122],
      ['12x12', 124],
    ],
    perfect_squares: [
      ['1^2', 11],
      ['11^2', 111],
      ['15^2', 125],
    ],
    perfect_cubes: [
      ['1^3', 13],
      ['8^3', 256],
    ],
    fraction_conversions: [
      ['3/8', 0.35],
    ],
  };

  const TOPIC_MODULES = {
    times_tables: TT_FULL,
    perfect_squares: SQUARES_FULL,
    perfect_cubes: CUBES_FULL,
    fraction_conversions: FRACTIONS_FULL,
  } as const;

  it.each(Object.keys(TOPIC_MODULES) as Array<keyof typeof TOPIC_MODULES>)(
    '%s: null set matches the pin',
    topic => {
      const nulls: Array<[string, number]> = [];
      for (const set of TOPIC_MODULES[topic].distractorSets) {
        for (const value of set.distractors) {
          if (diagnoseMiss(topic, set.itemId, value) === null) {
            nulls.push([set.itemId, value]);
          }
        }
      }
      expect(nulls).toEqual(EXPECTED_NULLS[topic]);
    }
  );

  it('every diagnosed pool entry yields a clean message (no NaN/undefined, closed sentence)', () => {
    for (const [topic, def] of Object.entries(TOPIC_MODULES)) {
      for (const set of def.distractorSets) {
        for (const value of set.distractors) {
          const diagnosis = diagnoseMiss(
            topic as keyof typeof TOPIC_MODULES,
            set.itemId,
            value
          );
          if (!diagnosis) continue;
          expect(diagnosis.message).not.toMatch(/NaN|undefined|null/);
          expect(diagnosis.message).toMatch(/[.…]$/);
          expect(diagnosis.code.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
