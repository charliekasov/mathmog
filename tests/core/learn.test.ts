/**
 * Unit tests for `core/learn` (Phase 2A.1 — Learn-mode type vocabulary and
 * pure helpers). These pin the design rails resolved 2026-06-02 (Learn doc
 * §9, portal repo): the see→recognize→recall ladder, Recognize as the
 * starting tier (Q3), recalled-correctly-twice as a tunable threshold (Q5),
 * miss = tier drop (§2.4), count-only progress (Q4), and the Recognize
 * distractor-coverage rule (Q6 / §1.1 four options).
 */

import { describe, it, expect } from 'vitest';
import {
  LEARN_TIER_LADDER,
  RECOGNIZE_OPTION_COUNT,
  INITIAL_LEARN_TIER,
  isQuizzedTier,
  escalateTier,
  dropTier,
  createInitialItemState,
  createInitialItemStates,
  applySeen,
  applyCorrectAnswer,
  applyMiss,
  isItemSolid,
  deriveItemStatus,
  solidProgress,
  isModuleComplete,
  assembleRecognizeOptions,
  validateLearnModuleDef,
  isLearnEligibleModule,
  isLearnEligible,
  MATHMOG_LEARN_CONFIG,
  MEMORIZE_LEARN_TOPICS,
  mathmogLearnModuleId,
  parseMathmogLearnModuleId,
  type LearnConfig,
  type LearnItemState,
  type LearnModuleDef,
} from '../../src/core/learn';
import { getTopicsForLevel } from '../../src/core/drill-topics';

const config: LearnConfig = { recallsToSolid: 2 };

function makeModule(
  overrides: Partial<LearnModuleDef<string, string>> = {}
): LearnModuleDef<string, string> {
  return {
    id: 'times_tables/tt_just_7',
    label: 'Just the 7× table',
    items: [
      { id: '7x2', prompt: '7 × 2', answer: '14' },
      { id: '7x3', prompt: '7 × 3', answer: '21' },
    ],
    distractorSets: [
      { itemId: '7x2', distractors: ['12', '16', '21'] },
      { itemId: '7x3', distractors: ['24', '18', '28'] },
    ],
    ...overrides,
  };
}

describe('tier ladder', () => {
  it('is see → recognize → recall, in order', () => {
    expect(LEARN_TIER_LADDER).toEqual(['see', 'recognize', 'recall']);
  });

  it('escalateTier climbs one rung and clamps at recall', () => {
    expect(escalateTier('see')).toBe('recognize');
    expect(escalateTier('recognize')).toBe('recall');
    expect(escalateTier('recall')).toBe('recall');
  });

  it('dropTier descends one rung and clamps at see', () => {
    expect(dropTier('recall')).toBe('recognize');
    expect(dropTier('recognize')).toBe('see');
    expect(dropTier('see')).toBe('see');
  });

  it('isQuizzedTier excludes only see', () => {
    expect(isQuizzedTier('see')).toBe(false);
    expect(isQuizzedTier('recognize')).toBe(true);
    expect(isQuizzedTier('recall')).toBe(true);
  });
});

