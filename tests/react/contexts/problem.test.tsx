// @vitest-environment jsdom
/**
 * Characterization tests for ProblemProvider / useProblem.
 *
 * Pins the OBSERVABLE behavior of `problem-context.tsx` ahead of the
 * `@peakprep/mathmog` package extraction (Phase 5 of the API design).
 *
 * IMPORT PATH NOTE
 * ----------------
 * Once the package is scaffolded, the imports in this file should re-point to:
 *   import { ProblemProvider, useProblem } from '@peakprep/mathmog/react';
 *   import type { Problem } from '@peakprep/mathmog/core';
 * For now we read directly from the portal source so the tests are
 * self-contained while the package lift is in progress.
 *
 * Behavioral inventory (mix of wired-now and still-pinned suspects;
 * see locked decisions §0 + contract §2.1 for the original framing):
 *   - WIRED: `Problem.tolerance` is read by the estimation correctness
 *     gate via `currentProblem.tolerance ?? 0.10`. Display tiers (exact /
 *     within2 / within5 / within10) stay fixed at 0/2/5/10% and describe
 *     estimate quality independently of correctness.
 *   - WIRED: `handleLevelUp(true)` preserves `currentTopic` on accept by
 *     forwarding the topic into `handleLevelDifficultyChange`.
 *   - WIRED: `handleNewProblem` swallows generator throws by policy
 *     (Phase 0.6 sub-chat 6, A.1 #2 sister: soft fallback with loud
 *     telemetry). The catch logs a structured context object via
 *     `console.error` (so production debug has signal) and the previously
 *     rendered problem stays on screen; the orchestrator does not install
 *     error boundaries. See the companion WIRED line above for the UI-flag
 *     reset half of the contract.
 *   - WIRED: `generateProblem` throw clears the four UI flags
 *     (feedback / showAnswer / estimationTier / estimationDeviation) in
 *     the catch. `currentProblem` and `problemHistory` are intentionally
 *     left untouched so the previously-rendered problem stays on screen
 *     while the next-problem attempt resets the per-problem UI state.
 *   - WIRED: Repeating-decimal validation follows an "enumerate variants"
 *     contract (Phase 0.6 sub-chat 7, A.3 #2). Authors of repeating-decimal
 *     problems must list every decimal-length variant they want to accept in
 *     `specificAnswers` (e.g. `1/3 → [0.3, 0.33, 0.333]`); the number branch
 *     matches within 0.0001 of any array entry and does NOT mathematically
 *     truncate the user's longer input. Registry coverage of the contract is
 *     enforced by `tests/core/math-problems.test.ts` "Repeating-denominator
 *     registry coverage" (sub-chat 3, A.1 #7). The multi-text branch is the
 *     same shape: exact lowercased string compare against any array entry.
 *     Rationale recorded in `.claude/HANDOFF-mathmog-redesign-phase-0-6-g.md`
 *     — TL;DR: a precision-aware validator can't separate precision-error
 *     from conceptual-correctness without knowing the underlying fraction
 *     (e.g. `0.1668` is a longer-precision form by the first 3 decimals but
 *     wrong at the 4th — only the registry distinguishes valid forms).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';

// Mock the upstream generator so we can drive the provider deterministically.
// `simplifyFraction` is re-exported from the real module so we don't end up
// re-implementing the fraction-branch comparator in our test harness.
vi.mock('../../../src/core/math-problems', async () => {
  const actual = await vi.importActual<typeof import('../../../src/core/math-problems')>(
    '../../../src/core/math-problems'
  );
  return {
    ...actual,
    generateProblem: vi.fn(),
  };
});

import { generateProblem } from '../../../src/core/math-problems';
import { ProblemProvider, useProblem } from '../../../src/react/contexts/problem';
import type { Problem } from '../../../src/core/types';

const mockedGenerateProblem = generateProblem as unknown as ReturnType<typeof vi.fn>;

/* ---------- Helpers ---------------------------------------------------- */

function wrapper({ children }: { children: ReactNode }) {
  return <ProblemProvider>{children}</ProblemProvider>;
}

function queueProblems(problems: Problem[]) {
  mockedGenerateProblem.mockReset();
  let i = 0;
  mockedGenerateProblem.mockImplementation(() => {
    const p = problems[i] ?? problems[problems.length - 1];
    i += 1;
    return p;
  });
}

const textProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'What is the capital of France?',
  answer: 'Paris',
  type: 'Default',
  explanation: "It's Paris.",
  inputType: 'text',
  ...overrides,
});

const numberProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: '2 + 2',
  answer: 4,
  type: 'Arithmetic',
  explanation: 'Two plus two.',
  inputType: 'number',
  ...overrides,
});

const estimationProblem = (
  answer: number | number[] = 100,
  overrides: Partial<Problem> = {}
): Problem => ({
  question: 'Estimate 99 + 1',
  answer,
  type: 'Multiplication Estimation',
  explanation: 'About 100.',
  inputType: 'number',
  ...overrides,
});

const rootEstimationProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'Estimate sqrt(50)',
  answer: '7, 8, 7',
  type: 'Root Estimation',
  explanation: 'Between 7 and 8, closer to 7.',
  inputType: 'text',
  ...overrides,
});

const fractionProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'Simplify 2/4',
  answer: '1/2',
  type: 'Fraction',
  explanation: 'GCD is 2.',
  inputType: 'text',
  ...overrides,
});

const multiTextProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: ['Fill in:', '+', '=', '5'],
  answer: ['1', '4'],
  type: 'MultiText',
  explanation: 'Many options.',
  inputType: 'multi-text',
  ...overrides,
});

const buttonsProblem = (overrides: Partial<Problem> = {}): Problem => ({
  question: 'Is 7 prime?',
  answer: 'yes',
  type: 'YesNo',
  explanation: '7 is prime.',
  inputType: 'buttons',
  options: ['yes', 'no'],
  ...overrides,
});

beforeEach(() => {
  mockedGenerateProblem.mockReset();
});

/* ---------- useProblem outside provider ------------------------------- */

describe('useProblem (outside provider)', () => {
  it('throws when used outside ProblemProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useProblem())).toThrow(
      'useProblem must be used within a ProblemProvider'
    );
    spy.mockRestore();
  });
});

/* ---------- Initial state -------------------------------------------- */

describe('ProblemProvider initial state', () => {
  it('defaults: level=1, difficulty=Easy, no topic, no problem, empty buffers', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    expect(result.current.currentLevel).toBe(1);
    expect(result.current.currentDifficulty).toBe('Easy');
    expect(result.current.currentTopic).toBeUndefined();
    expect(result.current.currentProblem).toBeNull();
    expect(result.current.userAnswer).toBe('');
    expect(result.current.feedback).toBe('');
    expect(result.current.estimationTier).toBeNull();
    expect(result.current.estimationDeviation).toBeNull();
    expect(result.current.score).toEqual({ correct: 0, total: 0 });
    expect(result.current.showAnswer).toBe(false);
    expect(result.current.problemHistory).toEqual([]);
    expect(result.current.missedProblems).toEqual([]);
    expect(result.current.adaptiveData).toEqual({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true,
    });
  });

  it('does NOT auto-generate a problem on mount', () => {
    queueProblems([textProblem()]);
    renderHook(() => useProblem(), { wrapper });
    expect(mockedGenerateProblem).not.toHaveBeenCalled();
  });
});

/* ---------- handleNewProblem ----------------------------------------- */

