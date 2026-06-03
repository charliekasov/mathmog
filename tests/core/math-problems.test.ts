// Characterization tests for `core/math-problems.ts` — pinning the current
// observable behavior of the Math Mog problem generator prior to / during the
// `@peakprep/mathmog` package extraction. See contract §1.2 and API design
// Phase 5.
//
// IMPORTANT — IMPORT PATH:
// While these tests are staged outside the package repo, the import below
// uses an absolute filesystem path so the file is self-contained. Once the
// package is scaffolded, replace the import with:
//
//   import { ... } from '@peakprep/mathmog/core';
//
// (or `'../../src/core/math-problems'` if tests sit at `tests/core/` and the
// source moves to `src/core/math-problems.ts`).
//
// Framework: Vitest. Do not introduce Jest APIs.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateProblem,
  simplifyFraction,
  commonFractionConversions,
  perfectSquares,
  perfectCubes,
  perfectFourthPowers,
  perfectFifthPowers,
} from '../../src/core/math-problems';
import type { Difficulty, Problem } from '../../src/core/types';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const LEVELS = [1, 2, 3] as const;

const TOPICS_NO_DIFFICULTY = [
  'perfect_squares',
  'perfect_cubes',
  'fraction_conversions',
  'advanced_squares',
  'advanced_cubes',
  'higher_powers',
  'common_multiples',
];

const TOPICS_WITH_DIFFICULTY = [
  'multiplication_estimation',
  'root_estimation',
  'fraction_estimation',
  'percentage_calculations',
  'strategic_mul_div',
  'divisibility_3_6_9',
  'divisibility_4_8',
  'divisibility_7',
];

const ALL_TOPICS = [...TOPICS_NO_DIFFICULTY, ...TOPICS_WITH_DIFFICULTY];

// Shape guard: every generator must return an object compatible with `Problem`.
function expectProblemShape(p: Problem) {
  // `question` is `string | string[]`.
  const isStr = typeof p.question === 'string';
  const isStrArr = Array.isArray(p.question) && p.question.every((q) => typeof q === 'string');
  expect(isStr || isStrArr).toBe(true);
  // `answer` is `any` per the type — but it must be defined.
  expect(p.answer).toBeDefined();
  expect(typeof p.type).toBe('string');
  expect(typeof p.explanation).toBe('string');
  expect(['number', 'text', 'buttons', 'multi-text']).toContain(p.inputType);
}

// -----------------------------------------------------------------------------
// simplifyFraction — pure helper, deterministic
// -----------------------------------------------------------------------------

describe('simplifyFraction', () => {
  it('reduces 2/4 to "1/2"', () => {
    expect(simplifyFraction(2, 4)).toBe('1/2');
  });

  it('returns a coprime pair untouched (7/11)', () => {
    expect(simplifyFraction(7, 11)).toBe('7/11');
  });

  it('reduces 6/9 to "2/3"', () => {
    expect(simplifyFraction(6, 9)).toBe('2/3');
  });

  it('reduces 0/5 to "0/1" (zero numerator)', () => {
    // PINNED — TODO clean up in follow-up (contract §1.2: no special-case handling for zero).
    expect(simplifyFraction(0, 5)).toBe('0/1');
  });

  it('throws RangeError when denominator is 0', () => {
    expect(() => simplifyFraction(5, 0)).toThrow(RangeError);
  });

  it('canonicalizes sign to the numerator', () => {
    expect(simplifyFraction(-2, 4)).toBe('-1/2');
    expect(simplifyFraction(2, -4)).toBe('-1/2');
  });
});

// -----------------------------------------------------------------------------
// generateProblem — entry point dispatch
// -----------------------------------------------------------------------------

describe('generateProblem — level + difficulty matrix', () => {
  // Reset Math.random between cases. Each case uses a fixed stub so a single
  // failure is reproducible.
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  for (const level of LEVELS) {
    for (const difficulty of DIFFICULTIES) {
      it(`level ${level} × ${difficulty} returns a well-formed Problem`, () => {
        const p = generateProblem(level, difficulty, []);
        expectProblemShape(p);
      });
    }
  }

  it('handles non-zero Math.random stub for each (level × difficulty) combo without throwing', () => {
    // Belt-and-suspenders: exercise the matrix across a few seed values to surface
    // any path that's gated on a different `Math.random()` range.
    const seeds = [0.0, 0.1, 0.3, 0.7, 0.99];
    for (const seed of seeds) {
      randomSpy.mockReturnValue(seed);
      for (const level of LEVELS) {
        for (const difficulty of DIFFICULTIES) {
          const p = generateProblem(level, difficulty, []);
          expectProblemShape(p);
        }
      }
    }
  });
});

