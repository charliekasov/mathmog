/**
 * Unit tests for `core/learn/modules/fractions` (Phase 2A.2 — Fractions ↔
 * Decimals ↔ Percents Learn modules, v1 fraction → decimal direction).
 *
 * Same contract as the other topic files: Gap B (every module validates
 * clean), registry coverage, enumeration pins, and mechanical proxies for
 * the Q6 rules — here the accepted-family exclusion, the within-set
 * confusable rule, the repeating-digit signature, the eighths terminal
 * signature, and the extremal-position rule. Pool CONTENTS stay un-pinned
 * so curation edits don't churn tests. This file also owns the exact
 * aggregate-composition pin (newest topic keeps it; older topic files
 * assert containment only).
 */

import { describe, it, expect } from 'vitest';
import {
  validateLearnModuleDef,
  isLearnEligible,
  mathmogLearnModuleId,
  TIMES_TABLES_LEARN_MODULES,
  PERFECT_SQUARES_LEARN_MODULES,
  PERFECT_CUBES_LEARN_MODULES,
  FRACTION_CONVERSIONS_LEARN_MODULES,
  FRACTION_ACCEPTED_DECIMALS,
  MATHMOG_LEARN_MODULES,
} from '../../src/core/learn';
import { DRILL_TOPIC_REGISTRY } from '../../src/core/drill-topics';

const fractionScopes =
  DRILL_TOPIC_REGISTRY.find(t => t.id === 'fraction_conversions')?.scopes ?? [];

const byScope = (scopeId: string) => {
  const def = FRACTION_CONVERSIONS_LEARN_MODULES.find(
    m => m.id === mathmogLearnModuleId('fraction_conversions', scopeId)
  );
  if (!def) throw new Error(`no module for scope ${scopeId}`);
  return def;
};

/**
 * The 27 facts and their canonical decimals (truncated repeating form at
 * the Drill's prompt precision — reviewer ruling), pinned by hand. Order
 * within each denominator is numerator-ascending; the full module presents
 * denominators ascending — the reference-card order.
 */
const CANONICAL_DECIMALS: Record<string, number> = {
  '1/2': 0.5,
  '1/3': 0.33, '2/3': 0.66,
  '1/4': 0.25, '3/4': 0.75,
  '1/5': 0.2, '2/5': 0.4, '3/5': 0.6, '4/5': 0.8,
  '1/6': 0.166, '5/6': 0.833,
  '1/7': 0.142, '2/7': 0.285, '3/7': 0.428, '4/7': 0.571, '5/7': 0.714, '6/7': 0.857,
  '1/8': 0.125, '3/8': 0.375, '5/8': 0.625, '7/8': 0.875,
  '1/9': 0.11, '2/9': 0.22, '4/9': 0.44, '5/9': 0.55, '7/9': 0.77, '8/9': 0.88,
};