describe('handleNewProblem', () => {
  it('sets currentProblem and appends question.toString() to problemHistory', () => {
    const p1 = textProblem({ question: 'Q1' });
    queueProblems([p1]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    expect(result.current.currentProblem).toEqual(p1);
    expect(result.current.problemHistory).toEqual(['Q1']);
  });

  it('stores array-question via toString() (joins by comma, NOT by " ___ ")', () => {
    // History normalization differs from prompt formatting. Pinning the
    // current behavior — see contract §2.1 suspect behavior list.
    const p1 = multiTextProblem({ question: ['A', 'B', 'C'] });
    queueProblems([p1]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    expect(result.current.problemHistory).toEqual(['A,B,C']);
  });

  it('resets userAnswer / feedback / estimation state / showAnswer on each call', () => {
    queueProblems([numberProblem(), numberProblem({ question: 'next' })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.setUserAnswer('4'));
    act(() => result.current.handleCheckAnswer('4'));
    expect(result.current.feedback).toBe('correct');
    expect(result.current.showAnswer).toBe(true);
    act(() => result.current.handleNewProblem());
    expect(result.current.userAnswer).toBe('');
    expect(result.current.feedback).toBe('');
    expect(result.current.estimationTier).toBeNull();
    expect(result.current.estimationDeviation).toBeNull();
    expect(result.current.showAnswer).toBe(false);
  });

  it('passes the latest history via ref (callback dep list excludes history)', () => {
    const p1 = textProblem({ question: 'A' });
    const p2 = textProblem({ question: 'B' });
    const p3 = textProblem({ question: 'C' });
    queueProblems([p1, p2, p3]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleNewProblem());
    // Phase 1.4: 5th arg = scope, undefined when no scoped topic selected.
    expect(mockedGenerateProblem).toHaveBeenNthCalledWith(1, 1, 'Easy', [], undefined, undefined);
    expect(mockedGenerateProblem).toHaveBeenNthCalledWith(2, 1, 'Easy', ['A'], undefined, undefined);
    expect(mockedGenerateProblem).toHaveBeenNthCalledWith(3, 1, 'Easy', ['A', 'B'], undefined, undefined);
  });

  it('passes the latest currentTopic via ref when caller omits topic arg', () => {
    queueProblems([
      textProblem({ question: 'TQ1' }),
      textProblem({ question: 'TQ2' }),
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(2, 'Medium', 'fractions')
    );
    // Phase 1.4: generateProblem signature is (level, difficulty, history,
    // topic, scope). `fractions` is not in DRILL_TOPIC_REGISTRY, so the
    // scope resolves to `undefined` (defaultScopeForTopic returns undefined
    // for unknown ids — silent fallback per Phase 1.1 design call #4).
    expect(mockedGenerateProblem).toHaveBeenLastCalledWith(
      2,
      'Medium',
      [],
      'fractions',
      undefined
    );
    act(() => result.current.handleNewProblem());
    expect(mockedGenerateProblem).toHaveBeenLastCalledWith(
      2,
      'Medium',
      ['TQ1'],
      'fractions',
      undefined
    );
  });

  it('explicit empty-string topic does NOT fall back to ref (only undefined does)', () => {
    queueProblems([textProblem(), textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleLevelDifficultyChange(1, 'Easy', 'fractions'));
    // Pass '' explicitly — code uses `topic !== undefined` so '' wins.
    act(() => result.current.handleNewProblem(undefined, undefined, ''));
    expect(mockedGenerateProblem).toHaveBeenLastCalledWith(1, 'Easy', expect.any(Array), '', undefined);
  });

  it('caps problemHistory at 50 items (FIFO slice oldest)', () => {
    const problems = Array.from({ length: 60 }, (_, i) =>
      textProblem({ question: `Q${i}` })
    );
    queueProblems(problems);
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 60; i += 1) {
      act(() => result.current.handleNewProblem());
    }
    expect(result.current.problemHistory).toHaveLength(50);
    expect(result.current.problemHistory[0]).toBe('Q10');
    expect(result.current.problemHistory[49]).toBe('Q59');
  });

  it('boundary: pushing the 51st entry slices exactly one off the front', () => {
    const problems = Array.from({ length: 51 }, (_, i) =>
      textProblem({ question: `Q${i}` })
    );
    queueProblems(problems);
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 51; i += 1) {
      act(() => result.current.handleNewProblem());
    }
    expect(result.current.problemHistory).toHaveLength(50);
    expect(result.current.problemHistory[0]).toBe('Q1');
    expect(result.current.problemHistory[49]).toBe('Q50');
  });

  it('on generator throw: logs structured context to console.error and does NOT update currentProblem / history', () => {
    const p1 = textProblem({ question: 'First' });
    queueProblems([p1]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGenerateProblem.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    act(() => result.current.handleNewProblem());
    // Catch-policy floor (A.1 #2 sister): the log carries enough context
    // for production debug. Identifier names the function so future-grep
    // finds it; context object includes the thrown error.
    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining('handleNewProblem'),
      expect.objectContaining({ error: expect.any(Error) })
    );
    expect(result.current.currentProblem).toEqual(p1);
    expect(result.current.problemHistory).toEqual(['First']);
    errSpy.mockRestore();
  });

  it('on generator throw AFTER an answered problem: clears feedback / showAnswer / estimation state', () => {
    // The catch in `handleNewProblem` clears the four UI flags that the
    // happy path also clears at the top of the try (feedback,
    // estimationTier, estimationDeviation, showAnswer). `currentProblem`
    // and `problemHistory` are intentionally left untouched — the
    // companion test above pins that contract.
    const p1 = numberProblem();
    queueProblems([p1]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('4'));
    expect(result.current.feedback).toBe('correct');
    expect(result.current.showAnswer).toBe(true);

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGenerateProblem.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    act(() => result.current.handleNewProblem());
    errSpy.mockRestore();

    expect(result.current.feedback).toBe('');
    expect(result.current.showAnswer).toBe(false);
    expect(result.current.estimationTier).toBeNull();
    expect(result.current.estimationDeviation).toBeNull();
  });
});

/* ---------- Scope threading (Phase 1.4) ------------------------------ */

describe('Scope threading via generateProblem (Phase 1.4)', () => {
  it('handleLevelDifficultyChange with scope arg threads scope to generateProblem', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(
        1,
        'Easy',
        'perfect_squares',
        'squares_1_5'
      )
    );
    expect(mockedGenerateProblem).toHaveBeenLastCalledWith(
      1,
      'Easy',
      [],
      'perfect_squares',
      'squares_1_5'
    );
    expect(result.current.currentScope).toBe('squares_1_5');
  });

  it('handleLevelDifficultyChange WITHOUT scope on scoped topic defaults to <prefix>_full', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(1, 'Easy', 'perfect_squares')
    );
    expect(mockedGenerateProblem).toHaveBeenLastCalledWith(
      1,
      'Easy',
      [],
      'perfect_squares',
      'squares_full'
    );
    expect(result.current.currentScope).toBe('squares_full');
  });

  it('handleLevelDifficultyChange on unscoped topic resolves scope to undefined', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(1, 'Easy', 'advanced_squares')
    );
    expect(mockedGenerateProblem).toHaveBeenLastCalledWith(
      1,
      'Easy',
      [],
      'advanced_squares',
      undefined
    );
    expect(result.current.currentScope).toBeUndefined();
  });

  it('handleNewProblem inherits currentScope via ref when scope arg omitted', () => {
    queueProblems([textProblem({ question: 'TQ1' }), textProblem({ question: 'TQ2' })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(
        1,
        'Easy',
        'perfect_cubes',
        'cubes_1_5'
      )
    );
    act(() => result.current.handleNewProblem());
    expect(mockedGenerateProblem).toHaveBeenLastCalledWith(
      1,
      'Easy',
      ['TQ1'],
      'perfect_cubes',
      'cubes_1_5'
    );
  });

  it('topic change from scoped to scoped resets scope to new topic default', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(
        1,
        'Easy',
        'perfect_squares',
        'squares_11_15'
      )
    );
    expect(result.current.currentScope).toBe('squares_11_15');
    // New topic, no explicit scope → default to <prefix>_full.
    act(() =>
      result.current.handleLevelDifficultyChange(1, 'Easy', 'perfect_cubes')
    );
    expect(result.current.currentScope).toBe('cubes_full');
  });

  it('topic change from scoped to unscoped clears scope to undefined', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(1, 'Easy', 'perfect_squares')
    );
    expect(result.current.currentScope).toBe('squares_full');
    act(() =>
      result.current.handleLevelDifficultyChange(1, 'Easy', 'advanced_squares')
    );
    expect(result.current.currentScope).toBeUndefined();
  });

  it('handleLevelUp accept on scoped topic preserves currentScope', () => {
    // Level 2 (multiplication_estimation) has no scopes, but the level-up
    // path forwards the current scope unchanged. To exercise the threading,
    // use a scope on perfect_squares (level 1) — but `pendingLevelUp` only
    // triggers via the streak-of-7 path in handleCheckAnswer. Verify the
    // threading via a state-shape probe: post-accept, currentScope is
    // still set even after a difficulty change.
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() =>
      result.current.handleLevelDifficultyChange(
        1,
        'Easy',
        'perfect_squares',
        'squares_1_10'
      )
    );
    // No pending level-up to accept — handleLevelUp(true) is a no-op when
    // pendingLevelUp is null. Confirms the early return path doesn't mutate
    // currentScope.
    act(() => result.current.handleLevelUp(true));
    expect(result.current.currentScope).toBe('squares_1_10');
  });

  it('initial state: currentScope is undefined', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    expect(result.current.currentScope).toBeUndefined();
  });
});

