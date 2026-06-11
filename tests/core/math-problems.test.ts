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
  fractionBasesByDenominator,
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
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    randomSpy.mockRestore();
    warnSpy.mockRestore();
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

  it('returns the colliding problem after exhausting retries, with a console.warn signal', () => {
    // Contract (post-A.1#6, v0.5.14): when the 50-attempt cap is reached
    // `createUniqueProblem` STILL returns the colliding problem (no throw —
    // the trainer needs a problem to render), but it emits exactly one
    // `console.warn` so the orchestrator / debugger has a signal that the
    // generator's variety has degraded. The return-shape invariant
    // (collision-as-fallback) is intentional; the warn is the new addition.
    const first = generateProblem(1, 'Easy', []);
    const firstKey = first.question.toString();

    // Sanity: priming the warn spy should be clean — the first call shouldn't
    // have warned (history empty, first attempt succeeded).
    expect(warnSpy).not.toHaveBeenCalled();

    const second = generateProblem(1, 'Easy', [firstKey]);

    // Collision return preserved.
    expect(second.question.toString()).toBe(firstKey);

    // Exactly one warn fired, message identifies the source.
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('createUniqueProblem'),
      expect.anything(),
    );
  });
});

// -----------------------------------------------------------------------------
// Level-2 catch policy: soft fallback to multiplication_estimation with
// loud structured telemetry (A.1 #2 / Phase 0.6 sub-chat 6).
// -----------------------------------------------------------------------------

