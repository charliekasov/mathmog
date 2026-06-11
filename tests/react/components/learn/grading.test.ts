// Phase 2A.4 — the Recall grader and answer-display helpers.
//
// The load-bearing pin: family-member acceptance is asserted against the
// LIVE `FRACTION_ACCEPTED_DECIMALS` table (itself policy-derived since
// 2D.1), never a copied list — if the policy ever changes a family, these
// tests follow it instead of silently diverging (the Learn-vs-Drill split
// the 2D.1 derivation killed).

import { describe, it, expect } from 'vitest';
import {
  acceptedLearnAnswers,
  gradeLearnRecall,
  learnAnswerDisplay,
  learnAnswerRevealDisplay,
  learnModuleTopic,
} from '../../../../src/react/components/learn/grading';
import {
  FRACTION_ACCEPTED_DECIMALS,
  FRACTION_CONVERSIONS_LEARN_MODULES,
  MATHMOG_LEARN_MODULES,
} from '../../../../src/core/learn/modules';
import type { LearnItem } from '../../../../src/core/learn/types';

function findItem(moduleId: string, itemId: string): LearnItem<string, number> {
  const module = MATHMOG_LEARN_MODULES.find(m => m.id === moduleId);
  if (!module) throw new Error(`no module ${moduleId}`);
  const item = module.items.find(i => i.id === itemId);
  if (!item) throw new Error(`no item ${itemId} in ${moduleId}`);
  return item;
}

describe('gradeLearnRecall — fraction family acceptance (live table)', () => {
  it('accepts EVERY member of EVERY fraction item family, as typed text', () => {
    for (const module of FRACTION_CONVERSIONS_LEARN_MODULES) {
      for (const item of module.items) {
        const family = FRACTION_ACCEPTED_DECIMALS[item.id];
        expect(family, `family for ${item.id}`).toBeDefined();
        for (const member of family) {
          expect(
            gradeLearnRecall(item, String(member)).correct,
            `${item.id} should accept ${member}`
          ).toBe(true);
        }
      }
    }
  });

  it('accepts 0.83, 0.833, and 0.8333 for 5/6 (the floor-to-ceiling band)', () => {
    const item = findItem('fraction_conversions/fractions_sixths', '5/6');
    for (const typed of ['0.83', '0.833', '0.8333']) {
      expect(gradeLearnRecall(item, typed).correct, typed).toBe(true);
    }
  });

  it('rejects under-floor and off-family answers for 5/6', () => {
    const item = findItem('fraction_conversions/fractions_sixths', '5/6');
    for (const typed of ['0.8', '0.84', '0.834', '0.85', '5/6']) {
      expect(gradeLearnRecall(item, typed).correct, typed).toBe(false);
    }
  });

  it('rejects answers another fact would accept (0.83 is not 1/6)', () => {
    const item = findItem('fraction_conversions/fractions_sixths', '1/6');
    expect(gradeLearnRecall(item, '0.83').correct).toBe(false);
    expect(gradeLearnRecall(item, '0.16').correct).toBe(true);
    expect(gradeLearnRecall(item, '0.17').correct).toBe(true);
  });

  it('accepts faithful transcriptions of the displayed repeating form (reviewer-required)', () => {
    // The See card shows e.g. "0.6666…" — typing those digits must never
    // grade wrong, even past the family ceiling.
    const twoThirds = findItem('fraction_conversions/fractions_thirds', '2/3');
    expect(gradeLearnRecall(twoThirds, '0.6666').correct).toBe(true);
    expect(gradeLearnRecall(twoThirds, '0.6667').correct).toBe(true); // faithful rounding
    expect(gradeLearnRecall(twoThirds, '0.66666').correct).toBe(true);
    const oneSeventh = findItem('fraction_conversions/fractions_sevenths', '1/7');
    expect(gradeLearnRecall(oneSeventh, '0.142857').correct).toBe(true);
    const fiveNinths = findItem('fraction_conversions/fractions_ninths', '5/9');
    expect(gradeLearnRecall(fiveNinths, '0.5555').correct).toBe(true);
    expect(gradeLearnRecall(fiveNinths, '0.5556').correct).toBe(true);
  });

  it('rejects unfaithful long answers and under-floor transcriptions', () => {
    const twoThirds = findItem('fraction_conversions/fractions_thirds', '2/3');
    expect(gradeLearnRecall(twoThirds, '0.6665').correct).toBe(false);
    expect(gradeLearnRecall(twoThirds, '0.6668').correct).toBe(false);
    expect(gradeLearnRecall(twoThirds, '0.6').correct).toBe(false); // below floor
    const fiveNinths = findItem('fraction_conversions/fractions_ninths', '5/9');
    expect(gradeLearnRecall(fiveNinths, '0.5554').correct).toBe(false);
  });

  it('terminating fractions grade exact-only', () => {
    const item = findItem('fraction_conversions/fractions_eighths', '3/8');
    expect(gradeLearnRecall(item, '0.375').correct).toBe(true);
    expect(gradeLearnRecall(item, '0.37').correct).toBe(false);
    expect(gradeLearnRecall(item, '0.38').correct).toBe(false);
  });
});

