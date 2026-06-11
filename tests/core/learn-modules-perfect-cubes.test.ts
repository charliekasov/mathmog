/**
 * Unit tests for `core/learn/modules/perfect-cubes` (Phase 2A.2 — Perfect
 * Cubes Learn modules + hand-curated Recognize distractors).
 *
 * Same contract as the Times Tables / Perfect Squares test files: Gap B
 * (every module validates clean), registry coverage, enumeration pins, and
 * mechanical proxies for the Q6 near-miss rule and the parity rule. This
 * file also owns the exact aggregate-composition pin (newest topic keeps
 * it; older topic files assert containment only).
 */

import { describe, it, expect } from 'vitest';
import {
  validateLearnModuleDef,
  isLearnEligible,
  mathmogLearnModuleId,
  TIMES_TABLES_LEARN_MODULES,
  PERFECT_SQUARES_LEARN_MODULES,
  PERFECT_CUBES_LEARN_MODULES,
  MATHMOG_LEARN_MODULES,
} from '../../src/core/learn';
import { DRILL_TOPIC_REGISTRY } from '../../src/core/drill-topics';

const cubeScopes =
  DRILL_TOPIC_REGISTRY.find(t => t.id === 'perfect_cubes')?.scopes ?? [];

const byScope = (scopeId: string) => {
  const def = PERFECT_CUBES_LEARN_MODULES.find(
    m => m.id === mathmogLearnModuleId('perfect_cubes', scopeId)
  );
  if (!def) throw new Error(`no module for scope ${scopeId}`);
  return def;
};

const baseOf = (itemId: string): number => Number(itemId.split('^')[0]);

describe('Gap B mandate — every curated module validates clean', () => {
  it.each(PERFECT_CUBES_LEARN_MODULES.map(m => [m.id] as const))(
    '%s has no validation problems',
    moduleId => {
      const def = PERFECT_CUBES_LEARN_MODULES.find(m => m.id === moduleId)!;
      expect(validateLearnModuleDef(def)).toEqual([]);
    }
  );

  it('every module id is Learn-eligible through the aggregate registry', () => {
    for (const def of PERFECT_CUBES_LEARN_MODULES) {
      expect(isLearnEligible(MATHMOG_LEARN_MODULES, def.id)).toBe(true);
    }
  });
});

describe('registry coverage', () => {
  it('ships exactly one module per perfect_cubes registry scope', () => {
    expect(cubeScopes.length).toBeGreaterThan(0);
    const moduleIds = PERFECT_CUBES_LEARN_MODULES.map(m => m.id).sort();
    const expected = cubeScopes
      .map(s => mathmogLearnModuleId('perfect_cubes', s.id))
      .sort();
    expect(moduleIds).toEqual(expected);
  });

  it('labels match the registry scope labels', () => {
    for (const scope of cubeScopes) {
      expect(byScope(scope.id).label).toBe(scope.label);
    }
  });

  it('the aggregate registry is exactly TT + Squares + Cubes, in topic order', () => {
    expect(MATHMOG_LEARN_MODULES).toEqual([
      ...TIMES_TABLES_LEARN_MODULES,
      ...PERFECT_SQUARES_LEARN_MODULES,
      ...PERFECT_CUBES_LEARN_MODULES,
    ]);
  });
});

describe('item enumeration', () => {
  it('every item is n³ with matching prompt, ascending within its range', () => {
    const ranges: Record<string, [number, number]> = {
      cubes_full: [1, 10],
      cubes_1_3: [1, 3],
      cubes_1_5: [1, 5],
      cubes_6_10: [6, 10],
    };
    for (const [scopeId, [lo, hi]] of Object.entries(ranges)) {
      const items = byScope(scopeId).items;
      expect(items).toHaveLength(hi - lo + 1);
      items.forEach((item, idx) => {
        const n = lo + idx;
        expect(item.id).toBe(`${n}^3`);
        expect(item.prompt).toBe(`${n}³`);
        expect(item.answer).toBe(n * n * n);
      });
    }
  });
});

describe('Q6 near-miss rule (mechanical proxy; plausibility is reviewer-gated)', () => {
  it('every pool contains n² (forgot-the-third-factor) or an adjacent cube', () => {
    for (const def of PERFECT_CUBES_LEARN_MODULES) {
      for (const set of def.distractorSets) {
        const n = baseOf(set.itemId);
        const nearMisses = new Set([
          n * n,
          (n - 1) ** 3,
          (n + 1) ** 3,
        ]);
        expect(
          set.distractors.some(d => nearMisses.has(d)),
          `item ${set.itemId} has no n² / adjacent-cube near-miss`
        ).toBe(true);
      }
    }
  });

  it('odd-answer facts carry at least two odd distractors (parity rule)', () => {
    for (const def of PERFECT_CUBES_LEARN_MODULES) {
      for (const set of def.distractorSets) {
        const n = baseOf(set.itemId);
        if ((n * n * n) % 2 === 0) continue;
        const oddCount = set.distractors.filter(d => d % 2 === 1).length;
        expect(
          oddCount,
          `item ${set.itemId} has ${oddCount} odd distractor(s)`
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
