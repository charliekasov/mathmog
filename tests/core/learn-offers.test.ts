// Phase 2A.5 — the F1 offer-engine substrate: Learn-side adjacency rails,
// the acquired-aware next-module resolver, and the §6.6 completion offer
// builder.

import { describe, it, expect } from 'vitest';
import {
  resolveLearnNextModule,
  validateLearnAdjacency,
  mathmogLearnCompletionOffers,
  type MathmogOffer,
} from '../../src/core/learn/offers';
import {
  MATHMOG_LEARN_MODULES,
  TIMES_TABLES_LEARN_MODULES,
} from '../../src/core/learn/modules';
import { mathmogLearnModuleId } from '../../src/core/learn/mathmog-binding';
import type { LearnModuleDef } from '../../src/core/learn/types';

const moduleById = (id: string): LearnModuleDef<string, number> => {
  const def = MATHMOG_LEARN_MODULES.find(m => m.id === id);
  if (!def) throw new Error(`test setup: unknown module ${id}`);
  return def;
};

const none = () => false;
const acquiredSet =
  (...ids: string[]) =>
  (moduleId: string) =>
    ids.includes(moduleId);

describe('Learn-side adjacency rails (curation integrity)', () => {
  it('every stored nextModuleId resolves within the registry (no dangling, no self-loops)', () => {
    expect(validateLearnAdjacency(MATHMOG_LEARN_MODULES)).toEqual([]);
  });

  it('every stored nextModuleId stays within its own topic', () => {
    for (const m of MATHMOG_LEARN_MODULES) {
      if (m.nextModuleId === undefined) continue;
      expect(m.nextModuleId.split('/')[0]).toBe(m.id.split('/')[0]);
    }
  });

  it('validateLearnAdjacency reports dangling and self-referential rails', () => {
    const stub = (id: string, nextModuleId?: string): LearnModuleDef => ({
      id,
      label: id,
      items: [{ id: 'i1', prompt: 'p', answer: 'a' }],
      distractorSets: [{ itemId: 'i1', distractors: ['b', 'c', 'd'] }],
      ...(nextModuleId !== undefined && { nextModuleId }),
    });
    const problems = validateLearnAdjacency([
      stub('t/a', 't/missing'),
      stub('t/b', 't/b'),
      stub('t/c'),
    ]);
    expect(problems).toHaveLength(2);
    expect(problems.join('\n')).toContain('unknown nextModuleId "t/missing"');
    expect(problems.join('\n')).toContain('lists itself');
  });

  it('pins the curated ladders (a curation change must be deliberate)', () => {
    const next = (id: string) => moduleById(id).nextModuleId;
    const tt = (s: string) => mathmogLearnModuleId('times_tables', s);
    const sq = (s: string) => mathmogLearnModuleId('perfect_squares', s);
    const cu = (s: string) => mathmogLearnModuleId('perfect_cubes', s);
    const fr = (s: string) => mathmogLearnModuleId('fraction_conversions', s);

    // Times Tables: singles ladder 6 → 7 → 8 → 9 → 10×–12× (F1, Daniel:
    // just_7's acquisition next is the 8× table, NOT the half-review 6×–9×).
    expect(next(tt('tt_just_6'))).toBe(tt('tt_just_7'));
    expect(next(tt('tt_just_7'))).toBe(tt('tt_just_8'));
    expect(next(tt('tt_just_8'))).toBe(tt('tt_just_9'));
    expect(next(tt('tt_just_9'))).toBe(tt('tt_10_12'));
    expect(next(tt('tt_easy'))).toBe(tt('tt_2_5'));
    expect(next(tt('tt_2_5'))).toBe(tt('tt_6_9'));
    expect(next(tt('tt_6_9'))).toBe(tt('tt_10_12'));
    expect(next(tt('tt_10_12'))).toBe(tt('tt_6_9'));
    expect(next(tt('tt_full'))).toBeUndefined();

    // Perfect Squares: gentle half-steps through the hard range; 11_20
    // points down at its unacquired complement (cubes 6_10 precedent).
    expect(next(sq('squares_1_5'))).toBe(sq('squares_1_10'));
    expect(next(sq('squares_1_10'))).toBe(sq('squares_11_15'));
    expect(next(sq('squares_11_15'))).toBe(sq('squares_16_20'));
    expect(next(sq('squares_16_20'))).toBe(sq('squares_11_15'));
    expect(next(sq('squares_11_20'))).toBe(sq('squares_1_10'));
    expect(next(sq('squares_full'))).toBeUndefined();

    // Perfect Cubes: 1–5's next is the new portion of Full (F1, Iris).
    expect(next(cu('cubes_1_3'))).toBe(cu('cubes_1_5'));
    expect(next(cu('cubes_1_5'))).toBe(cu('cubes_6_10'));
    expect(next(cu('cubes_6_10'))).toBe(cu('cubes_1_5'));
    expect(next(cu('cubes_full'))).toBeUndefined();

    // Fractions: family ladder by difficulty, ninths right after thirds
    // (n/9 = 0.nn generalizes the fresh thirds anchor — 2A.5 reviewer
    // ordering), sevenths last.
    expect(next(fr('fractions_halves_fourths'))).toBe(fr('fractions_fifths'));
    expect(next(fr('fractions_fifths'))).toBe(fr('fractions_thirds'));
    expect(next(fr('fractions_friendly'))).toBe(fr('fractions_thirds'));
    expect(next(fr('fractions_thirds'))).toBe(fr('fractions_ninths'));
    expect(next(fr('fractions_ninths'))).toBe(fr('fractions_sixths'));
    expect(next(fr('fractions_sixths'))).toBe(fr('fractions_eighths'));
    expect(next(fr('fractions_eighths'))).toBe(fr('fractions_sevenths'));
    expect(next(fr('fractions_sevenths'))).toBeUndefined();
    expect(next(fr('fractions_full'))).toBeUndefined();
  });
});

