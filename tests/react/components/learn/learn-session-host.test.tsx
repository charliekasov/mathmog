// @vitest-environment jsdom
//
// Phase 2A.4 — the Learn session host + tier components, driven through the
// real 2A.3 machine (consume-the-machine contract: these tests interact
// with the rendered surfaces and assert what the student sees; the machine
// is never mocked).
//
// Determinism: rng is pinned to () => 0, which makes `assembleRecognizeOptions`
// place the CORRECT answer at option 1 in every draw (Fisher–Yates with
// j = 0 rotates the pool; correctIndex = floor(0 × 4) = 0), and makes
// review-round shuffles deterministic.

import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';
import { MathmogUIProvider } from '../../../../src/react/ui/provider';
import type { UIPrimitiveBag } from '../../../../src/react/ui/primitive-bag';
import {
  LearnSessionHost,
  type LearnSessionHostProps,
} from '../../../../src/react/components/learn/learn-session-host';
import { FRACTION_CONVERSIONS_LEARN_MODULES } from '../../../../src/core/learn/modules';
import type {
  LearnSessionEvent,
  LearnSessionState,
} from '../../../../src/core/learn/machine';
import type { LearnModuleDef } from '../../../../src/core/learn/types';

// ---------------------------------------------------------------------------
// Mock bag — plain HTML pass-throughs with stable component identity.
// ---------------------------------------------------------------------------

const StubInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} {...props} />);
StubInput.displayName = 'StubInput';

const StubButton = ({ children, onClick, disabled, type, variant, size, ...rest }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type={type ?? 'button'}
    data-variant={variant}
    {...rest}
  >
    {children}
  </button>
);

const StubBlock = ({ children, className, ...rest }: any) => (
  <div className={className} {...rest}>
    {children}
  </div>
);

const mockBag = {
  Card: StubBlock,
  CardContent: StubBlock,
  CardHeader: StubBlock,
  CardTitle: StubBlock,
  Button: StubButton,
  Input: StubInput,
  Alert: StubBlock,
  AlertTitle: StubBlock,
  AlertDescription: StubBlock,
} as unknown as UIPrimitiveBag;

const rngZero = () => 0;

function renderHost(
  props: Partial<LearnSessionHostProps> & { module: LearnModuleDef<string, number> }
) {
  return rtlRender(
    <MathmogUIProvider ui={mockBag}>
      <LearnSessionHost rng={rngZero} {...props} />
    </MathmogUIProvider>
  );
}

// ---------------------------------------------------------------------------
// Fixtures. Module ids parse to times_tables so diagnoseMiss is live.
// With rng = () => 0 and these 3-distractor pools, the rendered options for
// 7x2 are [14, 16, 15, 12]: option 1 correct, option 2 = 16 (diagnosable as
// an adjacent product: 8 × 2), option 3 = 15 (diagnoses to null).
// ---------------------------------------------------------------------------

const tinyModule: LearnModuleDef<string, number> = {
  id: 'times_tables/tt_test',
  label: 'Test facts',
  items: [
    { id: '7x2', prompt: '7 × 2', answer: 14 },
    { id: '7x3', prompt: '7 × 3', answer: 21 },
    { id: '7x4', prompt: '7 × 4', answer: 28 },
  ],
  distractorSets: [
    { itemId: '7x2', distractors: [12, 16, 15] },
    { itemId: '7x3', distractors: [18, 24, 14] },
    { itemId: '7x4', distractors: [24, 32, 21] },
  ],
};

const oneFactModule: LearnModuleDef<string, number> = {
  id: 'times_tables/tt_one',
  label: 'One fact',
  items: [{ id: '7x2', prompt: '7 × 2', answer: 14 }],
  distractorSets: [{ itemId: '7x2', distractors: [12, 16, 15] }],
};

const option = (n: number): HTMLElement => {
  const el = document.querySelector(`[data-learn-option="${n}"]`);
  if (!el) throw new Error(`option ${n} not rendered`);
  return el as HTMLElement;
};

const continueButton = () => screen.getByRole('button', { name: /continue/i });

const answerCorrectRecognize = () => {
  fireEvent.click(option(1));
  fireEvent.click(continueButton());
};

const answerCorrectRecall = (answer: number) => {
  fireEvent.change(screen.getByPlaceholderText('Your answer...'), {
    target: { value: String(answer) },
  });
  fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
  fireEvent.click(continueButton());
};

/** Answers the currently-presented item correctly, whatever tier it's at. */
const answerCurrentCorrect = (module: LearnModuleDef<string, number>) => {
  const recallInput = screen.queryByPlaceholderText('Your answer...');
  if (recallInput) {
    const current = module.items.find(i => screen.queryByText(`${i.prompt} = ?`));
    if (!current) throw new Error('no known prompt on screen');
    answerCorrectRecall(current.answer);
    return;
  }
  answerCorrectRecognize();
};