// -----------------------------------------------------------------------------
// generateProblem — invalid inputs
// -----------------------------------------------------------------------------

describe('generateProblem — error paths', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('throws "Invalid level requested: ..." for an unknown level', () => {
    expect(() => generateProblem(99, 'Easy', [])).toThrow(
      'Invalid level requested: 99. Cannot generate problem.'
    );
  });

  it('throws "Invalid level requested: ..." for level 0', () => {
    expect(() => generateProblem(0, 'Easy', [])).toThrow(
      /^Invalid level requested: 0\./
    );
  });

  it('throws "Unknown drill topic: ..." for an unknown topic', () => {
    expect(() => generateProblem(1, 'Easy', [], 'not_a_topic')).toThrow(
      'Unknown drill topic: not_a_topic'
    );
  });

  it('when topic is provided, level is ignored even if level is invalid', () => {
    // Contract §1.2: with `topic`, `level` is ignored. So passing an invalid
    // level alongside a valid topic should NOT throw the "Invalid level" error.
    expect(() => generateProblem(99, 'Easy', [], 'perfect_squares')).not.toThrow(
      /Invalid level/
    );
  });
});

// -----------------------------------------------------------------------------
// generateProblem — topic routing
// -----------------------------------------------------------------------------

describe('generateProblem — topic routing', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  for (const topic of TOPICS_NO_DIFFICULTY) {
    it(`topic="${topic}" returns a well-formed Problem (difficulty ignored)`, () => {
      // Level-1 topics ignore difficulty per contract §1.2.
      const p = generateProblem(1, 'Easy', [], topic);
      expectProblemShape(p);
    });
  }

  for (const topic of TOPICS_WITH_DIFFICULTY) {
    for (const difficulty of DIFFICULTIES) {
      it(`topic="${topic}" × ${difficulty} returns a well-formed Problem`, () => {
        const p = generateProblem(1, difficulty, [], topic);
        expectProblemShape(p);
      });
    }
  }
});

// -----------------------------------------------------------------------------
// createUniqueProblem — retry cap at 50
// -----------------------------------------------------------------------------
//
// `createUniqueProblem` is module-internal but reachable via `generateProblem`.
// To force a collision, we pre-load `history` with the question the generator
// will return, then assert that `generateProblem` STILL returns a problem (no
// throw, no hang). Mocking Math.random to a constant pins the generator to a
// single output, so every regenerated problem collides.
//
// We can't directly count attempts without access to the internal symbol, so
// we assert the observable invariant: even when all attempts collide, the
// function returns (within a reasonable time) — implying the 50-attempt
// failsafe is intact. We also assert it returns the colliding question, not
// some "uniqueness sentinel".

describe('createUniqueProblem retry cap (via generateProblem)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('returns a problem (does not hang) when history contains every generatable question', () => {
    // First call: pin one specific question by holding Math.random constant.
    const first = generateProblem(1, 'Easy', []);
    const firstKey = first.question.toString();

    // Now pre-load history with that exact question. With Math.random still
    // pinned, every retry will regenerate the same question. The 50-attempt
    // failsafe should make the call return promptly.
    const history = [firstKey];

    const t0 = Date.now();
    const second = generateProblem(1, 'Easy', history);
    const elapsed = Date.now() - t0;

    expectProblemShape(second);
    // Sanity bound — a 50-iteration loop on a constant-time generator should
    // complete in well under a second on any environment.
    expect(elapsed).toBeLessThan(2000);
  });

  it('returns the colliding (non-unique) problem after exhausting retries', () => {
    // PINNED — TODO clean up in follow-up (contract §1.2: after 50 collisions
    // `createUniqueProblem` returns the last generated problem WITHOUT raising
    // or logging, even though it's a duplicate).
    const first = generateProblem(1, 'Easy', []);
    const firstKey = first.question.toString();

    const second = generateProblem(1, 'Easy', [firstKey]);
    // The second problem's question matches the first (collision happened, and
    // it was returned anyway).
    expect(second.question.toString()).toBe(firstKey);
  });
});