describe('resolveLearnNextModule (acquired-aware chain walk)', () => {
  it('returns the stored neighbor when it is unacquired', () => {
    const next = resolveLearnNextModule(
      moduleById('times_tables/tt_just_7'),
      MATHMOG_LEARN_MODULES,
      none
    );
    expect(next?.id).toBe('times_tables/tt_just_8');
  });

  it('walks past acquired modules to the next genuinely-new set (F1-awareness)', () => {
    const next = resolveLearnNextModule(
      moduleById('times_tables/tt_just_8'),
      MATHMOG_LEARN_MODULES,
      acquiredSet('times_tables/tt_just_9')
    );
    expect(next?.id).toBe('times_tables/tt_10_12');
  });

  it('returns null at the end of a rail (tt_full has no acquisition next)', () => {
    expect(
      resolveLearnNextModule(
        moduleById('times_tables/tt_full'),
        MATHMOG_LEARN_MODULES,
        none
      )
    ).toBeNull();
  });

  it('terminates on mutual-pair cycles when everything reachable is acquired', () => {
    expect(
      resolveLearnNextModule(
        moduleById('perfect_squares/squares_11_15'),
        MATHMOG_LEARN_MODULES,
        acquiredSet(
          'perfect_squares/squares_16_20',
          'perfect_squares/squares_11_15'
        )
      )
    ).toBeNull();
  });

  it('offers the other half of a mutual pair from either entry point', () => {
    const fromLater = resolveLearnNextModule(
      moduleById('perfect_cubes/cubes_6_10'),
      MATHMOG_LEARN_MODULES,
      none
    );
    expect(fromLater?.id).toBe('perfect_cubes/cubes_1_5');
  });

  it('returns null on a dangling rail instead of throwing', () => {
    const orphan: LearnModuleDef<string, number> = {
      ...moduleById('times_tables/tt_just_6'),
      nextModuleId: 'times_tables/tt_gone',
    };
    expect(
      resolveLearnNextModule(orphan, MATHMOG_LEARN_MODULES, none)
    ).toBeNull();
  });

  it('skips a structurally ineligible next module', () => {
    const broken: LearnModuleDef<string, number> = {
      id: 'times_tables/tt_broken',
      label: 'broken',
      items: [],
      distractorSets: [],
      nextModuleId: 'times_tables/tt_10_12',
    };
    const completed: LearnModuleDef<string, number> = {
      ...moduleById('times_tables/tt_just_9'),
      nextModuleId: 'times_tables/tt_broken',
    };
    const next = resolveLearnNextModule(
      completed,
      [...TIMES_TABLES_LEARN_MODULES, broken],
      none
    );
    expect(next?.id).toBe('times_tables/tt_10_12');
  });
});