// ---------------------------------------------------------------------------

describe('LearnSessionHost — routing and progress', () => {
  it('starts every item at Recognize with 4 options including the answer', () => {
    renderHost({ module: tinyModule });
    expect(screen.getByText('7 × 2 = ?')).toBeTruthy();
    const values = [1, 2, 3, 4].map(n => option(n).textContent);
    expect(values).toEqual(['114', '216', '315', '412']); // index badge + value
    expect(screen.getByText('Test facts')).toBeTruthy();
    expect(screen.getByText('Facts solid: 0 of 3')).toBeTruthy();
  });

  it('a correct pick acknowledges, then continues to the next item', () => {
    renderHost({ module: tinyModule });
    fireEvent.click(option(1));
    expect(screen.getByText('Correct!')).toBeTruthy();
    fireEvent.click(continueButton());
    expect(screen.getByText('7 × 3 = ?')).toBeTruthy();
  });

  it('routes recognize → miss → see → recognize re-climb, then summarizes the round', () => {
    renderHost({ module: tinyModule });

    // Miss 7 × 2 by picking 16 (option 2).
    fireEvent.click(option(2));
    expect(screen.getByText('Not quite.')).toBeTruthy();
    // Identity line: verbatim diagnoseMiss message for 16 = 8 × 2.
    const diagnosis = document.querySelector('[data-learn-diagnosis]');
    expect(diagnosis?.textContent).toBe('16 is 8 × 2. 7 × 2 is one 2 less: 14.');
    // Answer reveal on the miss.
    expect(screen.getByText('7 × 2 = 14')).toBeTruthy();
    fireEvent.click(continueButton());

    // The other two items, correct.
    expect(screen.getByText('7 × 3 = ?')).toBeTruthy();
    answerCorrectRecognize();
    expect(screen.getByText('7 × 4 = ?')).toBeTruthy();
    answerCorrectRecognize();

    // The missed item resurfaces at its See card (the re-teach beat).
    expect(screen.getByText('Take another look')).toBeTruthy();
    expect(screen.getByText('7 × 2 = 14')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /got it/i }));

    // Re-climb: the item is back at Recognize.
    expect(screen.getByText('7 × 2 = ?')).toBeTruthy();
    answerCorrectRecognize();

    // Round 1 summary, with the missed item listed (student-facing by design).
    expect(screen.getByText('Round 1 complete')).toBeTruthy();
    expect(screen.getByText('You worked through 3 facts this round.')).toBeTruthy();
    const missed = document.querySelector('[data-learn-summary-missed]');
    expect(missed?.textContent).toContain('Worth another look');
    expect(missed?.textContent).toContain('7 × 2 = 14');
  });

  it('renders no identity line when diagnoseMiss returns null', () => {
    renderHost({ module: tinyModule });
    fireEvent.click(option(3)); // 15 — not mechanically derivable
    expect(screen.getByText('Not quite.')).toBeTruthy();
    expect(document.querySelector('[data-learn-diagnosis]')).toBeNull();
    // The reveal still shows; the See re-teach is the designed fallback.
    expect(screen.getByText('7 × 2 = 14')).toBeTruthy();
  });
});