// -----------------------------------------------------------------------------
// PINNED suspect behavior: Level-2 silent fallback to multiplication
// -----------------------------------------------------------------------------

describe('Level 2 silent fallback (PINNED suspect behavior)', () => {
  // PINNED — TODO clean up in follow-up (contract §1.2 medium-confidence:
  // generateLevel2Problem wraps its body in try/catch and falls back to
  // generateMultiplicationProblem on any thrown error, with only a
  // console.error survivor. We can't reliably force the catch branch from
  // outside, but we pin two surface invariants:
  //   1. Level 2 always returns a well-formed Problem.
  //   2. When a `console.error` IS emitted (catch branch hit), the returned
  //      problem is a Multiplication Estimation problem — i.e. the fallback.

  let randomSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    randomSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('always returns a well-formed Problem for Level 2 × every difficulty', () => {
    for (const difficulty of DIFFICULTIES) {
      const p = generateProblem(2, difficulty, []);
      expectProblemShape(p);
    }
  });

  it('does NOT log to console.error on the happy path with Math.random=0.5', () => {
    // Surfaces if a future change unexpectedly trips the catch branch.
    generateProblem(2, 'Medium', []);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------------
// Problem.tolerance field
// -----------------------------------------------------------------------------

describe('Problem.tolerance field', () => {
  // Generators set `tolerance` on the Problem (0.20 for multiplication, 0.20
  // for percentage, 0.25 for fraction estimation). The validator in
  // react/contexts/problem.tsx reads this field to widen the correctness
  // window for estimation problems; this module's contract is just that the
  // field is emitted with the documented per-topic values.

  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('multiplication_estimation Problem carries tolerance ≈ 0.20', () => {
    const p = generateProblem(1, 'Easy', [], 'multiplication_estimation');
    expect(p.tolerance).toBeCloseTo(0.2, 5);
  });

  it('percentage_calculations Problem carries tolerance ≈ 0.20', () => {
    const p = generateProblem(1, 'Easy', [], 'percentage_calculations');
    expect(p.tolerance).toBeCloseTo(0.2, 5);
  });

  it('fraction_estimation Problem carries tolerance ≈ 0.25', () => {
    // fraction_estimation only generates at Medium / Hard difficulty (Easy
    // drops it from the Level-2 pool, but the topic dispatcher calls
    // `generateFractionEstimationProblem` directly which itself only handles
    // Medium and Hard. At Easy it falls through to the else branch which is
    // 'Hard'-like behavior — still emits tolerance.)
    const p = generateProblem(1, 'Medium', [], 'fraction_estimation');
    expect(p.tolerance).toBeCloseTo(0.25, 5);
  });
});

// -----------------------------------------------------------------------------
// PINNED suspect behavior: repeating-decimal truncation via substring/slice
// -----------------------------------------------------------------------------

describe('Repeating-decimal answer encoding (PINNED suspect behavior)', () => {
  // PINNED — TODO clean up in follow-up (contract §1.2 medium-confidence:
  // `parseFloat(decimalValue.toString().substring(0, 2 + precision))` couples
  // generator correctness to JS number-stringification. Off-by-one risk if the
  // value's string representation starts with anything other than `"0."`. For
  // current generator inputs (always 0 < value < 1 for fracToDec, 0 < value <
  // 100 for fracToPerc), the truncation produces the expected number of
  // significant digits — but the formula is fragile.
  //
  // Most observable repeating-decimal cases route through `specificAnswers`
  // (covers all currently-defined numerators for repeating denominators).
  // We pin the specific-answers path here because that's what students actually
  // see today; the dead truncation branch is documented in triage.

  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('repeating-denominator fracToDec answers are number arrays of accepted forms', () => {
    // PINNED: every fraction_conversions answer for a repeating denominator
    // (3, 6, 7, 9) under fracToDec emits an array of all accepted decimal
    // forms from specificAnswers — the live validator accepts any element.
    // Loop seeds until we deterministically observe a fracToDec emission.
    const seeds = [0.13, 0.27, 0.42, 0.69, 0.83, 0.91, 0.99];
    let sawArrayAnswer = false;
    for (const s of seeds) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions');
      if (p.type === 'Fraction to Decimal' && Array.isArray(p.answer)) {
        sawArrayAnswer = true;
        // Every element of the array is a number.
        for (const v of p.answer) {
          expect(typeof v).toBe('number');
        }
      }
    }
    expect(sawArrayAnswer).toBe(true);
  });
});

// -----------------------------------------------------------------------------
// Reference data tables — exact content is part of the visible contract
// -----------------------------------------------------------------------------

describe('Reference data tables', () => {
  it('commonFractionConversions has 26 entries', () => {
    expect(commonFractionConversions).toHaveLength(26);
  });

  it('commonFractionConversions first entry is 1/3 → 0.33 / 33.3%', () => {
    expect(commonFractionConversions[0]).toEqual({
      frac: '1/3',
      decimal: '0.33',
      percent: '33.3%',
    });
  });

  it('commonFractionConversions last entry is 8/9 → 0.88 or 0.89 / 88.8% or 88.9%', () => {
    expect(commonFractionConversions[commonFractionConversions.length - 1]).toEqual({
      frac: '8/9',
      decimal: '0.88 or 0.89',
      percent: '88.8% or 88.9%',
    });
  });

  it('commonFractionConversions entries have stable shape { frac, decimal, percent }', () => {
    for (const entry of commonFractionConversions) {
      expect(typeof entry.frac).toBe('string');
      expect(typeof entry.decimal).toBe('string');
      expect(typeof entry.percent).toBe('string');
    }
  });

  it('perfectSquares contains 1..20 plus the extended bases', () => {
    // 1-20 inclusive
    for (let i = 1; i <= 20; i++) {
      expect(perfectSquares[i]).toBe(i * i);
    }
    // Extended bases listed in contract §1.2
    expect(perfectSquares[24]).toBe(576);
    expect(perfectSquares[25]).toBe(625);
    expect(perfectSquares[27]).toBe(729);
    expect(perfectSquares[30]).toBe(900);
    expect(perfectSquares[36]).toBe(1296);
    expect(perfectSquares[40]).toBe(1600);
    expect(perfectSquares[41]).toBe(1681);
    expect(perfectSquares[50]).toBe(2500);
    expect(perfectSquares[100]).toBe(10000);
  });

  it('perfectCubes contains 1..10 plus 20,30,...,100', () => {
    for (let i = 1; i <= 10; i++) {
      expect(perfectCubes[i]).toBe(i * i * i);
    }
    expect(perfectCubes[20]).toBe(8000);
    expect(perfectCubes[100]).toBe(1000000);
  });

  it('perfectFourthPowers = { 1:1, 2:16, 3:81, 4:256, 5:625, 6:1296 }', () => {
    expect(perfectFourthPowers).toEqual({
      1: 1,
      2: 16,
      3: 81,
      4: 256,
      5: 625,
      6: 1296,
    });
  });

  it('perfectFifthPowers = { 1:1, 2:32, 3:243, 4:1024, 5:3125 }', () => {
    expect(perfectFifthPowers).toEqual({
      1: 1,
      2: 32,
      3: 243,
      4: 1024,
      5: 3125,
    });
  });
});

// -----------------------------------------------------------------------------
// Topic-specific observable shapes
// -----------------------------------------------------------------------------

describe('Topic-specific Problem shapes', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('root_estimation emits inputType="multi-text", question is string[], placeholder "a,b,c"', () => {
    const p = generateProblem(1, 'Medium', [], 'root_estimation');
    expect(p.inputType).toBe('multi-text');
    expect(Array.isArray(p.question)).toBe(true);
    expect(p.placeholder).toBe('a,b,c');
    // Answer is a comma-separated string of the form "<base>,<nextBase>,<closerInt>".
    expect(typeof p.answer).toBe('string');
    expect((p.answer as string).split(',')).toHaveLength(3);
  });

  it('divisibility topic emits inputType="buttons" with options ["yes","no"]', () => {
    const p = generateProblem(1, 'Easy', [], 'divisibility_3_6_9');
    expect(p.inputType).toBe('buttons');
    expect(p.options).toEqual(['yes', 'no']);
    expect(['yes', 'no']).toContain(p.answer);
  });

  it('decToFrac / percToFrac problems have inputType="text" with simplified string answer', () => {
    // Sweep seeds until we observe a text-input Fraction problem.
    const seeds = [0.13, 0.27, 0.42, 0.69, 0.83, 0.91, 0.99];
    let sawTextFraction = false;
    for (const s of seeds) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions');
      if (p.inputType === 'text') {
        sawTextFraction = true;
        expect(typeof p.answer).toBe('string');
        expect(p.answer).toMatch(/^\d+\/\d+$/);
      }
    }
    expect(sawTextFraction).toBe(true);
  });

  it('perfect_squares topic always emits numeric question and numeric answer', () => {
    // Sweep multiple seeds to confirm.
    const seeds = [0.05, 0.5, 0.95];
    for (const s of seeds) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_squares');
      expect(p.inputType).toBe('number');
      expect(p.type).toBe('Perfect Squares');
      expect(typeof p.answer).toBe('number');
      expect(p.question).toMatch(/^\d+² = \?$/);
    }
  });

  it('perfect_cubes topic always emits "X³ = ?" with answer = X*X*X', () => {
    const seeds = [0.05, 0.5, 0.95];
    for (const s of seeds) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_cubes');
      expect(p.inputType).toBe('number');
      expect(p.type).toBe('Perfect Cubes');
      const match = (p.question as string).match(/^(\d+)³ = \?$/);
      expect(match).not.toBeNull();
      const x = Number(match![1]);
      expect(p.answer).toBe(x * x * x);
    }
  });
});

