/**
 * Unit tests for `core/learn/modules/times-tables` (Phase 2A.2 — Times
 * Tables Learn modules + hand-curated Recognize distractors).
 *
 * The load-bearing test is the 2A.1 reviewer mandate (Gap B): every exported
 * module validates clean, so a curation slip is a loud CI failure instead of
 * a silently missing Learn button. The rest pin the enumeration conventions
 * (row-first singletons, commutative dedupe + larger-factor-first multi-row
 * scopes) and a mechanical proxy for the Q6 near-miss rule. Distractor
 * PLAUSIBILITY is human-reviewed (math-ed-ux-reviewer pass per topic), not
 * tested — these tests deliberately don't pin pool contents, so curation
 * edits don't churn tests as long as the structural rules hold.
 */

import { describe, it, expect } from 'vitest';
import {
  validateLearnModuleDef,
  isLearnEligible,
  mathmogLearnModuleId,
  TIMES_TABLES_LEARN_MODULES,
  MATHMOG_LEARN_MODULES,
} from '../../src/core/learn';
import { DRILL_TOPIC_REGISTRY } from '../../src/core/drill-topics';

const ttScopes =
  DRILL_TOPIC_REGISTRY.find(t => t.id === 'times_tables')?.scopes ?? [];

const byScope = (scopeId: string) => {
  const def = TIMES_TABLES_LEARN_MODULES.find(
    m => m.id === mathmogLearnModuleId('times_tables', scopeId)
  );
  if (!def) throw new Error(`no module for scope ${scopeId}`);
  return def;
};

const factors = (itemId: string): [number, number] => {
  const [a, b] = itemId.split('x').map(Number);
  return [a, b];
};

describe('Gap B mandate — every curated module validates clean', () => {
  it.each(TIMES_TABLES_LEARN_MODULES.map(m => [m.id] as const))(
    '%s has no validation problems',
    moduleId => {
      const def = TIMES_TABLES_LEARN_MODULES.find(m => m.id === moduleId)!;
      expect(validateLearnModuleDef(def)).toEqual([]);
    }
  );

  it('every module id is Learn-eligible through the aggregate registry', () => {
    for (const def of TIMES_TABLES_LEARN_MODULES) {
      expect(isLearnEligible(MATHMOG_LEARN_MODULES, def.id)).toBe(true);
    }
  });
});

describe('registry coverage', () => {
  it('ships exactly one module per times_tables registry scope', () => {
    expect(ttScopes.length).toBeGreaterThan(0);
    const moduleIds = TIMES_TABLES_LEARN_MODULES.map(m => m.id).sort();
    const expected = ttScopes
      .map(s => mathmogLearnModuleId('times_tables', s.id))
      .sort();
    expect(moduleIds).toEqual(expected);
  });

  it('labels match the registry scope labels', () => {
    for (const scope of ttScopes) {
      expect(byScope(scope.id).label).toBe(scope.label);
    }
  });

  it('the aggregate registry contains every Times Tables module', () => {
    for (const def of TIMES_TABLES_LEARN_MODULES) {
      expect(MATHMOG_LEARN_MODULES).toContain(def);
    }
  });
});

describe('item enumeration', () => {
  it('every item answer is the product of its id factors, and prompt matches id', () => {
    for (const def of TIMES_TABLES_LEARN_MODULES) {
      for (const item of def.items) {
        const [a, b] = factors(item.id);
        expect(item.answer).toBe(a * b);
        expect(item.prompt).toBe(`${a} × ${b}`);
      }
    }
  });

  it('single-row scopes preserve row-first order: 7×2 … 7×12', () => {
    for (const row of [6, 7, 8, 9]) {
      const def = byScope(`tt_just_${row}`);
      expect(def.items).toHaveLength(11);
      expect(def.items.map(i => i.id)).toEqual(
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(b => `${row}x${b}`)
      );
    }
  });

  it('multi-row scopes present larger factor first (Drill canonical order)', () => {
    for (const scopeId of ['tt_full', 'tt_easy', 'tt_2_5', 'tt_6_9', 'tt_10_12']) {
      for (const item of byScope(scopeId).items) {
        const [a, b] = factors(item.id);
        expect(a).toBeGreaterThanOrEqual(b);
      }
    }
  });

  it('multi-row scopes dedupe commutative pairs and have the expected sizes', () => {
    const sizes: Record<string, number> = {
      tt_full: 66, // C(11,2) + 11 doubles
      tt_easy: 30, // rows 2,5,10
      tt_2_5: 38, // rows 2–5
      tt_6_9: 38, // rows 6–9
      tt_10_12: 30, // rows 10–12
    };
    for (const [scopeId, size] of Object.entries(sizes)) {
      const items = byScope(scopeId).items;
      expect(items).toHaveLength(size);
      const keys = items.map(i => {
        const [a, b] = factors(i.id);
        return a <= b ? `${a}x${b}` : `${b}x${a}`;
      });
      expect(new Set(keys).size).toBe(items.length);
    }
  });
});

describe('Q6 near-miss rule (mechanical proxy; plausibility is reviewer-gated)', () => {
  it('every distractor pool contains at least one adjacent product', () => {
    for (const def of TIMES_TABLES_LEARN_MODULES) {
      for (const set of def.distractorSets) {
        const [a, b] = factors(set.itemId);
        const adjacent = new Set([
          (a - 1) * b,
          (a + 1) * b,
          a * (b - 1),
          a * (b + 1),
        ]);
        expect(
          set.distractors.some(d => adjacent.has(d)),
          `${def.id} item ${set.itemId} has no adjacent-product near-miss`
        ).toBe(true);
      }
    }
  });

  it('odd-answer facts carry at least two odd distractors (no parity-elimination giveaway)', () => {
    for (const def of TIMES_TABLES_LEARN_MODULES) {
      for (const set of def.distractorSets) {
        const [a, b] = factors(set.itemId);
        if ((a * b) % 2 === 0) continue;
        const oddCount = set.distractors.filter(d => d % 2 === 1).length;
        expect(
          oddCount,
          `${def.id} item ${set.itemId} has ${oddCount} odd distractor(s)`
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('both presentation orders of a fact share one curated pool', () => {
    const just7 = byScope('tt_just_7');
    const full = byScope('tt_full');
    const rowFirst = just7.distractorSets.find(s => s.itemId === '7x12')!;
    const canonical = full.distractorSets.find(s => s.itemId === '12x7')!;
    expect(rowFirst.distractors).toEqual(canonical.distractors);
  });
});