describe('LearnSessionHost — keyboard', () => {
  it('digit keys pick options; any key dismisses the feedback beat after the arming delay', () => {
    vi.useFakeTimers();
    try {
      renderHost({ module: tinyModule });
      fireEvent.keyDown(window, { key: '1' });
      expect(screen.getByText('Correct!')).toBeTruthy();
      // Inside the arming deadzone a key is ignored, so a reflexive second
      // press can't blow through the beat unread.
      fireEvent.keyDown(window, { key: 'x' });
      expect(screen.getByText('Correct!')).toBeTruthy();
      act(() => {
        vi.advanceTimersByTime(350);
      });
      fireEvent.keyDown(window, { key: 'x' });
      expect(screen.getByText('7 × 3 = ?')).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('arrow keys move the highlight and Enter picks it', () => {
    renderHost({ module: tinyModule });
    fireEvent.keyDown(window, { key: 'ArrowDown' }); // highlight option 1
    fireEvent.keyDown(window, { key: 'ArrowDown' }); // highlight option 2
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByText('Not quite.')).toBeTruthy();
  });

  it('Enter without a highlight does nothing', () => {
    renderHost({ module: tinyModule });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.queryByText('Correct!')).toBeNull();
    expect(screen.queryByText('Not quite.')).toBeNull();
  });
});

describe("LearnSessionHost — \"Don't know?\"", () => {
  it('counts as a miss, reveals softly, and drops the item to its See card', () => {
    const spy = vi.fn();
    renderHost({ module: oneFactModule, onSessionChange: spy });
    fireEvent.click(screen.getByRole('button', { name: /don't know\?/i }));
    expect(screen.getByText('No problem. Here it is:')).toBeTruthy();
    expect(screen.getByText('7 × 2 = 14')).toBeTruthy();
    expect(
      screen.getByText("You'll get another shot at it in a moment.")
    ).toBeTruthy();
    // No scold, no diagnosis (there is no wrong answer to diagnose).
    expect(screen.queryByText('Not quite.')).toBeNull();
    expect(document.querySelector('[data-learn-diagnosis]')).toBeNull();
    fireEvent.click(continueButton());

    const [session] = spy.mock.calls[spy.mock.calls.length - 1] as [LearnSessionState, LearnSessionEvent[]];
    expect(session.roundTrace.missedItemIds).toEqual(['7x2']);
    expect(session.itemStates[0].tier).toBe('see');
    // The student lands on the See card next.
    expect(screen.getByText('Take another look')).toBeTruthy();
  });
});

describe('LearnSessionHost — recall tier', () => {
  // Drives oneFactModule to its recall tier: recognize correct → summary →
  // round 2 at recall.
  const driveToRecall = () => {
    answerCorrectRecognize();
    fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
    expect(screen.getByPlaceholderText('Your answer...')).toBeTruthy();
  };

  it('grades typed answers and shows the identity line + reveal on a miss', () => {
    renderHost({ module: oneFactModule });
    driveToRecall();
    fireEvent.change(screen.getByPlaceholderText('Your answer...'), {
      target: { value: '16' },
    });
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(screen.getByText('Not quite.')).toBeTruthy();
    expect(document.querySelector('[data-learn-diagnosis]')?.textContent).toBe(
      '16 is 8 × 2. 7 × 2 is one 2 less: 14.'
    );
    expect(screen.getByText('7 × 2 = 14')).toBeTruthy();
    fireEvent.click(continueButton());
    // Recall miss drops one tier: the item re-presents at Recognize.
    expect(screen.getByText('7 × 2 = ?')).toBeTruthy();
    expect(option(1)).toBeTruthy();
  });

  it("offers \"Don't know?\" at recall too", () => {
    renderHost({ module: oneFactModule });
    driveToRecall();
    fireEvent.click(screen.getByRole('button', { name: /don't know\?/i }));
    expect(screen.getByText('No problem. Here it is:')).toBeTruthy();
  });
});

describe('LearnSessionHost — rounds, summary, completion', () => {
  it('never auto-skips a tiny-round summary', () => {
    renderHost({ module: oneFactModule });
    answerCorrectRecognize();
    // 1-item round: the boundary is the only spacing before the
    // completion-gating recall. It must render and wait.
    expect(screen.getByText('Round 1 complete')).toBeTruthy();
    expect(screen.getByText('You worked through 1 fact this round.')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Your answer...')).toBeNull();
  });

  it('merges the final round summary into the completion screen', () => {
    renderHost({
      module: oneFactModule,
      completionSlot: <div data-testid="slot-content">portal exit</div>,
    });
    // R1 recognize → R2 recall (1st) → R3 recall (2nd, crosses solid).
    answerCorrectRecognize();
    fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
    answerCorrectRecall(14);
    fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
    answerCorrectRecall(14);

    // Completion appears DIRECTLY — no separate "Round 3 complete" screen.
    expect(screen.queryByText('Round 3 complete')).toBeNull();
    expect(screen.getByText('You recalled this fact from memory.')).toBeTruthy();
    expect(screen.getByText('One fact')).toBeTruthy();
    expect(screen.getByText('Facts solid: 1 of 1')).toBeTruthy();
    // The merged final-round content: the fact crossed solid this round.
    const solid = document.querySelector('[data-learn-summary-solid]');
    expect(solid?.textContent).toContain('Now solid from memory');
    expect(solid?.textContent).toContain('7 × 2 = 14');
    // The 2A.5 composition point renders its slot — and nothing else offers.
    expect(screen.getByTestId('slot-content')).toBeTruthy();
    expect(document.querySelector('[data-learn-completion-slot]')).toBeTruthy();
  });

  it('completes a full 3-item module and reports machine events through onSessionChange', () => {
    const spy = vi.fn();
    renderHost({ module: tinyModule, onSessionChange: spy });
    // R1: all recognize. R2 + R3: all recall (rng-shuffled order — answer
    // whatever prompt is shown).
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < tinyModule.items.length; i++) {
        answerCurrentCorrect(tinyModule);
      }
      if (round < 2) {
        fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
      }
    }
    expect(screen.getByText('You recalled all 3 facts from memory.')).toBeTruthy();
    const [, events] = spy.mock.calls[spy.mock.calls.length - 1] as [LearnSessionState, LearnSessionEvent[]];
    expect(events.map(e => e.type)).toContain('round-complete');
    expect(events.map(e => e.type)).toContain('module-complete');
  });
});

describe('LearnSessionHost — gamification line', () => {
  it('renders no percentage and no attempt/miss counters at any surface', () => {
    const { container } = renderHost({ module: oneFactModule });
    const assertClean = () => {
      expect(container.textContent).not.toMatch(/%/);
      expect(container.textContent).not.toMatch(/attempt/i);
      expect(container.textContent).not.toMatch(/\bmiss/i);
      expect(container.textContent).not.toMatch(/streak/i);
    };
    assertClean(); // recognize
    fireEvent.click(option(2)); // miss feedback
    assertClean();
    fireEvent.click(continueButton()); // see card
    assertClean();
    fireEvent.click(screen.getByRole('button', { name: /got it/i }));
    answerCorrectRecognize(); // → summary
    expect(screen.getByText('Round 1 complete')).toBeTruthy();
    assertClean();
    fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
    answerCorrectRecall(14);
    fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
    answerCorrectRecall(14); // → completion
    expect(screen.getByText('You recalled this fact from memory.')).toBeTruthy();
    assertClean();
  });
});

describe('LearnSessionHost — session prop round-trip (the 2B.1 seam)', () => {
  it('resumes from a JSON-round-tripped emitted session', () => {
    const spy = vi.fn();
    const first = renderHost({ module: tinyModule, onSessionChange: spy });
    answerCorrectRecognize(); // 7 × 2 correct → queue head is 7 × 3
    const [captured] = spy.mock.calls[spy.mock.calls.length - 1] as [LearnSessionState, LearnSessionEvent[]];
    first.unmount();

    const restored = JSON.parse(JSON.stringify(captured)) as LearnSessionState;
    expect(restored).toEqual(captured);

    renderHost({ module: tinyModule, initialSession: restored });
    expect(screen.getByText('7 × 3 = ?')).toBeTruthy();
    expect(screen.getByText('Facts solid: 0 of 3')).toBeTruthy();
    // And the resumed session keeps working.
    answerCorrectRecognize();
    expect(screen.getByText('7 × 4 = ?')).toBeTruthy();
  });

  it('throws loudly on a session/module mismatch', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mismatched: LearnSessionState = {
      moduleId: 'times_tables/tt_other',
      itemStates: [],
      round: { roundNumber: 1, queue: [] },
      roundTrace: { presentedItemIds: [], missedItemIds: [], newlySolidItemIds: [] },
      roundSummaries: [],
    };
    expect(() =>
      renderHost({ module: tinyModule, initialSession: mismatched })
    ).toThrow(/tt_other/);
    consoleError.mockRestore();
  });
});

describe('LearnSessionHost — fractions (See-card ellipsis)', () => {
  const sixths = FRACTION_CONVERSIONS_LEARN_MODULES.find(
    m => m.id === 'fraction_conversions/fractions_sixths'
  )!;

  it('shows the full repeating form on the See card for repeating decimals', () => {
    renderHost({ module: sixths });
    // 1/6 first (canonical order), correct.
    expect(screen.getByText('1/6 as a decimal = ?')).toBeTruthy();
    answerCorrectRecognize();
    // 5/6: decline → miss → See card with the repeating display.
    expect(screen.getByText('5/6 as a decimal = ?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /don't know\?/i }));
    // The reveal carries the canonical anchor alongside the repeating form.
    expect(
      screen.getByText('5/6 as a decimal = 0.8333… (0.833 at 3 decimal places)')
    ).toBeTruthy();
    fireEvent.click(continueButton());
    // The See card teaches the plain repeating form.
    expect(screen.getByText('Take another look')).toBeTruthy();
    expect(screen.getByText('5/6 as a decimal = 0.8333…')).toBeTruthy();
  });

  it('accepts any accepted-family member at the recall tier (host-level)', () => {
    renderHost({ module: sixths });
    // R1: both recognize-correct.
    answerCorrectRecognize();
    answerCorrectRecognize();
    fireEvent.click(screen.getByRole('button', { name: /keep going/i }));
    // R2 order with rng 0: [5/6, 1/6]. Type a NON-canonical family member.
    expect(screen.getByText('5/6 as a decimal = ?')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText('Your answer...'), {
      target: { value: '0.8333' },
    });
    fireEvent.click(screen.getByRole('button', { name: /check answer/i }));
    expect(screen.getByText('Correct!')).toBeTruthy();
  });
});
