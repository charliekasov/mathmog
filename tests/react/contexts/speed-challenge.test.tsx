// @vitest-environment jsdom
//
// Characterization tests for SpeedChallengeProvider / useSpeedChallenge.
//
// Source under test (pre-lift, in the portal):
//   src/context/mathmog/speed-challenge-context.tsx
//
// Post-lift: re-point the import to `@peakprep/mathmog/react`.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  SpeedChallengeProvider,
  useSpeedChallenge,
} from '../../../src/react/contexts/speed-challenge';

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

function wrapper({ children }: { children: ReactNode }) {
  return <SpeedChallengeProvider>{children}</SpeedChallengeProvider>;
}

function mountHook() {
  return renderHook(() => useSpeedChallenge(), { wrapper });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Provider boundary + default state
// ---------------------------------------------------------------------------

describe('useSpeedChallenge — provider boundary', () => {
  it('throws when called outside SpeedChallengeProvider', () => {
    // renderHook surfaces the thrown error via .result.error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSpeedChallenge())).toThrow(
      /useSpeedChallenge must be used within a SpeedChallengeProvider/
    );
    spy.mockRestore();
  });

  it('exposes the default speedChallenge state on first mount', () => {
    const { result } = mountHook();
    expect(result.current.speedChallenge).toEqual({
      enabled: false,
      duration: 2,
      timeLeft: 0,
      isActive: false,
      results: null,
    });
  });

  it('exposes the documented context surface (4 keys)', () => {
    const { result } = mountHook();
    expect(typeof result.current.handleStartSpeedChallenge).toBe('function');
    expect(typeof result.current.clearSpeedChallengeResults).toBe('function');
    expect(typeof result.current.setSpeedChallenge).toBe('function');
    expect(result.current.speedChallenge).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// handleStartSpeedChallenge semantics
// ---------------------------------------------------------------------------

describe('handleStartSpeedChallenge', () => {
  it('flips isActive=true, seeds timeLeft from duration*60, and clears results', () => {
    const { result } = mountHook();

    // Pre-seed results to confirm they get cleared on start.
    act(() => {
      result.current.setSpeedChallenge(prev => ({
        ...prev,
        duration: 3,
        results: { ended: true },
      }));
    });

    act(() => {
      result.current.handleStartSpeedChallenge();
    });

    expect(result.current.speedChallenge.isActive).toBe(true);
    expect(result.current.speedChallenge.timeLeft).toBe(3 * 60);
    expect(result.current.speedChallenge.results).toBeNull();
  });

  it('does NOT toggle enabled (orthogonal user-intent flag)', () => {
    const { result } = mountHook();

    // Start with enabled=false (default)
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    expect(result.current.speedChallenge.enabled).toBe(false);

    // Now set enabled=true and start again — start must not flip it back off.
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, enabled: true }));
    });
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    expect(result.current.speedChallenge.enabled).toBe(true);
  });

  it('preserves duration when starting', () => {
    const { result } = mountHook();
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, duration: 5 }));
    });
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    expect(result.current.speedChallenge.duration).toBe(5);
    expect(result.current.speedChallenge.timeLeft).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// clearSpeedChallengeResults
// ---------------------------------------------------------------------------

describe('clearSpeedChallengeResults', () => {
  it('sets results back to null and leaves other fields untouched', () => {
    const { result } = mountHook();

    act(() => {
      result.current.setSpeedChallenge(prev => ({
        ...prev,
        enabled: true,
        duration: 4,
        timeLeft: 30,
        isActive: false,
        results: { ended: true },
      }));
    });

    act(() => {
      result.current.clearSpeedChallengeResults();
    });

    expect(result.current.speedChallenge).toEqual({
      enabled: true,
      duration: 4,
      timeLeft: 30,
      isActive: false,
      results: null,
    });
  });
});

// ---------------------------------------------------------------------------
// Interval cadence — required Phase 5 coverage
// ---------------------------------------------------------------------------

describe('interval cadence (decrements every 1000ms)', () => {
  it('does not start a ticking interval until isActive is true', () => {
    const { result } = mountHook();
    // Default state: isActive=false, timeLeft=0. Advance time and assert no drift.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(0);
    expect(result.current.speedChallenge.isActive).toBe(false);
  });

  it('decrements timeLeft by 1 after exactly 1000ms', () => {
    const { result } = mountHook();
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    expect(result.current.speedChallenge.timeLeft).toBe(120);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(119);
  });

  it('does not decrement before 1000ms elapses', () => {
    const { result } = mountHook();
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(120);
  });

  it('continues decrementing across multiple ticks', () => {
    const { result } = mountHook();
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, duration: 1 })); // 60s
    });
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    expect(result.current.speedChallenge.timeLeft).toBe(60);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(59);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(58);

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(55);
  });
});

// ---------------------------------------------------------------------------
// End-of-round transition — required Phase 5 coverage
// ---------------------------------------------------------------------------