describe('assembleRecognizeOptions', () => {
  const item = { id: '7x8', prompt: '7 × 8', answer: '56' };
  const set = { itemId: '7x8', distractors: ['54', '63', '48', '49', '64'] };

  it('builds exactly RECOGNIZE_OPTION_COUNT options with the answer placed once', () => {
    for (let seed = 0; seed < 20; seed++) {
      let n = seed;
      const rng = () => ((n = (n * 9301 + 49297) % 233280), n / 233280);
      const { options, correctIndex } = assembleRecognizeOptions(item, set, rng);
      expect(options).toHaveLength(RECOGNIZE_OPTION_COUNT);
      expect(options[correctIndex]).toBe('56');
      expect(options.filter(o => o === '56')).toHaveLength(1);
      expect(new Set(options).size).toBe(options.length);
    }
  });

  it('is deterministic under a fixed rng', () => {
    const rng = () => 0.42;
    const a = assembleRecognizeOptions(item, set, rng);
    const b = assembleRecognizeOptions(item, set, rng);
    expect(a).toEqual(b);
  });

  it('varies distractor selection when the pool exceeds the option count', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      let n = seed * 7919;
      const rng = () => ((n = (n * 9301 + 49297) % 233280), n / 233280);
      const { options } = assembleRecognizeOptions(item, set, rng);
      seen.add([...options].sort().join(','));
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('initial item state', () => {
  it('starts at Recognize (Q3: no calibration pre-pass), zero counters', () => {
    expect(INITIAL_LEARN_TIER).toBe('recognize');
    expect(createInitialItemState('7x2')).toEqual({
      itemId: '7x2',
      tier: 'recognize',
      correctRecalls: 0,
      attempts: 0,
      misses: 0,
    });
  });

  it('createInitialItemStates covers every module item', () => {
    const states = createInitialItemStates(makeModule());
    expect(states.map(s => s.itemId)).toEqual(['7x2', '7x3']);
    expect(states.every(s => s.tier === 'recognize')).toBe(true);
  });

  it('a fresh item derives status new', () => {
    expect(deriveItemStatus(createInitialItemState('7x2'), config)).toBe('new');
  });
});

describe('answer application', () => {
  const fresh = createInitialItemState('7x2');

  it('correct at recognize escalates to recall without counting a recall', () => {
    const next = applyCorrectAnswer(fresh);
    expect(next.tier).toBe('recall');
    expect(next.correctRecalls).toBe(0);
    expect(next.attempts).toBe(1);
    expect(next.misses).toBe(0);
  });

  it('correct at recall counts toward completion and stays at recall', () => {
    const atRecall = applyCorrectAnswer(fresh);
    const next = applyCorrectAnswer(atRecall);
    expect(next.tier).toBe('recall');
    expect(next.correctRecalls).toBe(1);
    expect(next.attempts).toBe(2);
  });

  it('miss drops a tier and counts the miss', () => {
    const next = applyMiss(fresh);
    expect(next.tier).toBe('see');
    expect(next.attempts).toBe(1);
    expect(next.misses).toBe(1);
  });

  it('miss preserves earned correctRecalls (at-least-twice, not twice-in-a-row)', () => {
    const oneRecall: LearnItemState = {
      itemId: '7x2',
      tier: 'recall',
      correctRecalls: 1,
      attempts: 3,
      misses: 0,
    };
    const next = applyMiss(oneRecall);
    expect(next.correctRecalls).toBe(1);
    expect(next.tier).toBe('recognize');
  });

  it('applySeen escalates see → recognize without counting an attempt', () => {
    const atSee = applyMiss(fresh);
    const next = applySeen(atSee);
    expect(next.tier).toBe('recognize');
    expect(next.attempts).toBe(atSee.attempts);
  });

  it('quizzed-tier helpers are no-ops at see; applySeen is a no-op elsewhere', () => {
    const atSee = applyMiss(fresh);
    expect(applyCorrectAnswer(atSee)).toBe(atSee);
    expect(applyMiss(atSee)).toBe(atSee);
    expect(applySeen(fresh)).toBe(fresh);
  });

  it('does not mutate the input state', () => {
    const before = { ...fresh };
    applyCorrectAnswer(fresh);
    applyMiss(fresh);
    expect(fresh).toEqual(before);
  });
});

describe('completion and status', () => {
  it('an item is solid at the configured recall threshold (Q5 tunable)', () => {
    const one: LearnItemState = { itemId: 'x', tier: 'recall', correctRecalls: 1, attempts: 2, misses: 0 };
    const two: LearnItemState = { ...one, correctRecalls: 2 };
    expect(isItemSolid(one, config)).toBe(false);
    expect(isItemSolid(two, config)).toBe(true);
    expect(isItemSolid(one, { recallsToSolid: 1 })).toBe(true);
  });

  it('derives new / learning / solid from counters', () => {
    const fresh = createInitialItemState('x');
    const attempted = applyCorrectAnswer(fresh);
    const solid: LearnItemState = { ...attempted, correctRecalls: 2 };
    expect(deriveItemStatus(fresh, config)).toBe('new');
    expect(deriveItemStatus(attempted, config)).toBe('learning');
    expect(deriveItemStatus(solid, config)).toBe('solid');
  });

  it('solidProgress yields the count pair behind "Facts solid: N of M" (Q4)', () => {
    const states: LearnItemState[] = [
      { itemId: 'a', tier: 'recall', correctRecalls: 2, attempts: 4, misses: 0 },
      { itemId: 'b', tier: 'recall', correctRecalls: 1, attempts: 3, misses: 1 },
      { itemId: 'c', tier: 'recognize', correctRecalls: 0, attempts: 0, misses: 0 },
    ];
    expect(solidProgress(states, config)).toEqual({ solid: 1, total: 3 });
  });

  it('a module completes when every item is solid, and never when empty', () => {
    const solid: LearnItemState = { itemId: 'a', tier: 'recall', correctRecalls: 2, attempts: 4, misses: 0 };
    expect(isModuleComplete([solid], config)).toBe(true);
    expect(isModuleComplete([solid, createInitialItemState('b')], config)).toBe(false);
    expect(isModuleComplete([], config)).toBe(false);
  });

  it('the full acquisition arc for one item reaches solid', () => {
    let s = createInitialItemState('7x8');
    s = applyCorrectAnswer(s); // recognize → recall
    s = applyCorrectAnswer(s); // recall #1
    s = applyMiss(s); // drop to recognize, recalls preserved
    s = applyCorrectAnswer(s); // back to recall
    s = applyCorrectAnswer(s); // recall #2 → solid
    expect(isItemSolid(s, config)).toBe(true);
    expect(deriveItemStatus(s, config)).toBe('solid');
  });
});

describe('module validation and eligibility', () => {
  it('a curated module with full coverage is valid and eligible', () => {
    const def = makeModule();
    expect(validateLearnModuleDef(def)).toEqual([]);
    expect(isLearnEligibleModule(def)).toBe(true);
  });

  it('flags an empty item set', () => {
    const def = makeModule({ items: [], distractorSets: [] });
    expect(validateLearnModuleDef(def)).toEqual([
      'module "times_tables/tt_just_7" has no items',
    ]);
    expect(isLearnEligibleModule(def)).toBe(false);
  });

  it('flags an empty-string item id', () => {
    const def = makeModule({
      items: [{ id: '', prompt: '7 × 2', answer: '14' }],
      distractorSets: [],
    });
    expect(validateLearnModuleDef(def)).toContain(
      'module "times_tables/tt_just_7" has an item with an empty id'
    );
  });

  it('flags items with no distractor set', () => {
    const def = makeModule({
      distractorSets: [{ itemId: '7x2', distractors: ['12', '16', '21'] }],
    });
    expect(validateLearnModuleDef(def)).toEqual([
      'item "7x3" has no distractor set',
    ]);
  });

  it('flags thin distractor coverage against the four-option Recognize tier', () => {
    const def = makeModule({
      distractorSets: [
        { itemId: '7x2', distractors: ['12', '16'] },
        { itemId: '7x3', distractors: ['24', '18', '28'] },
      ],
    });
    expect(validateLearnModuleDef(def)).toEqual([
      `item "7x2" has 2 distractors; needs at least ${RECOGNIZE_OPTION_COUNT - 1}`,
    ]);
  });

  it('flags a distractor equal to the correct answer', () => {
    const def = makeModule({
      distractorSets: [
        { itemId: '7x2', distractors: ['14', '16', '21'] },
        { itemId: '7x3', distractors: ['24', '18', '28'] },
      ],
    });
    expect(validateLearnModuleDef(def)).toEqual([
      'item "7x2" has a distractor equal to its correct answer',
    ]);
  });

  it('flags duplicate item ids, duplicate sets, duplicate distractors, unknown items', () => {
    const def = makeModule({
      items: [
        { id: '7x2', prompt: '7 × 2', answer: '14' },
        { id: '7x2', prompt: '7 × 2', answer: '14' },
      ],
      distractorSets: [
        { itemId: '7x2', distractors: ['12', '12', '21'] },
        { itemId: '7x2', distractors: ['12', '16', '21'] },
        { itemId: 'ghost', distractors: ['1', '2', '3'] },
      ],
    });
    const problems = validateLearnModuleDef(def);
    expect(problems).toContain(
      'module "times_tables/tt_just_7" has duplicate item id "7x2"'
    );
    expect(problems).toContain(
      'module "times_tables/tt_just_7" has duplicate distractor sets for item "7x2"'
    );
    expect(problems).toContain('item "7x2" has duplicate distractors');
    expect(problems).toContain(
      'module "times_tables/tt_just_7" has a distractor set for unknown item "ghost"'
    );
  });

  it('isLearnEligible answers the ready-screen question (Q2)', () => {
    const modules = [makeModule()];
    expect(isLearnEligible(modules, 'times_tables/tt_just_7')).toBe(true);
    expect(isLearnEligible(modules, 'times_tables/tt_full')).toBe(false);
    expect(isLearnEligible([], 'times_tables/tt_just_7')).toBe(false);
  });
});

describe('Math Mog binding', () => {
  it('pins recalled-correctly-twice as the product threshold (Q5)', () => {
    expect(MATHMOG_LEARN_CONFIG.recallsToSolid).toBe(2);
  });

  it('module id round-trips topic/scope', () => {
    const id = mathmogLearnModuleId('times_tables', 'tt_just_7');
    expect(id).toBe('times_tables/tt_just_7');
    expect(parseMathmogLearnModuleId(id)).toEqual({
      topic: 'times_tables',
      scopeId: 'tt_just_7',
    });
  });

  it('parse rejects malformed ids', () => {
    expect(parseMathmogLearnModuleId('tt_just_7')).toBeNull();
    expect(parseMathmogLearnModuleId('a/b/c')).toBeNull();
    expect(parseMathmogLearnModuleId('/tt_just_7')).toBeNull();
    expect(parseMathmogLearnModuleId('times_tables/')).toBeNull();
  });

  it('MEMORIZE_LEARN_TOPICS matches the level-1 (Memorize) registry exactly', () => {
    const level1 = getTopicsForLevel(1).map(t => t.id).sort();
    expect([...MEMORIZE_LEARN_TOPICS].sort()).toEqual(level1);
  });
});
