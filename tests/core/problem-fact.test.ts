// Phase 2D.3 — `Problem.fact` stamping at generation.
//
// The Drill `Problem` historically carried no operands, so the feedback
// surfaces couldn't map a problem back to its Memorize fact. 2D.3 stamps an
// optional `fact: { topic, itemId, percentShift? }` at the generator
// branches that know their operands (chat-owned decision #1: stamp at
// generation, never parse question strings; diagnosis is silently skipped
// when the field is absent).
//
// Stamped: targeted times tables / squares / cubes / fraction generators +
// the Level-1 mixed square/cube/fraction branches.
// Deliberately NOT stamped: text-input conversion directions (decToFrac /
// percToFrac — fraction-string answers, numeric diagnosers don't apply),
// estimation and Level-2/3 problems, and advanced_squares / advanced_cubes /
// higher_powers / common_multiples (topics 2D.2 lists as having no
// diagnoser).

import { describe, it, expect } from 'vitest';
import { generateProblem } from '../../src/core/math-problems';

const RUNS = 60;

describe('Problem.fact — targeted Memorize generators', () => {
  it('times tables: itemId matches the question operands', () => {
    for (let i = 0; i < RUNS; i++) {
      const p = generateProblem(1, 'Easy', [], 'times_tables', 'tt_full');
      const m = /^(\d+) × (\d+) = \?$/.exec(String(p.question));
      expect(m).not.toBeNull();
      expect(p.fact).toEqual({ topic: 'times_tables', itemId: `${m![1]}x${m![2]}` });
    }
  });

  it('perfect squares: itemId is "<n>^2"', () => {
    for (let i = 0; i < RUNS; i++) {
      const p = generateProblem(1, 'Easy', [], 'perfect_squares', 'squares_full');
      const m = /^(\d+)² = \?$/.exec(String(p.question));
      expect(m).not.toBeNull();
      expect(p.fact).toEqual({ topic: 'perfect_squares', itemId: `${m![1]}^2` });
    }
  });

  it('perfect cubes: itemId is "<n>^3"', () => {
    for (let i = 0; i < RUNS; i++) {
      const p = generateProblem(1, 'Easy', [], 'perfect_cubes', 'cubes_full');
      const m = /^(\d+)³ = \?$/.exec(String(p.question));
      expect(m).not.toBeNull();
      expect(p.fact).toEqual({ topic: 'perfect_cubes', itemId: `${m![1]}^3` });
    }
  });

  it('fraction conversions: fracToDec/fracToPerc are stamped (percentShift on percent), text directions are not', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 300; i++) {
      const p = generateProblem(1, 'Easy', [], 'fraction_conversions', 'fractions_full');
      seen.add(p.type);
      if (p.type === 'Fraction to Decimal') {
        const m = /^Convert (\d+)\/(\d+) to a decimal/.exec(String(p.question));
        expect(m).not.toBeNull();
        expect(p.fact).toEqual({ topic: 'fraction_conversions', itemId: `${m![1]}/${m![2]}` });
      } else if (p.type === 'Fraction to Percent') {
        const m = /^Convert (\d+)\/(\d+) to a percent/.exec(String(p.question));
        expect(m).not.toBeNull();
        expect(p.fact).toEqual({
          topic: 'fraction_conversions',
          itemId: `${m![1]}/${m![2]}`,
          percentShift: true,
        });
      } else {
        // decToFrac / percToFrac: text input, fraction-string answer — no fact.
        expect(p.fact).toBeUndefined();
      }
    }
    expect(seen.has('Fraction to Decimal')).toBe(true);
    expect(seen.has('Fraction to Percent')).toBe(true);
  });
});

describe('Problem.fact — deliberately unstamped surfaces', () => {
  it('topics 2D.2 lists as having no diagnoser carry no fact', () => {
    for (const topic of ['advanced_squares', 'advanced_cubes', 'higher_powers', 'common_multiples']) {
      for (let i = 0; i < 10; i++) {
        expect(generateProblem(1, 'Easy', [], topic).fact, topic).toBeUndefined();
      }
    }
  });

  it('estimation topics carry no fact', () => {
    for (const topic of ['multiplication_estimation', 'root_estimation', 'fraction_estimation', 'percentage_calculations']) {
      for (let i = 0; i < 10; i++) {
        expect(generateProblem(2, 'Easy', [], topic).fact, topic).toBeUndefined();
      }
    }
  });

  it('Level 2 and Level 3 mixed problems carry no fact', () => {
    for (let i = 0; i < RUNS; i++) {
      expect(generateProblem(2, 'Easy', []).fact).toBeUndefined();
      expect(generateProblem(3, 'Easy', []).fact).toBeUndefined();
    }
  });
});

describe('Problem.fact — Level-1 mixed generator', () => {
  it('square / cube / fraction branches are stamped; memorized-multiplication and higher-powers are not', () => {
    for (let i = 0; i < 300; i++) {
      const p = generateProblem(1, 'Medium', []);
      if (p.type === 'Perfect Squares') {
        const m = /^(\d+)² = \?$/.exec(String(p.question));
        expect(p.fact).toEqual({ topic: 'perfect_squares', itemId: `${m![1]}^2` });
      } else if (p.type === 'Perfect Cubes') {
        const m = /^(\d+)³ = \?$/.exec(String(p.question));
        expect(p.fact).toEqual({ topic: 'perfect_cubes', itemId: `${m![1]}^3` });
      } else if (p.type === 'Fraction to Decimal' || p.type === 'Fraction to Percent') {
        expect(p.fact).toBeDefined();
        expect(p.fact!.topic).toBe('fraction_conversions');
      } else if (p.type === 'Memorized Multiplication' || p.type === 'Higher Powers & Squares') {
        expect(p.fact).toBeUndefined();
      }
    }
  });
});