/** Expected item-id lists per scope (Drill's denominator-family split). */
const SCOPE_ITEM_IDS: Record<string, string[]> = {
  fractions_full: Object.keys(CANONICAL_DECIMALS),
  fractions_friendly: ['1/2', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5'],
  fractions_halves_fourths: ['1/2', '1/4', '3/4'],
  fractions_fifths: ['1/5', '2/5', '3/5', '4/5'],
  fractions_eighths: ['1/8', '3/8', '5/8', '7/8'],
  fractions_thirds: ['1/3', '2/3'],
  fractions_sixths: ['1/6', '5/6'],
  fractions_sevenths: ['1/7', '2/7', '3/7', '4/7', '5/7', '6/7'],
  fractions_ninths: ['1/9', '2/9', '4/9', '5/9', '7/9', '8/9'],
};

describe('Gap B mandate — every curated module validates clean', () => {
  it.each(FRACTION_CONVERSIONS_LEARN_MODULES.map(m => [m.id] as const))(
    '%s has no validation problems',
    moduleId => {
      const def = FRACTION_CONVERSIONS_LEARN_MODULES.find(m => m.id === moduleId)!;
      expect(validateLearnModuleDef(def)).toEqual([]);
    }
  );

  it('every module id is Learn-eligible through the aggregate registry', () => {
    for (const def of FRACTION_CONVERSIONS_LEARN_MODULES) {
      expect(isLearnEligible(MATHMOG_LEARN_MODULES, def.id)).toBe(true);
    }
  });
});

describe('registry coverage', () => {
  it('ships exactly one module per fraction_conversions registry scope', () => {
    expect(fractionScopes.length).toBeGreaterThan(0);
    const moduleIds = FRACTION_CONVERSIONS_LEARN_MODULES.map(m => m.id).sort();
    const expected = fractionScopes
      .map(s => mathmogLearnModuleId('fraction_conversions', s.id))
      .sort();
    expect(moduleIds).toEqual(expected);
  });

  it('labels match the registry scope labels', () => {
    for (const scope of fractionScopes) {
      expect(byScope(scope.id).label).toBe(scope.label);
    }
  });

  it('the aggregate registry is exactly TT + Squares + Cubes + Fractions, in topic order', () => {
    expect(MATHMOG_LEARN_MODULES).toEqual([
      ...TIMES_TABLES_LEARN_MODULES,
      ...PERFECT_SQUARES_LEARN_MODULES,
      ...PERFECT_CUBES_LEARN_MODULES,
      ...FRACTION_CONVERSIONS_LEARN_MODULES,
    ]);
  });
});

describe('item enumeration', () => {
  it('every scope enumerates the Drill denominator family in reference-card order', () => {
    for (const [scopeId, ids] of Object.entries(SCOPE_ITEM_IDS)) {
      expect(byScope(scopeId).items.map(i => i.id)).toEqual(ids);
    }
  });

  it('prompts carry the direction; answers are the canonical decimals', () => {
    for (const item of byScope('fractions_full').items) {
      expect(item.prompt).toBe(`${item.id} as a decimal`);
      expect(item.answer).toBe(CANONICAL_DECIMALS[item.id]);
    }
  });

  it('every canonical answer is inside its Drill-accepted family', () => {
    for (const item of byScope('fractions_full').items) {
      expect(FRACTION_ACCEPTED_DECIMALS[item.id]).toContain(item.answer);
    }
  });

  it('the accepted-decimals table covers exactly the 27 facts', () => {
    expect(Object.keys(FRACTION_ACCEPTED_DECIMALS).sort()).toEqual(
      Object.keys(CANONICAL_DECIMALS).sort()
    );
  });
});

describe('Q6 rules (mechanical proxies; plausibility is reviewer-gated)', () => {
  const fullModule = byScope('fractions_full');

  it('no distractor falls inside the item\'s Drill-accepted family', () => {
    for (const set of fullModule.distractorSets) {
      const accepted = new Set(FRACTION_ACCEPTED_DECIMALS[set.itemId]);
      const leaks = set.distractors.filter(d => accepted.has(d));
      expect(leaks, `item ${set.itemId} pool contains accepted answers`).toEqual([]);
    }
  });

  it('every pool contains at least one other fact\'s canonical decimal (within-set confusable)', () => {
    const canonicals = new Set(Object.values(CANONICAL_DECIMALS));
    for (const set of fullModule.distractorSets) {
      expect(
        set.distractors.some(d => canonicals.has(d)),
        `item ${set.itemId} has no within-set confusable`
      ).toBe(true);
    }
  });

  it('doubled-digit canonicals carry at least one doubled-digit distractor (repeating signature)', () => {
    const isDoubled = (v: number) => {
      const frac = v.toString().split('.')[1] ?? '';
      return frac.length === 2 && frac[0] === frac[1];
    };
    for (const set of fullModule.distractorSets) {
      if (!isDoubled(CANONICAL_DECIMALS[set.itemId])) continue;
      expect(
        set.distractors.some(isDoubled),
        `item ${set.itemId} repeats a digit but no distractor does`
      ).toBe(true);
    }
  });

  it('eighths pools carry at least one three-place distractor ending in 5 (terminal signature)', () => {
    for (const set of byScope('fractions_eighths').distractorSets) {
      expect(
        set.distractors.some(d => {
          const milli = Math.round(d * 1000);
          return milli % 10 === 5 && d.toString().split('.')[1]?.length === 3;
        }),
        `item ${set.itemId} has no eighths-shaped distractor`
      ).toBe(true);
    }
  });

  it('the canonical is never the extremum of its pool (extremal-position rule)', () => {
    for (const set of fullModule.distractorSets) {
      const answer = CANONICAL_DECIMALS[set.itemId];
      expect(
        set.distractors.some(d => d > answer),
        `item ${set.itemId}: canonical is the guaranteed max`
      ).toBe(true);
      expect(
        set.distractors.some(d => d < answer),
        `item ${set.itemId}: canonical is the guaranteed min`
      ).toBe(true);
    }
  });
});