describe('Level 2 catch policy (soft fallback + telemetry)', () => {
  // generateLevel2Problem wraps its body in try/catch and on error falls
  // back to generateMultiplicationProblem (a valid Level-2 problem type,
  // so the student does not see a blank screen). The catch logs a
  // structured `{ error, difficulty }` context object via console.error
  // so production debug has signal. The catch branch is not reliably
  // forceable from outside (the body is defensive — no operation in the
  // try-block has a known throw path today), so the two externally
  // observable invariants we can pin are:
  //   1. Level 2 always returns a well-formed Problem for every difficulty.
  //   2. The happy path with Math.random=0.42 does NOT trip the catch
  //      (surfaces if a future change unexpectedly throws in the body).

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
// Registry coverage — every repeating denominator must list specificAnswers
// for every listed numerator. This invariant is what makes the
// `else if (repeating)` truncation branch in fracToDec / fracToPerc unreachable
// (A.1 #7 in HANDOFF-mathmog-cleanups.md). If a future edit adds a (denom,
// numerator) pair to a repeating denominator without adding a specificAnswers
// entry, this test fails — flagging that the truncation path is no longer dead.
// -----------------------------------------------------------------------------

describe('Repeating-denominator registry coverage', () => {
  it('every (repeating denominator, listed numerator) pair has a specificAnswers entry', () => {
    const dens = Object.keys(fractionBasesByDenominator).map(Number);
    for (const den of dens) {
      const entry = fractionBasesByDenominator[den];
      if (!entry.repeating) continue;
      expect(entry.answers, `den=${den} repeating but has no answers map`).toBeDefined();
      for (const num of entry.numerators) {
        const list = entry.answers?.[num];
        expect(list, `den=${den} num=${num} missing specificAnswers entry`).toBeDefined();
        expect(Array.isArray(list), `den=${den} num=${num} answers entry is not an array`).toBe(true);
        expect((list as number[]).length, `den=${den} num=${num} answers entry is empty`).toBeGreaterThan(0);
        for (const v of list as number[]) {
          expect(typeof v, `den=${den} num=${num} answers contains non-number`).toBe('number');
        }
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Repeating-decimal answer encoding — answers come from specificAnswers.
// -----------------------------------------------------------------------------

describe('Repeating-decimal answer encoding', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42);
  });
  afterEach(() => {
    randomSpy.mockRestore();
  });

  it('repeating-denominator fracToDec answers are number arrays of accepted forms', () => {
    const seeds = [0.13, 0.27, 0.42, 0.69, 0.83, 0.91, 0.99];
    let sawArrayAnswer = false;
    for (const s of seeds) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions');
      if (p.type === 'Fraction to Decimal' && Array.isArray(p.answer)) {
        sawArrayAnswer = true;
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
  it('commonFractionConversions has 27 entries', () => {
    expect(commonFractionConversions).toHaveLength(27);
  });

  it('commonFractionConversions first entry is 1/2 → 0.5 / 50%', () => {
    expect(commonFractionConversions[0]).toEqual({
      frac: '1/2',
      decimal: '0.5',
      percent: '50%',
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

// -----------------------------------------------------------------------------
// Phase 1 slice 1.1 — Scope infrastructure
//
// Adds an optional 5th positional `scope` arg to `generateProblem` and
// scope-aware generation for three Memorize topics:
//   - perfect_squares  (scopes: squares_full / squares_1_5 / squares_1_10 /
//                       squares_11_15 / squares_11_20 / squares_16_20)
//   - perfect_cubes    (scopes: cubes_full / cubes_1_3 / cubes_1_5 / cubes_6_10)
//   - fraction_conversions (scopes: fractions_full / fractions_friendly /
//                       fractions_halves_fourths / fractions_fifths /
//                       fractions_eighths / fractions_thirds / fractions_sixths
//                       / fractions_sevenths / fractions_ninths)
//
// The LOAD-BEARING invariant is byte-equivalence: `scope = undefined` (4-arg
// call) AND `scope = '<topic>_full'` (5-arg call with the topic's "Full" scope)
// must produce identical Problem output to today's generators for every seed.
// Phase 1.1 must not silently shift the unscoped default — every existing
// portal caller (only `src/react/contexts/problem.tsx:89` today) is a 4-arg
// call.
//
// The byte-equivalence tests live BEFORE the registry/generator changes per the
// test-protected refactor workflow (cartograph → pin → change → review).
// -----------------------------------------------------------------------------

describe('Scope: byte-equivalence baseline (no-scope path is unchanged)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    randomSpy = vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    randomSpy.mockRestore();
  });

  // perfect_squares: today's generator does `Math.floor(Math.random() * 20) + 1`,
  // then `answer = num * num`. Seed sweep pins specific (seed → num) pairs so
  // the slice's source change cannot accidentally shift the unscoped default.
  it.each([
    [0.0, 1],
    [0.05, 2],
    [0.25, 6],
    [0.5, 11],
    [0.75, 16],
    [0.95, 20],
  ])('perfect_squares (no scope) at seed=%s yields %s²', (seed, expectedNum) => {
    randomSpy.mockReturnValue(seed as number);
    const p = generateProblem(1, 'Easy', [], 'perfect_squares');
    expect(p.question).toBe(`${expectedNum}² = ?`);
    expect(p.answer).toBe(expectedNum * expectedNum);
    expect(p.type).toBe('Perfect Squares');
  });

  // perfect_cubes: today's generator does `Math.floor(Math.random() * 10) + 1`.
  it.each([
    [0.0, 1],
    [0.05, 1],
    [0.25, 3],
    [0.5, 6],
    [0.75, 8],
    [0.95, 10],
  ])('perfect_cubes (no scope) at seed=%s yields %s³', (seed, expectedNum) => {
    randomSpy.mockReturnValue(seed as number);
    const p = generateProblem(1, 'Easy', [], 'perfect_cubes');
    expect(p.question).toBe(`${expectedNum}³ = ?`);
    expect(p.answer).toBe(expectedNum * expectedNum * expectedNum);
    expect(p.type).toBe('Perfect Cubes');
  });

  // fraction_conversions: today's generator picks a denominator from
  // [2,3,4,5,6,7,8,9] then a numerator, then a conversion type. The exact
  // output is seed-deterministic. We pin a sweep of seeds → (type, question
  // pattern) to lock the unscoped distribution.
  it('fraction_conversions (no scope) at seed=0.0 emits a fraction problem touching denominator 2', () => {
    randomSpy.mockReturnValue(0.0);
    const p = generateProblem(1, 'Easy', [], 'fraction_conversions');
    // den index = floor(0 * 8) = 0 → den=2; numerator index = floor(0 * 1) = 0 → num=1
    // conversion index varies but question must reference 1/2 or 0.5 or 50%
    expect(p.type).toMatch(/Fraction|Decimal|Percent/);
    const q = String(p.question);
    expect(q).toMatch(/1\/2|0\.5|50/);
  });

  it('fraction_conversions (no scope) at seed=0.5 emits a fraction problem touching denominator 6', () => {
    randomSpy.mockReturnValue(0.5);
    const p = generateProblem(1, 'Easy', [], 'fraction_conversions');
    // den index = floor(0.5 * 8) = 4 → den=6
    const q = String(p.question);
    // Some seed paths reference simplified forms (e.g. 1/2 from 5/6 → percent → fraction).
    // Pin the denominator-6 path by matching "/6" OR "5/6" OR a 0.83/0.16 decimal OR an 83.3%-ish percent.
    expect(q).toMatch(/\/6\b|0\.16|0\.83|16\.6|83\.3/);
  });

  it('fraction_conversions (no scope) at seed=0.99 emits a fraction problem touching denominator 9', () => {
    randomSpy.mockReturnValue(0.99);
    const p = generateProblem(1, 'Easy', [], 'fraction_conversions');
    // den index = floor(0.99 * 8) = 7 → den=9
    const q = String(p.question);
    expect(q).toMatch(/\/9\b|0\.[0-9]{2,}|[0-9]+\.[0-9]+%/);
  });

  // times_tables (Phase 1.2): the no-scope generator picks a, b ∈ {2..12} with
  // canonical larger-first ordering. With seed-mocked Math.random returning a
  // constant s, both picks are a = b = aPool[floor(s*11)]; canonicalization is
  // a no-op (a == b). Sweep pins the (s → factor) map.
  it.each([
    [0.0, 2],
    [0.05, 2],
    [0.25, 4],
    [0.5, 7],
    [0.75, 10],
    [0.95, 12],
  ])('times_tables (no scope) at seed=%s yields %s × %s', (seed, expectedFactor) => {
    randomSpy.mockReturnValue(seed as number);
    const p = generateProblem(1, 'Easy', [], 'times_tables');
    expect(p.question).toBe(`${expectedFactor} × ${expectedFactor} = ?`);
    expect(p.answer).toBe((expectedFactor as number) * (expectedFactor as number));
    expect(p.type).toBe('Times Tables');
  });

  // Belt-and-suspenders: every seed × every scoped topic produces a well-formed
  // Problem on the no-scope (undefined) path. This is the catch-all that flags
  // any source change that breaks unscoped behavior.
  it('every (seed × scoped topic) on the no-scope path produces a well-formed Problem', () => {
    const seeds = [0.0, 0.13, 0.27, 0.42, 0.5, 0.69, 0.83, 0.91, 0.99];
    const topics = ['times_tables', 'perfect_squares', 'perfect_cubes', 'fraction_conversions'];
    for (const seed of seeds) {
      randomSpy.mockReturnValue(seed);
      for (const topic of topics) {
        const p = generateProblem(1, 'Easy', [], topic);
        expectProblemShape(p);
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Scope-aware output — pins the post-change scope-narrowing contract.
//
// Each scoped topic exposes a set of scope ids per curriculum DESIGN doc §3.3.
// The generator interprets the id and narrows its number pool; scope=undefined
// or scope=`<topic>_full` reproduces today's full-range behavior. An unknown
// scope id silently falls back to Full (matching the existing topic-resilience
// pattern: `getTopicInfo` returns undefined for unknown topics rather than
// throwing).
// -----------------------------------------------------------------------------

describe('Scope: scope-aware output (perfect_squares)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random'); });
  afterEach(() => { randomSpy.mockRestore(); });

  // For every seed in a sweep, the picked base must lie inside the scope's
  // declared range. This is a property test — we don't pin a single output,
  // we pin the set of possible outputs.
  const sweep = [0.0, 0.05, 0.15, 0.25, 0.4, 0.5, 0.6, 0.75, 0.85, 0.95];

  const inRange = (q: unknown, lo: number, hi: number) => {
    const m = String(q).match(/^(\d+)² = \?$/);
    expect(m).not.toBeNull();
    const x = Number(m![1]);
    expect(x).toBeGreaterThanOrEqual(lo);
    expect(x).toBeLessThanOrEqual(hi);
  };

  it('scope=squares_1_5 emits bases in 1..5', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_squares', 'squares_1_5');
      inRange(p.question, 1, 5);
    }
  });

  it('scope=squares_1_10 emits bases in 1..10', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_squares', 'squares_1_10');
      inRange(p.question, 1, 10);
    }
  });

  it('scope=squares_11_15 emits bases in 11..15', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_squares', 'squares_11_15');
      inRange(p.question, 11, 15);
    }
  });

  it('scope=squares_11_20 emits bases in 11..20', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_squares', 'squares_11_20');
      inRange(p.question, 11, 20);
    }
  });

  it('scope=squares_16_20 emits bases in 16..20', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_squares', 'squares_16_20');
      inRange(p.question, 16, 20);
    }
  });

  it('scope=squares_full is byte-equivalent to the no-scope path', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const noScope = generateProblem(1, 'Easy', [], 'perfect_squares');
      randomSpy.mockReturnValue(s);
      const withFull = generateProblem(1, 'Easy', [], 'perfect_squares', 'squares_full');
      expect(withFull).toEqual(noScope);
    }
  });

  it('unknown scope falls back to Full (silent, matches getTopicInfo resilience)', () => {
    for (const s of [0.05, 0.5, 0.95]) {
      randomSpy.mockReturnValue(s);
      const noScope = generateProblem(1, 'Easy', [], 'perfect_squares');
      randomSpy.mockReturnValue(s);
      const withGarbage = generateProblem(1, 'Easy', [], 'perfect_squares', 'totally-not-a-scope');
      expect(withGarbage).toEqual(noScope);
    }
  });
});

