// @vitest-environment jsdom
/**
 * Characterization tests for `react/components/trainer-config-selector.tsx`
 * Scope-dropdown behavior (Phase 1.4 of the Math Mog redesign).
 *
 * Locks the OBSERVABLE behavior of the new Scope dropdown that ships in
 * v0.6.1 — the fifth selector (Skill / Topic / Scope / Difficulty + count)
 * in the trainer chrome.
 *
 * Design call lock (Phase 1.4 Call #2 revised): scope state lives in
 * ProblemContext (mirrors level/difficulty/topic). TrainerConfigSelector
 * reads `currentScope` from `useProblem()`; NO new props. Brief's
 * "new optional props" suggestion deviated in favor of the existing
 * context pattern. Rationale in HANDOFF-mathmog-redesign-phase-1-4.md.
 */

import * as React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import {
  MathmogUIProvider,
  MathmogTrainerProviders,
  TrainerConfigSelector,
  useProblem,
} from '../../../src/react/index';
import type { UIPrimitiveBag } from '../../../src/react/ui/primitive-bag';

/* ---------- Primitive bag --------------------------------------------- */

const StubLabel = ({ children, htmlFor, ...rest }: any) => (
  <label htmlFor={htmlFor} {...rest}>{children}</label>
);
StubLabel.displayName = 'StubLabel';

interface SelectCtx {
  value: string;
  onValueChange?: (v: string) => void;
}
const SelectContext = React.createContext<SelectCtx>({ value: '' });

const StubSelect = ({
  value,
  onValueChange,
  children,
  disabled: _disabled,
}: any) => (
  <SelectContext.Provider value={{ value, onValueChange }}>
    <div data-stub="select">{children}</div>
  </SelectContext.Provider>
);
StubSelect.displayName = 'StubSelect';

const StubSelectTrigger = ({ children, id, ...rest }: any) => (
  <div data-stub="select-trigger" data-trigger-id={id} {...rest}>
    {children}
  </div>
);
StubSelectTrigger.displayName = 'StubSelectTrigger';

const StubSelectValue = (_props: any) => {
  const ctx = React.useContext(SelectContext);
  return <span data-stub="select-value">{ctx.value}</span>;
};
StubSelectValue.displayName = 'StubSelectValue';

const StubSelectContent = ({ children }: any) => (
  <div data-stub="select-content">{children}</div>
);
StubSelectContent.displayName = 'StubSelectContent';

const StubSelectItem = ({ value, children, ...rest }: any) => {
  const ctx = React.useContext(SelectContext);
  return (
    <button
      type="button"
      data-stub="select-item"
      data-value={value}
      onClick={() => ctx.onValueChange?.(value)}
      {...rest}
    >
      {children}
    </button>
  );
};
StubSelectItem.displayName = 'StubSelectItem';

const stubBag: UIPrimitiveBag = {
  Label: StubLabel,
  Select: StubSelect,
  SelectTrigger: StubSelectTrigger,
  SelectValue: StubSelectValue,
  SelectContent: StubSelectContent,
  SelectItem: StubSelectItem,
} as unknown as UIPrimitiveBag;

/* ---------- Test driver ------------------------------------------------ */

function TestDriver() {
  const ctx = useProblem() as any;
  (globalThis as any).__driver = ctx;
  return null;
}

function renderSubject() {
  return render(
    <MathmogUIProvider ui={stubBag}>
      <MathmogTrainerProviders>
        <TestDriver />
        <TrainerConfigSelector />
      </MathmogTrainerProviders>
    </MathmogUIProvider>
  );
}

/* ---------- Helpers ---------------------------------------------------- */

function setLevelTopic(level: number, topic: string | undefined) {
  const driver = (globalThis as any).__driver;
  React.act(() => {
    driver.handleLevelDifficultyChange(level, 'Easy', topic);
  });
}

function scopeOptions(container: HTMLElement): string[] {
  const scopeContent = container.querySelector(
    '[data-trigger-id="scope-select"]'
  )?.parentElement?.querySelector('[data-stub="select-content"]');
  if (!scopeContent) return [];
  return Array.from(
    scopeContent.querySelectorAll('[data-stub="select-item"]')
  ).map((el) => (el as HTMLElement).dataset.value || '');
}

function scopeTriggerValue(container: HTMLElement): string | null {
  const scopeTrigger = container.querySelector(
    '[data-trigger-id="scope-select"]'
  );
  if (!scopeTrigger) return null;
  const value = scopeTrigger.querySelector('[data-stub="select-value"]');
  return value ? value.textContent : null;
}

/* ---------- Test cases ------------------------------------------------- */

beforeEach(() => {
  delete (globalThis as any).__driver;
});