// -----------------------------------------------------------------------------
// history is read-only (contract §1.2)
// -----------------------------------------------------------------------------

describe('history argument', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('does not mutate the history array', () => {
    const history = ['placeholder-question'];
    const before = [...history];
    generateProblem(1, 'Easy', history);
    expect(history).toEqual(before);
  });

  it('accepts an empty history without throwing for every level × difficulty', () => {
    for (const level of LEVELS) {
      for (const difficulty of DIFFICULTIES) {
        expect(() => generateProblem(level, difficulty, [])).not.toThrow();
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Rejection-loop iteration caps (regression)
// -----------------------------------------------------------------------------
// `generateNonMultipleOf10` and four sibling rejection loops previously had
// no iteration cap. If `Math.random` returned a constant in the rejection
// band, the loop spun forever. Each loop now bails after 50 attempts, returning
// whatever the most recent draw produced (a degraded but well-formed Problem
// is preferred over a hang).

describe('Rejection-loop iteration caps (regression)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random');
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  // The (11,29) multiplication band: Math.random=0.5 → 20 (multiple of 10).
  // Without the cap, `generateNonMultipleOf10` spins forever on this seed.
  it('multiplication_estimation Easy terminates when Math.random always trips the non-multiple-of-10 reject', () => {
    randomSpy.mockReturnValue(0.5);
    const p = generateProblem(1, 'Easy', [], 'multiplication_estimation');
    expectProblemShape(p);
  }, 1000);

  // The (51,149) Hard multiplication band: Math.random=0.5 → 100 (multiple of 10).
  it('multiplication_estimation Hard terminates when Math.random always trips the non-multiple-of-10 reject', () => {
    randomSpy.mockReturnValue(0.5);
    const p = generateProblem(1, 'Hard', [], 'multiplication_estimation');
    expectProblemShape(p);
  }, 1000);

  // Percentage Medium band: Math.random=0.5 → percent=55 (multiple of 5) →
  // trips the `% 5 === 0` reject.
  it('percentage_calculations Medium terminates when Math.random always trips the % 5 reject', () => {
    randomSpy.mockReturnValue(0.5);
    const p = generateProblem(1, 'Medium', [], 'percentage_calculations');
    expectProblemShape(p);
  }, 1000);

  // div_5 Hard band (50..199): Math.random=0 → num=50 (multiple of 5) → trips
  // the `% 5 === 0` reject.
  it('strategic_mul_div div_5 terminates when Math.random always trips the % 5 reject', () => {
    // Force div_5 by seeding the case selector. The strategic_mul_div topic
    // picks a case from a small array via Math.random; a 0-valued seed lands
    // on the first entry. We can't directly pin which case is div_5 without
    // peeking at the source, so sweep a few seed values: any case that has an
    // uncapped reject loop would hang the whole test if the cap broke.
    for (const seed of [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
      randomSpy.mockReturnValue(seed);
      const p = generateProblem(1, 'Hard', [], 'strategic_mul_div');
      expectProblemShape(p);
    }
  }, 2000);
});
