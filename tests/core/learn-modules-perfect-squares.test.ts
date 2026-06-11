/**
 * Unit tests for `core/learn/modules/perfect-squares` (Phase 2A.2 — Perfect
 * Squares Learn modules + hand-curated Recognize distractors).
 *
 * Same contract as the Times Tables test file: Gap B (every module validates
 * clean — curation slips fail CI loudly), registry coverage, enumeration
 * pins, and mechanical proxies for the Q6 near-miss rule and the parity
 * rule. Pool contents stay un-pinned; plausibility is reviewer-gated.
 */

import { describe, it, expect } from 'vitest';
import {
  validateLearnModuleDef,
  isLearnEligible,
  mathmogLearnModuleId,
  PERFECT_SQUARES_LEARN_MODULES,
  MATHMOG_LEARN_MODULES,
} from '../../src/core/learn';
import { DRILL_TOPIC_REGISTRY } from '../../src/core/drill-topics';

const sqScopes =
  DRILL_TOPIC_REGISTRY.find(t => t.id === 'perfect_squares')?.scopes ?? [];

const byScope = (scopeId: string) => {
  const def = PERFECT_SQUARES_LEARN_MODULES.find(
    m => m.id === mathmogLearnModuleId('perfect_squares', scopeId)
  );
  if (!def) throw new Error(`no module for scope ${scopeId}`);
  return def;
};

const baseOf = (itemId: string): number => Number(itemId.split('^')[0]);

describe('Gap B mandate — every curated module validates clean', () => {
  it.each(PERFECT_SQUARES_LEARN_MODULES.map(m => [m.id] as const))(
    '%s has no validation problems',
    moduleId => {
      const def = PERFECT_SQUARES_LEARN_MODULES.find(m => m.id === moduleId)!;
      expect(validateLearnModuleDef(def)).toEqual([]);
    }
  );

  it('every module id is Learn-eligible through the aggregate registry', () => {
    for (const def of PERFECT_SQUARES_LEARN_MODULES) {
      expect(isLearnEligible(MATHMOG_LEARN_MODULES, def.id)).toBe(true);
    }
  });
});

describe('registry coverage', () => {
  it('ships exactly one module per perfect_squares registry scope', () => {
    expect(sqScopes.length).toBeGreaterThan(0);
    const moduleIds = PERFECT_SQUARES_LEARN_MODULES.map(m => m.id).sort();
    const expected = sqScopes
      .map(s => mathmogLearnModuleId('perfect_squares', s.id))
      .sort();
    expect(moduleIds).toEqual(expected);
  });

  it('labels match the registry scope labels', () => {
    for (const scope of sqScopes) {
      expect(byScope(scope.id).label).toBe(scope.label);
    }
  });

  it('the aggregate registry contains every Perfect Squares module', () => {
    for (const def of PERFECT_SQUARES_LEARN_MODULES) {
      expect(MATHMOG_LEARN_MODULES).toContain(def);
    }
  });
});

describe('item enumeration', () => {
  it('every item is n² with matching prompt, ascending within its range', () => {
    const ranges: Record<string, [number, number]> = {
      squares_full: [1, 20],
      squares_1_5: [1, 5],
      squares_1_10: [1, 10],
      squares_11_15: [11, 15],
      squares_11_20: [11, 20],
      squares_16_20: [16, 20],
    };
    for (const [scopeId, [lo, hi]] of Object.entries(ranges)) {
      const items = byScope(scopeId).items;
      expect(items).toHaveLength(hi - lo + 1);
      items.forEach((item, idx) => {
        const n = lo + idx;
        expect(item.id).toBe(`${n}^2`);
        expect(item.prompt).toBe(`${n}²`);
        expect(item.answer).toBe(n * n);
      });
    }
  });
});

describe('Q6 near-miss rule (mechanical proxy; plausibility is reviewer-gated)', () => {
  it('every pool contains an adjacent square or an n²±n product', () => {
    for (const def of PERFECT_SQUARES_LEARN_MODULES) {
      for (const set of def.distractorSets) {
        const n = baseOf(set.itemId);
        const adjacent = new Set([
          (n - 1) * (n - 1),
          (n + 1) * (n + 1),
          n * n - n,
          n * n + n,
        ]);
        expect(
          set.distractors.some(d => adjacent.has(d)),
          `item ${set.itemId} has no adjacent-square / n²±n near-miss`
        ).toBe(true);
      }
    }
  });

  it('odd-answer facts carry at least two odd distractors (parity rule)', () => {
    for (const def of PERFECT_SQUARES_LEARN_MODULES) {
      for (const set of def.distractorSets) {
        const n = baseOf(set.itemId);
        if ((n * n) % 2 === 0) continue;
        const oddCount = set.distractors.filter(d => d % 2 === 1).length;
        expect(
          oddCount,
          `item ${set.itemId} has ${oddCount} odd distractor(s)`
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