describe('TrainerConfigSelector — Scope dropdown rendering', () => {
  it('does NOT render Scope dropdown when no topic is selected (all-topics)', () => {
    const { container } = renderSubject();
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).toBeNull();
    expect(
      container.querySelector('[data-trigger-id="level-select"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-trigger-id="topic-select"]')
    ).not.toBeNull();
  });

  it('does NOT render Scope dropdown when topic has no scopes (advanced_squares)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'advanced_squares');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).toBeNull();
  });

  it('does NOT render Scope dropdown for any Level-2 topic (Estimate has no scopes in v1)', () => {
    const { container } = renderSubject();
    setLevelTopic(2, 'multiplication_estimation');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).toBeNull();
  });

  it('does NOT render Scope dropdown for Level-3 topics (Get Crafty has no scopes in v1)', () => {
    const { container } = renderSubject();
    setLevelTopic(3, 'strategic_mul_div');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).toBeNull();
  });

  it('renders Scope dropdown when topic has scopes (perfect_squares)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_squares');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).not.toBeNull();
  });

  it('renders Scope dropdown when topic has scopes (times_tables)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'times_tables');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).not.toBeNull();
  });

  it('renders Scope dropdown when topic has scopes (fraction_conversions)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'fraction_conversions');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).not.toBeNull();
  });

  it('Scope label reads "Scope"', () => {
    renderSubject();
    setLevelTopic(1, 'perfect_squares');
    expect(screen.getByText(/^Scope$/i)).toBeInTheDocument();
  });
});

describe('TrainerConfigSelector — Scope dropdown options and order', () => {
  it('lists Perfect Squares scopes in registry order (6 scopes)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_squares');
    expect(scopeOptions(container)).toEqual([
      'squares_full',
      'squares_1_5',
      'squares_1_10',
      'squares_11_15',
      'squares_11_20',
      'squares_16_20',
    ]);
  });

  it('lists Perfect Cubes scopes in registry order (4 scopes)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_cubes');
    expect(scopeOptions(container)).toEqual([
      'cubes_full',
      'cubes_1_3',
      'cubes_1_5',
      'cubes_6_10',
    ]);
  });

  it('lists Times Tables scopes in registry order (9 scopes)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'times_tables');
    expect(scopeOptions(container)).toEqual([
      'tt_full',
      'tt_easy',
      'tt_2_5',
      'tt_6_9',
      'tt_10_12',
      'tt_just_6',
      'tt_just_7',
      'tt_just_8',
      'tt_just_9',
    ]);
  });

  it('lists Fractions scopes in registry order (9 scopes)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'fraction_conversions');
    expect(scopeOptions(container)).toEqual([
      'fractions_full',
      'fractions_friendly',
      'fractions_halves_fourths',
      'fractions_fifths',
      'fractions_eighths',
      'fractions_thirds',
      'fractions_sixths',
      'fractions_sevenths',
      'fractions_ninths',
    ]);
  });
});

describe('TrainerConfigSelector — Scope default and topic-change reset', () => {
  it('defaults Scope value to <prefix>_full on topic selection (squares_full)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_squares');
    expect(scopeTriggerValue(container)).toBe('squares_full');
  });

  it('defaults Scope value to <prefix>_full on topic selection (tt_full)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'times_tables');
    expect(scopeTriggerValue(container)).toBe('tt_full');
  });

  it('defaults Scope value to <prefix>_full on topic selection (cubes_full)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_cubes');
    expect(scopeTriggerValue(container)).toBe('cubes_full');
  });

  it('defaults Scope value to <prefix>_full on topic selection (fractions_full)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'fraction_conversions');
    expect(scopeTriggerValue(container)).toBe('fractions_full');
  });

  it("resets Scope to new topic's <prefix>_full when topic changes (squares → cubes)", () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_squares');
    expect(scopeTriggerValue(container)).toBe('squares_full');
    setLevelTopic(1, 'perfect_cubes');
    expect(scopeTriggerValue(container)).toBe('cubes_full');
  });

  it('clears Scope when topic changes from scoped → unscoped (cubes → advanced_squares)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_cubes');
    expect(scopeTriggerValue(container)).toBe('cubes_full');
    setLevelTopic(1, 'advanced_squares');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).toBeNull();
  });
});

describe('TrainerConfigSelector — Scope dropdown onChange wiring', () => {
  it('selecting a scope option updates the Scope trigger value', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_squares');
    expect(scopeTriggerValue(container)).toBe('squares_full');
    const scopeContent = container.querySelector(
      '[data-trigger-id="scope-select"]'
    )?.parentElement?.querySelector('[data-stub="select-content"]');
    const option = scopeContent?.querySelector(
      '[data-stub="select-item"][data-value="squares_1_5"]'
    ) as HTMLElement | null;
    expect(option).not.toBeNull();
    React.act(() => {
      fireEvent.click(option!);
    });
    expect(scopeTriggerValue(container)).toBe('squares_1_5');
  });

  it('scope change updates ProblemContext.currentScope (orchestrator + storage hooks observe it)', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'perfect_squares');
    const scopeContent = container.querySelector(
      '[data-trigger-id="scope-select"]'
    )?.parentElement?.querySelector('[data-stub="select-content"]');
    const option = scopeContent?.querySelector(
      '[data-stub="select-item"][data-value="squares_11_20"]'
    ) as HTMLElement | null;
    React.act(() => {
      fireEvent.click(option!);
    });
    const driver = (globalThis as any).__driver;
    expect(driver.currentScope).toBe('squares_11_20');
  });
});

describe('TrainerConfigSelector — backward compat with topic without scopes', () => {
  it('Higher Powers (level 1, no scopes) does NOT show Scope dropdown', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'higher_powers');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).toBeNull();
  });

  it('Common Multiples (level 1, no scopes) does NOT show Scope dropdown', () => {
    const { container } = renderSubject();
    setLevelTopic(1, 'common_multiples');
    expect(
      container.querySelector('[data-trigger-id="scope-select"]')
    ).toBeNull();
  });
});