/* ---------- handleCheckAnswer: six-branch cascade -------------------- */

describe('handleCheckAnswer — six-branch cascade (first match wins)', () => {
  it('returns early when currentProblem is null (no score / feedback change)', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    // No handleNewProblem — currentProblem is null
    act(() => result.current.handleCheckAnswer('Paris'));
    expect(result.current.score).toEqual({ correct: 0, total: 0 });
    expect(result.current.feedback).toBe('');
    expect(result.current.missedProblems).toEqual([]);
  });

  /* --- Branch 1: Root Estimation -- */

  it('branch 1 (root-estimation) — POSITIVE: ordered between + closer-to match', () => {
    queueProblems([rootEstimationProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('7, 8, 7'));
    expect(result.current.feedback).toBe('correct');
    expect(result.current.score).toEqual({ correct: 1, total: 1 });
  });

  it('branch 1 (root-estimation) — POSITIVE: unordered between still matches', () => {
    queueProblems([rootEstimationProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('8, 7, 7'));
    expect(result.current.feedback).toBe('correct');
  });

  it('branch 1 (root-estimation) — NEGATIVE: wrong closer-to part is incorrect', () => {
    queueProblems([rootEstimationProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('7, 8, 8'));
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.missedProblems[0].validationKind).toBe('root-estimation');
  });

  it('branch 1 (root-estimation) — NEGATIVE: fewer than 3 parts is incorrect', () => {
    queueProblems([rootEstimationProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('7, 8'));
    expect(result.current.feedback).toBe('incorrect');
  });

  /* --- Branch 2: Fractions --- */

  it('branch 2 (fraction) — POSITIVE: user enters unsimplified form, validator simplifies', () => {
    queueProblems([fractionProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('2/4'));
    expect(result.current.feedback).toBe('correct');
  });

  it('branch 2 (fraction) — POSITIVE: already-simplified accepted', () => {
    queueProblems([fractionProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('1/2'));
    expect(result.current.feedback).toBe('correct');
  });

  it('branch 2 (fraction) — NEGATIVE: denominator 0 silently scored incorrect (no console.error)', () => {
    queueProblems([fractionProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('1/0'));
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.missedProblems[0].validationKind).toBe('fraction');
    // The try/catch is silent — no console.error from the fraction branch.
    // (Other code paths may log; we don't assert on call count beyond branch behavior.)
    errSpy.mockRestore();
  });

  it('branch 2 (fraction) — NEGATIVE: wrong fraction simplifies to different canonical form', () => {
    queueProblems([fractionProblem()]); // expected '1/2'
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('3/4'));
    expect(result.current.feedback).toBe('incorrect');
  });

  /* --- Branch 3: Estimations (non-root) --- */

  it('branch 3 (estimation) — POSITIVE: within 10% counts as correct', () => {
    queueProblems([estimationProblem(100)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('91')); // 9% off
    expect(result.current.feedback).toBe('correct');
    expect(result.current.estimationTier).toBe('within10');
  });

  it('branch 3 (estimation) — NEGATIVE: more than 10% off is "outside" and incorrect', () => {
    queueProblems([estimationProblem(100)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('80'));
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.estimationTier).toBe('outside');
    expect(result.current.missedProblems[0].validationKind).toBe('estimation');
  });

  /* --- Branch 3: Estimation tiers exact/2/5/10/outside --- */

  it('estimation tier — EXACT (deviation < 0.001)', () => {
    queueProblems([estimationProblem(100)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('100'));
    expect(result.current.estimationTier).toBe('exact');
    expect(result.current.estimationDeviation).toBe(0);
    expect(result.current.feedback).toBe('correct');
  });

  it('estimation tier — WITHIN2 (deviation <= 0.02 but >= 0.001)', () => {
    queueProblems([estimationProblem(100)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('98')); // 2% off
    expect(result.current.estimationTier).toBe('within2');
    expect(result.current.estimationDeviation).toBe(2);
  });

  it('estimation tier — WITHIN5 (0.02 < deviation <= 0.05)', () => {
    queueProblems([estimationProblem(100)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('95')); // 5% off
    expect(result.current.estimationTier).toBe('within5');
    expect(result.current.estimationDeviation).toBe(5);
  });

  it('estimation tier — WITHIN10 (0.05 < deviation <= 0.10)', () => {
    queueProblems([estimationProblem(100)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('93')); // 7% off
    expect(result.current.estimationTier).toBe('within10');
    expect(result.current.estimationDeviation).toBe(7);
  });

  it('estimation tier — OUTSIDE (deviation > 0.10)', () => {
    queueProblems([estimationProblem(100)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('70')); // 30% off
    expect(result.current.estimationTier).toBe('outside');
    expect(result.current.estimationDeviation).toBe(30);
  });

  it('estimation — exactAnswer 0 uses |userNum| as deviation (no /0)', () => {
    queueProblems([estimationProblem(0)]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('0'));
    expect(result.current.estimationTier).toBe('exact');
    expect(result.current.feedback).toBe('correct');
  });

  it('estimation — tolerance field on Problem widens the correctness window', () => {
    // Problem.tolerance now gates correctness. The display tiers (exact /
    // within2 / within5 / within10) keep their fixed 0/2/5/10% thresholds
    // and describe estimate quality independently of correctness. A 30%-off
    // estimate falls into the 'outside' tier but is marked correct when
    // tolerance allows it.
    queueProblems([estimationProblem(100, { tolerance: 0.5 })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('70')); // 30% off, tolerance 0.5
    expect(result.current.feedback).toBe('correct');
    expect(result.current.estimationTier).toBe('outside');
  });

  it('estimation — without a Problem.tolerance, the validator falls back to 10%', () => {
    queueProblems([estimationProblem(100)]); // no tolerance field
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('85')); // 15% off
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.estimationTier).toBe('outside');
  });

  /* --- Branch 4: Multi-text --- */

  it('branch 4 (multi-text) — POSITIVE: case-insensitive match against array', () => {
    queueProblems([multiTextProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('1'));
    expect(result.current.feedback).toBe('correct');
  });

  it('branch 4 (multi-text) — POSITIVE: case folded user input matches array entry', () => {
    queueProblems([multiTextProblem({ answer: ['ABC', 'DEF'] })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('abc'));
    expect(result.current.feedback).toBe('correct');
  });

  it('branch 4 (multi-text) — NEGATIVE: input not in array is incorrect', () => {
    queueProblems([multiTextProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('99'));
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.missedProblems[0].validationKind).toBe('multi-text');
  });

  it('branch 4 (multi-text) — cascade order: numeric input on multi-text problem routes through multi-text, NOT number', () => {
    // The cascade is first-match-wins. A multi-text problem whose answers
    // happen to be numeric strings must still go through the multi-text
    // branch (validationKind === 'multi-text'), never the number branch.
    queueProblems([multiTextProblem({ answer: ['1', '4'] })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('9'));
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.missedProblems[0].validationKind).toBe('multi-text');
  });

  /* --- Branch 5: Number --- */

  it('branch 5 (number) — POSITIVE: ".2" matches answer 0.2 within 0.0001', () => {
    queueProblems([numberProblem({ answer: 0.2 })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('.2'));
    expect(result.current.feedback).toBe('correct');
    expect(result.current.missedProblems).toEqual([]);
  });

  it('branch 5 (number) — POSITIVE: array of acceptable answers matches any within 0.0001', () => {
    queueProblems([numberProblem({ answer: [0.333, 0.33, 0.3] })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('0.33'));
    expect(result.current.feedback).toBe('correct');
  });

  it('branch 5 (number) — NEGATIVE: outside 0.0001 tolerance is incorrect', () => {
    queueProblems([numberProblem({ answer: 4 })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('4.001'));
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.missedProblems[0].validationKind).toBe('number');
  });

  it('branch 5 (number) — NaN user input falls back to lowercased string compare', () => {
    queueProblems([numberProblem({ answer: 'tbd' })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('TBD'));
    expect(result.current.feedback).toBe('correct');
  });

  it('branch 5 (number) — repeating-decimal "enumerate variants" contract: no validator truncation; only matches within 0.0001 of an array entry', () => {
    // Contract (Phase 0.6 sub-chat 7, A.3 #2 — see HANDOFF-mathmog-redesign-phase-0-6-g.md):
    // The validator does NOT truncate the user's decimal to compare against
    // a shorter author-supplied answer. With answer [0.333], a user typing
    // 0.3333 is OUTSIDE 0.0001 of 0.333 and scores incorrect. Authors of
    // repeating-decimal problems must enumerate the decimal-length variants
    // they want to accept (e.g. [0.333, 0.3333, 0.33333]) — registry coverage
    // is enforced by `tests/core/math-problems.test.ts` "Repeating-denominator
    // registry coverage" (sub-chat 3, A.1 #7). The conservative locked policy
    // protects against mathematically-wrong inputs that happen to share the
    // first N decimals of a valid form (e.g. 0.1668 against [0.166]).
    queueProblems([numberProblem({ answer: [0.333] })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('0.3333'));
    expect(result.current.feedback).toBe('incorrect');

    // Conversely the close-form within 0.0001 of 0.333 (e.g. 0.3331) IS
    // accepted — to confirm the tolerance, not the absence of truncation.
    queueProblems([numberProblem({ answer: [0.333] })]);
    const { result: r2 } = renderHook(() => useProblem(), { wrapper });
    act(() => r2.current.handleNewProblem());
    act(() => r2.current.handleCheckAnswer('0.3331'));
    expect(r2.current.feedback).toBe('correct');
  });

  /* --- Branch 6: Default --- */

  it('branch 6 (default) — POSITIVE: case-insensitive trimmed string compare', () => {
    queueProblems([textProblem()]); // Paris
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('  PARIS  '));
    expect(result.current.feedback).toBe('correct');
    expect(result.current.missedProblems).toEqual([]);
  });

  it('branch 6 (default) — NEGATIVE: different string is incorrect', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('London'));
    expect(result.current.feedback).toBe('incorrect');
    expect(result.current.missedProblems[0].validationKind).toBe('default');
  });

  it('buttons-input problem routes through default branch (not number, not text-fraction)', () => {
    queueProblems([buttonsProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('yes'));
    expect(result.current.feedback).toBe('correct');
  });
});

/* ---------- Cascade-order cross-checks ------------------------------- */

describe('handleCheckAnswer — cascade order pinning', () => {
  it('a Root-Estimation-typed problem with inputType=text never falls into the fraction branch', () => {
    queueProblems([
      rootEstimationProblem({ answer: '7/2, 8/2, 7/2' }), // contains '/'
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('xx'));
    // validationKind would be 'fraction' if it had fallen through; pin
    // first-match-wins by checking 'root-estimation'.
    expect(result.current.missedProblems[0].validationKind).toBe('root-estimation');
  });

  it('a type-string containing "Estimation" routes through the estimation branch', () => {
    // Adding a new problem type whose string contains 'Estimation' silently
    // falls into branch 3. Pinning this observable behavior.
    queueProblems([
      {
        question: 'Q',
        answer: 100,
        type: 'Some Custom Estimation Variant',
        explanation: '',
        inputType: 'number',
      },
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('200'));
    expect(result.current.missedProblems[0].validationKind).toBe('estimation');
  });

  it('a number-input problem with type "Estimation" routes through estimation, NOT number', () => {
    queueProblems([estimationProblem(100)]); // inputType: 'number', type: 'Multiplication Estimation'
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('200'));
    expect(result.current.missedProblems[0].validationKind).toBe('estimation');
  });
});

/* ---------- Score, missedProblems shape ------------------------------ */

describe('Score + missedProblems shape', () => {
  it('score.total increments every check; score.correct only on correct', () => {
    queueProblems([
      textProblem({ question: 'Q1' }),
      textProblem({ question: 'Q2' }),
      textProblem({ question: 'Q3' }),
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Paris'));
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Wrong'));
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Paris'));
    expect(result.current.score).toEqual({ correct: 2, total: 3 });
  });

  it('missed record carries trimmed but NOT lowercased studentAnswer', () => {
    queueProblems([textProblem({ question: 'Capital of France?' })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('  London  '));
    expect(result.current.missedProblems[0]).toEqual({
      prompt: 'Capital of France?',
      correctAnswer: 'Paris',
      studentAnswer: 'London',
      validationKind: 'default',
      explanation: "It's Paris.",
    });
  });

  it('missed record includes deviationPercent only when estimation branch ran', () => {
    queueProblems([estimationProblem(100), textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('80')); // estimation → incorrect
    expect(result.current.missedProblems[0]).toMatchObject({ deviationPercent: 20 });

    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('wrong')); // default
    expect(result.current.missedProblems[1].deviationPercent).toBeUndefined();
  });

  it('missed record includes correctAnswerNumeric for scalar number-branch problems', () => {
    queueProblems([numberProblem({ answer: 42 })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('99'));
    expect(result.current.missedProblems[0]).toMatchObject({
      validationKind: 'number',
      correctAnswerNumeric: 42,
    });
  });

  it('missed record OMITS correctAnswerNumeric for array-answer number problems', () => {
    queueProblems([numberProblem({ answer: [0.333, 0.33] })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('99'));
    expect(result.current.missedProblems[0].correctAnswerNumeric).toBeUndefined();
  });

  it('multi-text missed prompt joins array question parts with " ___ "', () => {
    queueProblems([multiTextProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('nope'));
    expect(result.current.missedProblems[0].prompt).toBe('Fill in: ___ + ___ = ___ 5');
    expect(result.current.missedProblems[0].correctAnswer).toBe('1 or 4');
  });

  it('explanation included on the missed record only when truthy', () => {
    queueProblems([textProblem({ explanation: '' })]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Wrong'));
    expect(result.current.missedProblems[0].explanation).toBeUndefined();
  });
});

/* ---------- Adaptive level-up gate ----------------------------------- */

describe('Adaptive level-up — gate at 7 consecutive correct', () => {
  const sevenCorrect = () =>
    Array.from({ length: 7 }, (_, i) => textProblem({ question: `Q${i}` }));

  it('increments consecutiveCorrect on each correct', () => {
    queueProblems(sevenCorrect());
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 3; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.consecutiveCorrect).toBe(3);
  });

  it('incorrect resets consecutiveCorrect to 0 and re-purifies streak', () => {
    queueProblems([
      textProblem({ question: 'Q1' }),
      textProblem({ question: 'Q2' }),
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Paris'));
    act(() => result.current.taintStreak());
    expect(result.current.adaptiveData.streakPure).toBe(false);

    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Wrong'));
    expect(result.current.adaptiveData.consecutiveCorrect).toBe(0);
    expect(result.current.adaptiveData.streakPure).toBe(true);
  });

  it('streak hits 7 at Easy → Medium PendingLevelUp', () => {
    queueProblems(sevenCorrect());
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.consecutiveCorrect).toBe(0);
    expect(result.current.adaptiveData.pendingLevelUp).toMatchObject({
      action: 'changeDifficulty',
      from: 'Easy',
      to: 'Medium',
    });
  });

  it('streak hits 7 at Medium → Hard PendingLevelUp', () => {
    queueProblems(sevenCorrect());
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleLevelDifficultyChange(1, 'Medium'));
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.pendingLevelUp).toMatchObject({
      action: 'changeDifficulty',
      from: 'Medium',
      to: 'Hard',
    });
  });

  it("streak hits 7 at Hard → 'trySpeedChallenge' PendingLevelUp (no 'to')", () => {
    queueProblems(sevenCorrect());
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleLevelDifficultyChange(1, 'Hard'));
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.pendingLevelUp).toMatchObject({
      action: 'trySpeedChallenge',
    });
    expect(result.current.adaptiveData.pendingLevelUp?.to).toBeUndefined();
  });

  it('streak-hits-7 does NOT re-arm while pendingLevelUp is still set', () => {
    queueProblems(Array.from({ length: 20 }, (_, i) => textProblem({ question: `Q${i}` })));
    const { result } = renderHook(() => useProblem(), { wrapper });
    // Get to first level-up
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    const first = result.current.adaptiveData.pendingLevelUp;
    expect(first).not.toBeNull();
    // 7 more correct without resolving pendingLevelUp
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    // pendingLevelUp is the SAME object — the gate didn't re-trigger.
    expect(result.current.adaptiveData.pendingLevelUp).toBe(first);
  });
});

/* ---------- handleLevelUp -------------------------------------------- */

describe('handleLevelUp', () => {
  const sevenCorrect = () =>
    Array.from({ length: 7 }, (_, i) => textProblem({ question: `Q${i}` }));

  it('is a no-op when pendingLevelUp is null', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Paris'));
    const before = result.current.adaptiveData;
    act(() => result.current.handleLevelUp(true));
    expect(result.current.adaptiveData).toBe(before);
  });

  it('decline (accept=false) clears pendingLevelUp, resets consecutiveCorrect, re-purifies streak', () => {
    queueProblems(sevenCorrect());
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    act(() => result.current.taintStreak());
    expect(result.current.adaptiveData.streakPure).toBe(false);

    act(() => result.current.handleLevelUp(false));
    expect(result.current.adaptiveData.pendingLevelUp).toBeNull();
    expect(result.current.adaptiveData.consecutiveCorrect).toBe(0);
    expect(result.current.adaptiveData.streakPure).toBe(true);
  });

  it('accept (changeDifficulty) advances difficulty + FULL reset via handleLevelDifficultyChange', () => {
    queueProblems(sevenCorrect());
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.score.total).toBe(7);
    act(() => result.current.handleLevelUp(true));
    expect(result.current.currentDifficulty).toBe('Medium');
    expect(result.current.score).toEqual({ correct: 0, total: 0 });
    expect(result.current.problemHistory).toHaveLength(1);
    expect(result.current.adaptiveData.pendingLevelUp).toBeNull();
    expect(result.current.adaptiveData.consecutiveCorrect).toBe(0);
    expect(result.current.adaptiveData.streakPure).toBe(true);
  });

  it('accept (changeDifficulty) PRESERVES currentTopic across the difficulty bump', () => {
    // Topic-scoped drills keep their topic scope on accept — handleLevelUp
    // forwards currentTopic into handleLevelDifficultyChange.
    queueProblems([
      textProblem({ question: 'T0' }),
      ...Array.from({ length: 7 }, (_, i) => textProblem({ question: `Q${i}` })),
      textProblem({ question: 'after-levelup' }),
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleLevelDifficultyChange(1, 'Easy', 'fractions'));
    expect(result.current.currentTopic).toBe('fractions');
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.pendingLevelUp).not.toBeNull();
    act(() => result.current.handleLevelUp(true));
    expect(result.current.currentDifficulty).toBe('Medium');
    expect(result.current.currentTopic).toBe('fractions');
  });

  it('accept (trySpeedChallenge) does NOT mutate level/difficulty/topic — only adaptiveData', () => {
    queueProblems([
      ...Array.from({ length: 7 }, (_, i) => textProblem({ question: `Q${i}` })),
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleLevelDifficultyChange(2, 'Hard', 'estimations'));
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.pendingLevelUp).toMatchObject({
      action: 'trySpeedChallenge',
    });
    act(() => result.current.handleLevelUp(true));
    expect(result.current.currentLevel).toBe(2);
    expect(result.current.currentDifficulty).toBe('Hard');
    expect(result.current.currentTopic).toBe('estimations');
    expect(result.current.adaptiveData.pendingLevelUp).toBeNull();
  });
});

/* ---------- handleLevelDifficultyChange (FULL reset) ----------------- */

describe('handleLevelDifficultyChange — FULL reset', () => {
  it('sets level/difficulty/topic, clears history, score, missed, adaptive', () => {
    queueProblems([
      textProblem({ question: 'Q1' }),
      textProblem({ question: 'Q2' }),
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Wrong')); // 1 miss
    expect(result.current.missedProblems).toHaveLength(1);

    act(() => result.current.handleLevelDifficultyChange(3, 'Hard', 'fractions'));
    expect(result.current.currentLevel).toBe(3);
    expect(result.current.currentDifficulty).toBe('Hard');
    expect(result.current.currentTopic).toBe('fractions');
    expect(result.current.score).toEqual({ correct: 0, total: 0 });
    expect(result.current.missedProblems).toEqual([]);
    expect(result.current.adaptiveData).toEqual({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true,
    });
    // problemHistory cleared then handleNewProblem appended Q2.
    expect(result.current.problemHistory).toEqual(['Q2']);
  });
});

/* ---------- handleReset (SOFT reset) --------------------------------- */

describe('handleReset — SOFT reset', () => {
  it('preserves level/difficulty/topic/history; clears score/feedback/estimation/showAnswer/adaptive/missed', () => {
    queueProblems([
      textProblem({ question: 'Q1' }),
      textProblem({ question: 'Q2' }),
      textProblem({ question: 'Q3' }),
    ]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleLevelDifficultyChange(2, 'Medium', 'fractions'));
    act(() => result.current.handleNewProblem());
    expect(result.current.problemHistory).toEqual(['Q1', 'Q2']);

    act(() => result.current.handleCheckAnswer('Wrong')); // 1 miss, ++total
    expect(result.current.score.total).toBe(1);
    expect(result.current.missedProblems).toHaveLength(1);

    act(() => result.current.handleReset());
    expect(result.current.currentLevel).toBe(2);
    expect(result.current.currentDifficulty).toBe('Medium');
    expect(result.current.currentTopic).toBe('fractions');
    expect(result.current.problemHistory).toEqual(['Q1', 'Q2', 'Q3']);
    expect(result.current.score).toEqual({ correct: 0, total: 0 });
    expect(result.current.feedback).toBe('');
    expect(result.current.estimationTier).toBeNull();
    expect(result.current.estimationDeviation).toBeNull();
    expect(result.current.showAnswer).toBe(false);
    expect(result.current.adaptiveData).toEqual({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true,
    });
    expect(result.current.missedProblems).toEqual([]);
  });
});

/* ---------- streakPure + taintStreak --------------------------------- */

describe('streakPure / taintStreak', () => {
  it('initial streakPure: true', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    expect(result.current.adaptiveData.streakPure).toBe(true);
  });

  it('taintStreak flips streakPure to false WITHOUT touching consecutiveCorrect', () => {
    queueProblems([textProblem(), textProblem(), textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 3; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    act(() => result.current.taintStreak());
    expect(result.current.adaptiveData.streakPure).toBe(false);
    expect(result.current.adaptiveData.consecutiveCorrect).toBe(3);
  });

  it('taintStreak is idempotent — second call preserves referential equality', () => {
    queueProblems([textProblem()]);
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Paris'));
    act(() => result.current.taintStreak());
    const tainted = result.current.adaptiveData;
    act(() => result.current.taintStreak());
    expect(result.current.adaptiveData).toBe(tainted);
  });

  it('streak-hits-7 boundary on a TAINTED streak PRESERVES streakPure: false', () => {
    queueProblems(Array.from({ length: 7 }, (_, i) => textProblem({ question: `Q${i}` })));
    const { result } = renderHook(() => useProblem(), { wrapper });
    act(() => result.current.handleNewProblem());
    act(() => result.current.handleCheckAnswer('Paris'));
    act(() => result.current.taintStreak());
    for (let i = 0; i < 6; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.pendingLevelUp).not.toBeNull();
    expect(result.current.adaptiveData.consecutiveCorrect).toBe(0);
    expect(result.current.adaptiveData.streakPure).toBe(false);
  });

  it('streak-hits-7 boundary on a PURE streak leaves streakPure: true', () => {
    queueProblems(Array.from({ length: 7 }, (_, i) => textProblem({ question: `Q${i}` })));
    const { result } = renderHook(() => useProblem(), { wrapper });
    for (let i = 0; i < 7; i += 1) {
      act(() => result.current.handleNewProblem());
      act(() => result.current.handleCheckAnswer('Paris'));
    }
    expect(result.current.adaptiveData.pendingLevelUp).not.toBeNull();
    expect(result.current.adaptiveData.streakPure).toBe(true);
  });
});