describe('mathmogLearnCompletionOffers (§6.6 offer set)', () => {
  it('always leads with Drill-the-just-completed-set', () => {
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'times_tables/tt_just_7',
      isAcquired: none,
    });
    expect(offers[0]).toEqual({
      kind: 'drill-scope',
      topic: 'times_tables',
      scopeId: 'tt_just_7',
      scopeLabel: 'Just the 7× table',
    });
  });

  it('adds Learn-next when the rail resolves (Daniel: 7× table → 8× table)', () => {
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'times_tables/tt_just_7',
      isAcquired: none,
    });
    expect(offers).toHaveLength(2);
    expect(offers[1]).toEqual({
      kind: 'learn-module',
      moduleId: 'times_tables/tt_just_8',
      moduleLabel: 'Just the 8× table',
      topic: 'times_tables',
      scopeId: 'tt_just_8',
    });
  });

  it('omits Learn-next at the end of a rail — drill offer only, absence not narrated', () => {
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'fraction_conversions/fractions_sevenths',
      isAcquired: none,
    });
    expect(offers).toHaveLength(1);
    expect(offers[0].kind).toBe('drill-scope');
  });

  it('omits Learn-next when every reachable module is acquired', () => {
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'perfect_cubes/cubes_1_5',
      isAcquired: acquiredSet(
        'perfect_cubes/cubes_6_10',
        'perfect_cubes/cubes_1_5'
      ),
    });
    expect(offers).toHaveLength(1);
  });

  it('resolves Iris’s cubes moment: 1–5 complete → Learn the new portion (6–10)', () => {
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'perfect_cubes/cubes_1_5',
      isAcquired: none,
    });
    const learnNext = offers.find(
      (o): o is Extract<MathmogOffer, { kind: 'learn-module' }> =>
        o.kind === 'learn-module'
    );
    expect(learnNext?.moduleId).toBe('perfect_cubes/cubes_6_10');
  });

  it('honors the fact-coverage predicate contract: a TT singles climber is never offered the all-review 6×–9× (2A.5 reviewer REQUIRED pin)', () => {
    // Daniel's path: just_6 … just_9, then tt_10_12. A subsumption-aware
    // 2B.2 predicate reports tt_6_9 as acquired because every fact in it is
    // covered by the completed singles — module-id equality would NOT, and
    // would surface the F1 anti-pattern offer. This pins the contract the
    // AcquiredModulePredicate doc comment states.
    const factCoverageAware = acquiredSet(
      'times_tables/tt_just_6',
      'times_tables/tt_just_7',
      'times_tables/tt_just_8',
      'times_tables/tt_just_9',
      'times_tables/tt_10_12',
      'times_tables/tt_6_9' // subsumed: all facts covered by the singles
    );
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'times_tables/tt_10_12',
      isAcquired: factCoverageAware,
    });
    expect(offers).toHaveLength(1);
    expect(offers[0].kind).toBe('drill-scope');
  });

  it('throws loudly on malformed and unknown module ids', () => {
    expect(() =>
      mathmogLearnCompletionOffers({ completedModuleId: 'nonsense', isAcquired: none })
    ).toThrow(/malformed/);
    expect(() =>
      mathmogLearnCompletionOffers({
        completedModuleId: 'times_tables/tt_nope',
        isAcquired: none,
      })
    ).toThrow(/unknown module/);
  });

  it('offer payloads carry no score, praise, or history fields', () => {
    const offers = mathmogLearnCompletionOffers({
      completedModuleId: 'times_tables/tt_just_7',
      isAcquired: none,
    });
    for (const offer of offers) {
      const keys = Object.keys(offer).sort();
      expect(keys).not.toContain('score');
      expect(keys).not.toContain('accuracy');
      expect(keys).not.toContain('completedCount');
    }
  });
});