describe('Scope: scope-aware output (perfect_cubes)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random'); });
  afterEach(() => { randomSpy.mockRestore(); });

  const sweep = [0.0, 0.05, 0.15, 0.25, 0.4, 0.5, 0.6, 0.75, 0.85, 0.95];

  const inRange = (q: unknown, lo: number, hi: number) => {
    const m = String(q).match(/^(\d+)³ = \?$/);
    expect(m).not.toBeNull();
    const x = Number(m![1]);
    expect(x).toBeGreaterThanOrEqual(lo);
    expect(x).toBeLessThanOrEqual(hi);
  };

  it('scope=cubes_1_3 emits bases in 1..3', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_cubes', 'cubes_1_3');
      inRange(p.question, 1, 3);
    }
  });

  it('scope=cubes_1_5 emits bases in 1..5', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_cubes', 'cubes_1_5');
      inRange(p.question, 1, 5);
    }
  });

  it('scope=cubes_6_10 emits bases in 6..10', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'perfect_cubes', 'cubes_6_10');
      inRange(p.question, 6, 10);
    }
  });

  it('scope=cubes_full is byte-equivalent to the no-scope path', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const noScope = generateProblem(1, 'Easy', [], 'perfect_cubes');
      randomSpy.mockReturnValue(s);
      const withFull = generateProblem(1, 'Easy', [], 'perfect_cubes', 'cubes_full');
      expect(withFull).toEqual(noScope);
    }
  });
});