describe('end-of-round transition (results !== null && !isActive)', () => {
  it('does not yet emit results while timeLeft > 0', () => {
    const { result } = mountHook();
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.speedChallenge.isActive).toBe(true);
    expect(result.current.speedChallenge.results).toBeNull();
  });

  it('finishes the round once timeLeft reaches 0: isActive=false AND results set', () => {
    const { result } = mountHook();

    // Use a small duration so we can wind it down deterministically.
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, duration: 2 })); // 120s
    });
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    expect(result.current.speedChallenge.timeLeft).toBe(120);

    // Advance 120 seconds: ticks the timer down to 0.
    act(() => {
      vi.advanceTimersByTime(120_000);
    });

    // After timeLeft hits 0, the effect re-runs with [isActive, timeLeft] = [true, 0],
    // taking Branch B which writes isActive=false and a results placeholder.
    // The state update may need one more flush.
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.speedChallenge.isActive).toBe(false);
    expect(result.current.speedChallenge.results).not.toBeNull();
    // Round-finished signal:
    expect(
      result.current.speedChallenge.results !== null &&
        !result.current.speedChallenge.isActive
    ).toBe(true);
  });

  it('emits the tagged ended-signal when the round timer expires', () => {
    const { result } = mountHook();
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, duration: 1 })); // 60s
    });
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // results is a tag — it signals "the round ended" without claiming to
    // carry the score. Consumers read the live score from useProblem().
    expect(result.current.speedChallenge.results).toEqual({ ended: true });
  });

  it('does not transition to finished when isActive is false even if timeLeft <= 0', () => {
    const { result } = mountHook();
    // Default: isActive=false, timeLeft=0. Advance — Branch B should NOT fire because
    // the guard is `timeLeft <= 0 && isActive`.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.speedChallenge.isActive).toBe(false);
    expect(result.current.speedChallenge.results).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interval cleanup
// ---------------------------------------------------------------------------

describe('interval cleanup', () => {
  it('clears the active interval on unmount (no orphaned ticks)', () => {
    const clearSpy = vi.spyOn(global, 'clearInterval');

    const { result, unmount } = mountHook();
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    // Now an interval is installed.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(119);

    unmount();

    // After unmount, clearInterval must have been called for the active timer.
    expect(clearSpy).toHaveBeenCalled();

    // And no further ticks should fire (no React errors, no pending timers running
    // on a torn-down tree).
    expect(() => vi.advanceTimersByTime(5000)).not.toThrow();
  });

  it('does not throw if unmounted before any timer was started', () => {
    const { unmount } = mountHook();
    expect(() => unmount()).not.toThrow();
  });

  it('tears down and reinstalls the interval on each tick (cleanup before re-install)', () => {
    // Each tick changes timeLeft, which is in the effect deps. The effect therefore
    // cleans up the previous setInterval and installs a new one. Cadence stays 1s.
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { result } = mountHook();
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, duration: 1 })); // 60s
    });
    act(() => {
      result.current.handleStartSpeedChallenge();
    });

    const setCallsAfterStart = setIntervalSpy.mock.calls.length;
    const clearCallsAfterStart = clearIntervalSpy.mock.calls.length;

    act(() => {
      vi.advanceTimersByTime(1000); // one tick
    });

    // One additional setInterval install and one additional clearInterval should
    // have happened on the dep change.
    expect(setIntervalSpy.mock.calls.length).toBeGreaterThan(setCallsAfterStart);
    expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(clearCallsAfterStart);
    expect(result.current.speedChallenge.timeLeft).toBe(59);
  });
});

// ---------------------------------------------------------------------------
// Raw setSpeedChallenge exposure
// ---------------------------------------------------------------------------

describe('setSpeedChallenge (raw setter exposure)', () => {
  it('allows callers to mutate any field directly — enabled', () => {
    const { result } = mountHook();
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, enabled: true }));
    });
    expect(result.current.speedChallenge.enabled).toBe(true);
  });

  it('allows callers to clear results directly via the raw setter', () => {
    const { result } = mountHook();

    // Drive the timer to the end of the round.
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, duration: 1 }));
    });
    act(() => {
      result.current.handleStartSpeedChallenge();
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current.speedChallenge.results).toEqual({ ended: true });

    // Orchestrators can clear results back to null (e.g. on a level-up
    // accept or on returning to the ready screen).
    act(() => {
      result.current.setSpeedChallenge(prev => ({ ...prev, results: null }));
    });

    expect(result.current.speedChallenge.results).toBeNull();
    expect(result.current.speedChallenge.isActive).toBe(false);
  });

  it('allows mutating timeLeft / isActive directly (no internal guardrails)', () => {
    const { result } = mountHook();
    act(() => {
      result.current.setSpeedChallenge(prev => ({
        ...prev,
        isActive: true,
        timeLeft: 42,
      }));
    });
    expect(result.current.speedChallenge.isActive).toBe(true);
    expect(result.current.speedChallenge.timeLeft).toBe(42);
  });

  it('externally-driven isActive=true with timeLeft>0 starts the ticking interval', () => {
    // This characterizes that the effect — not handleStartSpeedChallenge — is what
    // actually arms the timer. Setting state via the raw setter is sufficient.
    const { result } = mountHook();
    act(() => {
      result.current.setSpeedChallenge(prev => ({
        ...prev,
        isActive: true,
        timeLeft: 10,
      }));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.speedChallenge.timeLeft).toBe(9);
  });
});