describe('gradeLearnRecall — exact topics', () => {
  it('times tables grade exact', () => {
    const item = findItem('times_tables/tt_just_7', '7x8');
    expect(gradeLearnRecall(item, '56').correct).toBe(true);
    expect(gradeLearnRecall(item, ' 56 ').correct).toBe(true);
    expect(gradeLearnRecall(item, '54').correct).toBe(false);
    expect(gradeLearnRecall(item, '63').correct).toBe(false);
  });

  it('squares and cubes grade exact', () => {
    const square = findItem('perfect_squares/squares_1_10', '7^2');
    expect(gradeLearnRecall(square, '49').correct).toBe(true);
    expect(gradeLearnRecall(square, '47').correct).toBe(false);
    const cube = findItem('perfect_cubes/cubes_1_5', '3^3');
    expect(gradeLearnRecall(cube, '27').correct).toBe(true);
    expect(gradeLearnRecall(cube, '9').correct).toBe(false);
  });

  it('blank and non-numeric input is a miss with a null parsed value', () => {
    const item = findItem('times_tables/tt_just_7', '7x8');
    expect(gradeLearnRecall(item, '')).toEqual({ correct: false, value: null });
    expect(gradeLearnRecall(item, '   ')).toEqual({ correct: false, value: null });
    expect(gradeLearnRecall(item, 'fifty-six')).toEqual({
      correct: false,
      value: null,
    });
  });

  it('reports the parsed value on a numeric miss (the diagnoseMiss seam)', () => {
    const item = findItem('times_tables/tt_just_7', '7x8');
    expect(gradeLearnRecall(item, '54')).toEqual({ correct: false, value: 54 });
  });
});

describe('acceptedLearnAnswers', () => {
  it('is the live family reference for fraction items', () => {
    const item = findItem('fraction_conversions/fractions_sixths', '5/6');
    expect(acceptedLearnAnswers(item)).toBe(FRACTION_ACCEPTED_DECIMALS['5/6']);
  });

  it('is the exact answer for non-fraction items', () => {
    const item = findItem('times_tables/tt_just_7', '7x8');
    expect(acceptedLearnAnswers(item)).toEqual([56]);
  });
});

describe('learnAnswerDisplay', () => {
  it('renders repeating decimals with the full repeating form and ellipsis', () => {
    expect(
      learnAnswerDisplay(findItem('fraction_conversions/fractions_sixths', '5/6'))
    ).toBe('0.8333…');
    expect(
      learnAnswerDisplay(findItem('fraction_conversions/fractions_thirds', '2/3'))
    ).toBe('0.6666…');
    expect(
      learnAnswerDisplay(findItem('fraction_conversions/fractions_sevenths', '1/7'))
    ).toBe('0.142857…');
  });

  it('renders terminating fractions and non-fraction answers exactly', () => {
    expect(
      learnAnswerDisplay(
        findItem('fraction_conversions/fractions_halves_fourths', '1/4')
      )
    ).toBe('0.25');
    expect(learnAnswerDisplay(findItem('times_tables/tt_just_7', '7x8'))).toBe('56');
  });
});

describe('learnAnswerRevealDisplay', () => {
  it('anchors repeating decimals to the canonical precision', () => {
    expect(
      learnAnswerRevealDisplay(
        findItem('fraction_conversions/fractions_thirds', '2/3')
      )
    ).toBe('0.6666… (0.66 or 0.67 at 2 decimal places)');
    expect(
      learnAnswerRevealDisplay(
        findItem('fraction_conversions/fractions_sixths', '5/6')
      )
    ).toBe('0.8333… (0.833 at 3 decimal places)');
  });

  it('falls back to the plain display for terminating and non-fraction answers', () => {
    expect(
      learnAnswerRevealDisplay(
        findItem('fraction_conversions/fractions_halves_fourths', '1/4')
      )
    ).toBe('0.25');
    expect(
      learnAnswerRevealDisplay(findItem('times_tables/tt_just_7', '7x8'))
    ).toBe('56');
  });
});

describe('learnModuleTopic', () => {
  it('narrows registry module ids to their Memorize topic', () => {
    expect(learnModuleTopic('times_tables/tt_just_7')).toBe('times_tables');
    expect(learnModuleTopic('fraction_conversions/fractions_sixths')).toBe(
      'fraction_conversions'
    );
  });

  it('returns null for malformed or non-Memorize ids', () => {
    expect(learnModuleTopic('bogus')).toBeNull();
    expect(learnModuleTopic('estimation/anything')).toBeNull();
    expect(learnModuleTopic('/missing')).toBeNull();
  });
});