describe('Scope: scope-aware output (fraction_conversions)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random'); });
  afterEach(() => { randomSpy.mockRestore(); });

  const sweep = [0.0, 0.13, 0.27, 0.42, 0.5, 0.69, 0.83, 0.91, 0.99];

  // The question string for a fraction-conversion problem touches the
  // denominator in one of several shapes:
  //   - "Convert N/D to a decimal (P decimal places)"
  //   - "Convert N/D to a percent (P decimal places)"
  //   - "Convert 0.XYZ to a fraction"  (decToFrac — den hidden in answer)
  //   - "Convert XYZ% to a fraction"   (percToFrac — den hidden in answer)
  // For scope assertions we accept either: (a) the question references N/D
  // where D is in the scope's denominator set, OR (b) the answer (a simplified
  // fraction string "n/d" for the text-input types) has denominator dividing
  // a denominator in the scope's set (because simplifyFraction may collapse
  // e.g. 2/8 → 1/4, but the source fraction's denominator was still in scope).

  const denomsInScope = (p: Problem, allowedDenoms: number[]) => {
    const q = String(p.question);
    // Question form 1+2: "Convert N/D ..." — match the displayed denominator
    const qMatch = q.match(/Convert \d+\/(\d+)/);
    if (qMatch) {
      const d = Number(qMatch[1]);
      expect(allowedDenoms).toContain(d);
      return;
    }
    // Question form 3+4: "Convert 0.X to a fraction" or "Convert X% to a fraction"
    // Answer is a "n/d" string. The simplified denom must divide one of the
    // source denominators in scope (e.g., source 4 → answer could be 1/4 or
    // 1/2 if numerator was 2; source 8 → 1/8, 3/8, 5/8, 7/8; source 5 → 1/5..4/5).
    if (typeof p.answer === 'string' && /^\d+\/\d+$/.test(p.answer)) {
      const ansDen = Number(p.answer.split('/')[1]);
      // ansDen must divide some allowed denominator
      const ok = allowedDenoms.some((d) => d % ansDen === 0);
      expect(ok, `answer ${p.answer} not consistent with scope denominators ${allowedDenoms.join(',')}`).toBe(true);
      return;
    }
    // Decimal-input form (decToFrac with non-simplifiable source) — sanity-only
    // shape check; the seed paths we use don't typically land here.
    expect(p.type).toMatch(/Fraction|Decimal|Percent/);
  };

  it('scope=fractions_friendly restricts to denominators {2, 4, 5}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_friendly');
      denomsInScope(p, [2, 4, 5]);
    }
  });

  it('scope=fractions_halves_fourths restricts to denominators {2, 4}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_halves_fourths');
      denomsInScope(p, [2, 4]);
    }
  });

  it('scope=fractions_fifths restricts to denominator {5}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_fifths');
      denomsInScope(p, [5]);
    }
  });

  it('scope=fractions_eighths restricts to denominator {8}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_eighths');
      denomsInScope(p, [8]);
    }
  });

  it('scope=fractions_thirds restricts to denominator {3}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_thirds');
      denomsInScope(p, [3]);
    }
  });

  it('scope=fractions_sixths restricts to denominator {6}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_sixths');
      denomsInScope(p, [6]);
    }
  });

  it('scope=fractions_sevenths restricts to denominator {7}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_sevenths');
      denomsInScope(p, [7]);
    }
  });

  it('scope=fractions_ninths restricts to denominator {9}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_ninths');
      denomsInScope(p, [9]);
    }
  });

  it('scope=fractions_full is byte-equivalent to the no-scope path', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const noScope = generateProblem(1, 'Easy', [], 'fraction_conversions');
      randomSpy.mockReturnValue(s);
      const withFull = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_full');
      expect(withFull).toEqual(noScope);
    }
  });
});

