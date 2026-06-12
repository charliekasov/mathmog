// Phase 2D.3 — correct-but-enriched postscript (review proposal c).
//
// Fires ONLY for an accepted non-canonical member of a repeating fraction's
// family (rounded form, shorter truncation, over-precision transcription).
// Null — render nothing — for the canonical truncation (the taught answer),
// terminating fractions (wallpaper risk, reviewer-ratified), non-fraction
// ids, and anything the grader doesn't accept. Copy is em-dash-free per the
// 2A.4 student-copy precedent.

import { describe, it, expect } from 'vitest';
import { fractionEnrichmentPostscript } from '../../src/core/diagnosis';

describe('fractionEnrichmentPostscript — fires for non-canonical accepted members', () => {
  it('rounded form: 0.67 for 2/3 (the review ship-copy case)', () => {
    expect(fractionEnrichmentPostscript('2/3', '0.67')).toBe(
      '0.67 is the rounded form. The exact value is 0.6666…, so 0.66 or 0.67 both count.'
    );
  });

  it('rounded form: 0.17 for 1/6', () => {
    expect(fractionEnrichmentPostscript('1/6', '0.17')).toBe(
      '0.17 is the rounded form. The exact value is 0.1666…, so 0.16 or 0.17 both count.'
    );
  });

  it('rounded form: 0.143 for 1/7', () => {
    expect(fractionEnrichmentPostscript('1/7', '0.143')).toBe(
      '0.143 is the rounded form. The exact value is 0.142857…, so 0.142 or 0.143 both count.'
    );
  });

  it('short truncation: 0.83 for 5/6 (canonical is 0.833)', () => {
    expect(fractionEnrichmentPostscript('5/6', '0.83')).toBe(
      'Full story: 5/6 = 0.8333… The digits repeat forever, so 0.83, 0.833, and so on all count.'
    );
  });

  it('over-precision family member: 0.8333 for 5/6', () => {
    expect(fractionEnrichmentPostscript('5/6', '0.8333')).toBe(
      'Full story: 5/6 = 0.8333… The digits repeat forever, so 0.83, 0.833, and so on all count.'
    );
  });

  it('over-precision transcription beyond the family: 0.33333 for 1/3', () => {
    expect(fractionEnrichmentPostscript('1/3', '0.33333')).toBe(
      'Full story: 1/3 = 0.3333… The digits repeat forever, so 0.33, 0.333, and so on all count.'
    );
  });

  it('over-precision ROUNDED transcription: 0.66667 for 2/3', () => {
    expect(fractionEnrichmentPostscript('2/3', '0.66667')).toBe(
      '0.66667 is the rounded form. The exact value is 0.6666…, so 0.66666 or 0.66667 both count.'
    );
  });
});

describe('fractionEnrichmentPostscript — null (render nothing)', () => {
  it('the canonical truncation needs no enrichment', () => {
    expect(fractionEnrichmentPostscript('5/6', '0.833')).toBeNull();
    expect(fractionEnrichmentPostscript('2/3', '0.66')).toBeNull();
    expect(fractionEnrichmentPostscript('1/7', '0.142')).toBeNull();
  });

  it('never for terminating fractions (wallpaper risk, reviewer-ratified)', () => {
    expect(fractionEnrichmentPostscript('3/8', '0.375')).toBeNull();
    expect(fractionEnrichmentPostscript('1/2', '0.5')).toBeNull();
    expect(fractionEnrichmentPostscript('1/4', '0.25')).toBeNull();
  });

  it('never for values the grader does not accept', () => {
    expect(fractionEnrichmentPostscript('5/6', '0.84')).toBeNull();
    expect(fractionEnrichmentPostscript('5/6', '0.8')).toBeNull();
  });

  it('trailing-zero spellings of a family member still enrich (numerically equal, validator-accepted)', () => {
    // "0.83330" === 0.8333 numerically; the Drill's family check has always
    // accepted it, so the postscript treats it as the member it equals.
    expect(fractionEnrichmentPostscript('5/6', '0.83330')).toBe(
      'Full story: 5/6 = 0.8333… The digits repeat forever, so 0.83, 0.833, and so on all count.'
    );
  });

  it('never for non-fraction ids, unknown numerators, garbage, or blank input', () => {
    expect(fractionEnrichmentPostscript('6x8', '48')).toBeNull();
    expect(fractionEnrichmentPostscript('4/6', '0.66')).toBeNull();
    expect(fractionEnrichmentPostscript('5/6', 'abc')).toBeNull();
    expect(fractionEnrichmentPostscript('5/6', '')).toBeNull();
  });
});

describe('fractionEnrichmentPostscript — copy register', () => {
  it('contains no em-dashes (2A.4 student-copy precedent)', () => {
    for (const [id, typed] of [
      ['2/3', '0.67'],
      ['5/6', '0.83'],
      ['1/3', '0.33333'],
      ['1/6', '0.17'],
    ] as const) {
      const line = fractionEnrichmentPostscript(id, typed);
      expect(line, `${id} ⊢ ${typed}`).not.toBeNull();
      expect(line!.includes('—'), `${id} ⊢ ${typed}: ${line}`).toBe(false);
    }
  });
});
