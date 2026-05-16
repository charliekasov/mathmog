/**
 * Characterization tests for `core/drill-topics.ts` (Phase 5 of @peakprep/mathmog lift).
 *
 * NOTE: imports point at the portal source while the package is being
 * scaffolded. Once `@peakprep/mathmog/core` is published, re-point the import
 * below to:
 *
 *   import {
 *     DRILL_TOPIC_REGISTRY,
 *     getTopicsForLevel,
 *     getTopicInfo,
 *     topicHasDifficulty,
 *     type DrillTopic,
 *     type DrillTopicInfo,
 *   } from '@peakprep/mathmog/core';
 *
 * Triage: see ../../triage/drill-topics-triage.md
 */

import { describe, it, expect } from 'vitest';
import {
  DRILL_TOPIC_REGISTRY,
  getTopicsForLevel,
  getTopicInfo,
  topicHasDifficulty,
  type DrillTopic,
  type DrillTopicInfo,
} from '../../src/core/drill-topics';

// ---------------------------------------------------------------------------
// DRILL_TOPIC_REGISTRY — shape, size, and entry-by-entry pinning
// ---------------------------------------------------------------------------

describe('DRILL_TOPIC_REGISTRY', () => {
  it('has exactly 15 entries', () => {
    // Pinned per Phase 5 minimum coverage spec. The mathmog-core CLAUDE.md
    // still says "16 topics" — that is documentation drift, not a bug in
    // this module. See triage doc.
    expect(DRILL_TOPIC_REGISTRY).toHaveLength(15);
  });

  it('every entry has the DrillTopicInfo shape', () => {
    for (const entry of DRILL_TOPIC_REGISTRY) {
      expect(typeof entry.id).toBe('string');
      expect(typeof entry.label).toBe('string');
      expect(typeof entry.level).toBe('number');
      expect(typeof entry.hasDifficulty).toBe('boolean');
      expect(typeof entry.description).toBe('string');
    }
  });

  it('preserves declaration order (the registry order IS the picker order)', () => {
    // Order is observable behavior — `getTopicsForLevel` and any UI iterating
    // the registry render in this order. Pinning the full ordered list.
    const ids = DRILL_TOPIC_REGISTRY.map((t) => t.id);
    expect(ids).toEqual([
      'perfect_squares',
      'perfect_cubes',
      'fraction_conversions',
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
    ]);
  });

  it('contains all 15 expected entries with exact copy and gating flags', () => {
    // Source of truth pinned per contract §1.3 table.
    const expected: DrillTopicInfo[] = [
      { id: 'perfect_squares', label: 'Perfect Squares (1-20)', level: 1, hasDifficulty: false, description: 'Squares of numbers 1 through 20' },
      { id: 'perfect_cubes', label: 'Perfect Cubes (1-10)', level: 1, hasDifficulty: false, description: 'Cubes of numbers 1 through 10' },
      { id: 'fraction_conversions', label: 'Fraction Conversions', level: 1, hasDifficulty: false, description: 'All denominators (3-9), all conversion types' },
      { id: 'advanced_squares', label: 'Advanced Squares', level: 1, hasDifficulty: false, description: 'Squares of 10, 20, 30...100' },
      { id: 'advanced_cubes', label: 'Advanced Cubes', level: 1, hasDifficulty: false, description: 'Cubes of 10, 20, 30...100' },
      { id: 'higher_powers', label: 'Higher Powers', level: 1, hasDifficulty: false, description: '2^4-2^9, 3^4-3^6, 4^4, 5^4, 6^4' },
      { id: 'common_multiples', label: 'Common Multiples', level: 1, hasDifficulty: false, description: '13-36 times various multipliers' },
      { id: 'multiplication_estimation', label: 'Multiplication Estimation', level: 2, hasDifficulty: true, description: 'Estimate products of multi-digit numbers' },
      { id: 'root_estimation', label: 'Root Estimation', level: 2, hasDifficulty: true, description: 'Square roots, cube roots, and higher roots at Hard' },
      { id: 'fraction_estimation', label: 'Fraction Estimation', level: 2, hasDifficulty: true, description: 'Estimate fraction values with 2-digit or 3-digit denominators' },
      { id: 'percentage_calculations', label: 'Percentage Calculations', level: 2, hasDifficulty: true, description: 'Round, complex, or arbitrary number percentages' },
      { id: 'strategic_mul_div', label: 'Strategic Mult & Division', level: 3, hasDifficulty: true, description: 'Multiply/divide by 4, 5, 8, 9, 11, 12, 15, 25, 19, 99; squaring X5; complementary' },
      { id: 'divisibility_3_6_9', label: 'Divisibility by 3, 6, 9', level: 3, hasDifficulty: true, description: 'Digit-sum divisibility rules' },
      { id: 'divisibility_4_8', label: 'Divisibility by 4, 8', level: 3, hasDifficulty: true, description: 'Last-digits and halving rules' },
      { id: 'divisibility_7', label: 'Advanced Divisibility (7, 11)', level: 3, hasDifficulty: true, description: 'Multiply-last-digit method (7); alternating digit sum (11)' },
    ];
    expect(DRILL_TOPIC_REGISTRY).toEqual(expected);
  });

  it('has 7 Level-1 topics, 4 Level-2 topics, and 4 Level-3 topics', () => {
    // Pinned distribution from contract §1.3; if a topic is added/moved this
    // catches it independently of the order assertion above.
    const byLevel = DRILL_TOPIC_REGISTRY.reduce<Record<number, number>>((acc, t) => {
      acc[t.level] = (acc[t.level] ?? 0) + 1;
      return acc;
    }, {});
    expect(byLevel).toEqual({ 1: 7, 2: 4, 3: 4 });
  });

  it('every Level-1 topic has hasDifficulty=false', () => {
    const level1 = DRILL_TOPIC_REGISTRY.filter((t) => t.level === 1);
    expect(level1.every((t) => t.hasDifficulty === false)).toBe(true);
  });

  it('every Level-2 and Level-3 topic has hasDifficulty=true', () => {
    const levels23 = DRILL_TOPIC_REGISTRY.filter((t) => t.level === 2 || t.level === 3);
    expect(levels23.every((t) => t.hasDifficulty === true)).toBe(true);
  });

  it('uses unique topic ids', () => {
    const ids = DRILL_TOPIC_REGISTRY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// getTopicsForLevel
// ---------------------------------------------------------------------------

describe('getTopicsForLevel', () => {
  it('returns the 7 Level-1 topics in registry order', () => {
    const result = getTopicsForLevel(1);
    expect(result.map((t) => t.id)).toEqual([
      'perfect_squares',
      'perfect_cubes',
      'fraction_conversions',
      'advanced_squares',
      'advanced_cubes',
      'higher_powers',
      'common_multiples',
    ]);
  });

  it('returns the 4 Level-2 topics in registry order', () => {
    const result = getTopicsForLevel(2);
    expect(result.map((t) => t.id)).toEqual([
      'multiplication_estimation',
      'root_estimation',
      'fraction_estimation',
      'percentage_calculations',
    ]);
  });

  it('returns the 4 Level-3 topics in registry order', () => {
    const result = getTopicsForLevel(3);
    expect(result.map((t) => t.id)).toEqual([
      'strategic_mul_div',
      'divisibility_3_6_9',
      'divisibility_4_8',
      'divisibility_7',
    ]);
  });

  it('returns an empty array for an unknown level', () => {
    expect(getTopicsForLevel(99)).toEqual([]);
  });

  it('returns an empty array for level 0', () => {
    expect(getTopicsForLevel(0)).toEqual([]);
  });

  it('returns an empty array for a negative level', () => {
    expect(getTopicsForLevel(-1)).toEqual([]);
  });

  it('returns defensive copies of registry entries (mutations do not corrupt the registry)', () => {
    const [first] = getTopicsForLevel(1);
    expect(first).not.toBe(DRILL_TOPIC_REGISTRY[0]);
    expect(first).toEqual(DRILL_TOPIC_REGISTRY[0]);
    first.label = 'mutated';
    expect(DRILL_TOPIC_REGISTRY[0].label).not.toBe('mutated');
  });
});

// ---------------------------------------------------------------------------
// getTopicInfo
// ---------------------------------------------------------------------------

describe('getTopicInfo', () => {
  it('returns the matching entry for a valid DrillTopic id', () => {
    const info = getTopicInfo('perfect_squares');
    expect(info).toEqual({
      id: 'perfect_squares',
      label: 'Perfect Squares (1-20)',
      level: 1,
      hasDifficulty: false,
      description: 'Squares of numbers 1 through 20',
    });
  });

  it('returns the matching entry for a Level-2 topic (hasDifficulty=true)', () => {
    const info = getTopicInfo('root_estimation');
    expect(info?.level).toBe(2);
    expect(info?.hasDifficulty).toBe(true);
  });

  it('returns the matching entry for a Level-3 topic', () => {
    const info = getTopicInfo('divisibility_7');
    expect(info?.label).toBe('Advanced Divisibility (7, 11)');
    expect(info?.level).toBe(3);
  });

  it('returns a defensive copy of the matching entry (mutations do not corrupt the registry)', () => {
    const info = getTopicInfo('perfect_squares');
    expect(info).not.toBe(DRILL_TOPIC_REGISTRY[0]);
    expect(info).toEqual(DRILL_TOPIC_REGISTRY[0]);
    info!.label = 'mutated';
    expect(DRILL_TOPIC_REGISTRY[0].label).not.toBe('mutated');
  });

  it('returns undefined for an unknown topic id', () => {
    expect(getTopicInfo('not_a_topic')).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(getTopicInfo('')).toBeUndefined();
  });

  it('is case-sensitive', () => {
    expect(getTopicInfo('Perfect_Squares')).toBeUndefined();
    expect(getTopicInfo('PERFECT_SQUARES')).toBeUndefined();
  });

  it('accepts arbitrary strings (signature is `topicId: string`, not `DrillTopic`)', () => {
    // Contract §1.3: getTopicInfo accepts any string, not just `DrillTopic`.
    // Pinning the loose-typing contract so a future tightening to
    // `(topicId: DrillTopic)` is a conscious decision.
    expect(() => getTopicInfo('something_random' as string)).not.toThrow();
  });

  it('resolves every DrillTopic union member', () => {
    const allIds: DrillTopic[] = [
      'perfect_squares',
      'perfect_cubes',
      'fraction_conversions',
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
    for (const id of allIds) {
      expect(getTopicInfo(id)?.id).toBe(id);
    }
  });
});

// ---------------------------------------------------------------------------
// topicHasDifficulty
// ---------------------------------------------------------------------------

describe('topicHasDifficulty', () => {
  // --- valid topics that DO have a difficulty toggle (Level 2 + Level 3) ---

  it('returns true for multiplication_estimation (Level 2)', () => {
    expect(topicHasDifficulty('multiplication_estimation')).toBe(true);
  });

  it('returns true for root_estimation (Level 2)', () => {
    expect(topicHasDifficulty('root_estimation')).toBe(true);
  });

  it('returns true for fraction_estimation (Level 2)', () => {
    expect(topicHasDifficulty('fraction_estimation')).toBe(true);
  });

  it('returns true for percentage_calculations (Level 2)', () => {
    expect(topicHasDifficulty('percentage_calculations')).toBe(true);
  });

  it('returns true for strategic_mul_div (Level 3)', () => {
    expect(topicHasDifficulty('strategic_mul_div')).toBe(true);
  });

  it('returns true for divisibility_3_6_9 (Level 3)', () => {
    expect(topicHasDifficulty('divisibility_3_6_9')).toBe(true);
  });

  it('returns true for divisibility_4_8 (Level 3)', () => {
    expect(topicHasDifficulty('divisibility_4_8')).toBe(true);
  });

  it('returns true for divisibility_7 (Level 3)', () => {
    expect(topicHasDifficulty('divisibility_7')).toBe(true);
  });

  // --- valid topics that do NOT have a difficulty toggle (all Level 1) ---

  it('returns false for perfect_squares (Level 1)', () => {
    expect(topicHasDifficulty('perfect_squares')).toBe(false);
  });

  it('returns false for perfect_cubes (Level 1)', () => {
    expect(topicHasDifficulty('perfect_cubes')).toBe(false);
  });

  it('returns false for fraction_conversions (Level 1)', () => {
    expect(topicHasDifficulty('fraction_conversions')).toBe(false);
  });

  it('returns false for advanced_squares (Level 1)', () => {
    expect(topicHasDifficulty('advanced_squares')).toBe(false);
  });

  it('returns false for advanced_cubes (Level 1)', () => {
    expect(topicHasDifficulty('advanced_cubes')).toBe(false);
  });

  it('returns false for higher_powers (Level 1)', () => {
    expect(topicHasDifficulty('higher_powers')).toBe(false);
  });

  it('returns false for common_multiples (Level 1)', () => {
    expect(topicHasDifficulty('common_multiples')).toBe(false);
  });

  // --- unknown topic: pinned suspect behavior ---

  it("returns false for 'not_a_topic' (unknown topic ids are honest about being unknown)", () => {
    // Matches the other helpers (`getTopicInfo` → undefined, `getTopicsForLevel`
    // → []): unknown topics should signal "not found" rather than silently
    // inventing a has-difficulty default.
    expect(topicHasDifficulty('not_a_topic')).toBe(false);
  });

  it('returns false for the empty string', () => {
    expect(topicHasDifficulty('')).toBe(false);
  });

  it('returns false for a similar-but-wrong topic id (case mismatch)', () => {
    expect(topicHasDifficulty('Perfect_Squares')).toBe(false);
  });
});