// -----------------------------------------------------------------------------
// Scope-aware output (times_tables) — Phase 1.2.
//
// Multi-row scopes (tt_easy, tt_2_5, tt_6_9, tt_10_12, tt_full) draw a, b from
// scope-narrowed pools and canonicalize larger-first per the existing
// memorized-multiplication / common-multiples precedent.
//
// Singleton-row scopes (tt_just_6, tt_just_7, tt_just_8, tt_just_9) draw a
// from a single-element pool {N} and b from {2..12}, and DO NOT swap. The
// question always reads "N × b" so a student picking "Just the 7× table" sees
// the 7× row frame consistently.
// -----------------------------------------------------------------------------

describe('Scope: scope-aware output (times_tables)', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random'); });
  afterEach(() => { randomSpy.mockRestore(); });

  const sweep = [0.0, 0.05, 0.15, 0.25, 0.4, 0.5, 0.6, 0.75, 0.85, 0.95];

  const parseFactors = (q: unknown): [number, number] => {
    const m = String(q).match(/^(\d+) × (\d+) = \?$/);
    expect(m).not.toBeNull();
    return [Number(m![1]), Number(m![2])];
  };

  const factorsInPools = (q: unknown, aPool: number[], bPool: number[]) => {
    const [a, b] = parseFactors(q);
    // Multi-row scopes canonicalize larger-first. Either ordering must satisfy
    // (a ∈ aPool ∧ b ∈ bPool) or (a ∈ bPool ∧ b ∈ aPool) after the swap.
    const direct = aPool.includes(a) && bPool.includes(b);
    const swapped = aPool.includes(b) && bPool.includes(a);
    expect(direct || swapped).toBe(true);
  };

  const allFactors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // ---- multi-row scopes -----------------------------------------------------

  it('scope=tt_easy draws first factor from {2, 5, 10}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_easy');
      factorsInPools(p.question, [2, 5, 10], allFactors);
    }
  });

  it('scope=tt_2_5 draws first factor from {2, 3, 4, 5}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_2_5');
      factorsInPools(p.question, [2, 3, 4, 5], allFactors);
    }
  });

  it('scope=tt_6_9 draws first factor from {6, 7, 8, 9}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_6_9');
      factorsInPools(p.question, [6, 7, 8, 9], allFactors);
    }
  });

  it('scope=tt_10_12 draws first factor from {10, 11, 12}', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_10_12');
      factorsInPools(p.question, [10, 11, 12], allFactors);
    }
  });

  // ---- singleton scopes (preserve row × column ordering) --------------------

  it('scope=tt_just_6 always presents 6 as the row factor (left side)', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_just_6');
      const [a, b] = parseFactors(p.question);
      expect(a).toBe(6);
      expect(allFactors).toContain(b);
    }
  });

  it('scope=tt_just_7 always presents 7 as the row factor (left side)', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_just_7');
      const [a, b] = parseFactors(p.question);
      expect(a).toBe(7);
      expect(allFactors).toContain(b);
    }
  });

  it('scope=tt_just_8 always presents 8 as the row factor (left side)', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_just_8');
      const [a, b] = parseFactors(p.question);
      expect(a).toBe(8);
      expect(allFactors).toContain(b);
    }
  });

  it('scope=tt_just_9 always presents 9 as the row factor (left side)', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_just_9');
      const [a, b] = parseFactors(p.question);
      expect(a).toBe(9);
      expect(allFactors).toContain(b);
    }
  });

  // ---- byte-equivalence vs no-scope path ------------------------------------

  it('scope=tt_full is byte-equivalent to the no-scope path', () => {
    for (const s of sweep) {
      randomSpy.mockReturnValue(s);
      const noScope = generateProblem(1, 'Easy', [], 'times_tables');
      randomSpy.mockReturnValue(s);
      const withFull = generateProblem(1, 'Easy', [], 'times_tables', 'tt_full');
      expect(withFull).toEqual(noScope);
    }
  });

  it('unknown scope falls back to Full (silent, matches the slice-1.1 pattern)', () => {
    for (const s of [0.05, 0.5, 0.95]) {
      randomSpy.mockReturnValue(s);
      const noScope = generateProblem(1, 'Easy', [], 'times_tables');
      randomSpy.mockReturnValue(s);
      const withGarbage = generateProblem(1, 'Easy', [], 'times_tables', 'tt_made_up_scope');
      expect(withGarbage).toEqual(noScope);
    }
  });

  // ---- multi-row canonicalization sanity check ------------------------------

  it('multi-row scopes produce canonical ordering (left factor >= right factor)', () => {
    // The swap only fires when a < b. For multi-row scopes the test verifies
    // the swap actually canonicalizes: the question's left factor must be the
    // larger of the two (or equal). Note: this is a property test sampling
    // many seeds, not a single-output pin.
    const multiRowScopes = ['tt_easy', 'tt_2_5', 'tt_6_9', 'tt_10_12', 'tt_full'];
    for (const scope of multiRowScopes) {
      for (const s of sweep) {
        randomSpy.mockReturnValue(s);
        const p = generateProblem(1, 'Easy', [], 'times_tables', scope);
        const [a, b] = parseFactors(p.question);
        expect(a).toBeGreaterThanOrEqual(b);
      }
    }
  });
});

// -----------------------------------------------------------------------------
// Scope on non-scoped topics: ignored (does not narrow, does not throw).
// -----------------------------------------------------------------------------

describe('Scope: topics without scopes ignore the scope arg', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.42); });
  afterEach(() => { randomSpy.mockRestore(); });

  // advanced_squares, advanced_cubes, higher_powers, common_multiples,
  // and every Level-2 / Level-3 topic have no scope set in v1; passing a
  // scope id must be a no-op (no throw, no change vs no-scope).
  const unscopedTopics = [
    'advanced_squares',
    'advanced_cubes',
    'higher_powers',
    'common_multiples',
    'multiplication_estimation',
    'root_estimation',
    'fraction_estimation',
    'percentage_calculations',
    'strategic_mul_div',
    'divisibility_3_6_9',
    'divisibility_4_8',
    'divisibility_7',
  ];

  for (const topic of unscopedTopics) {
    it(`topic=${topic} ignores a scope arg (no-op, no throw)`, () => {
      expect(() => generateProblem(1, 'Easy', [], topic, 'arbitrary_scope_id')).not.toThrow();
    });
  }
});
