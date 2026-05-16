// Phase-4 scaffolding smoke. Confirms each lifted component mounts inside
// the full provider stack with a stub primitive bag. Phase-5 will replace
// these with characterization tests.
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import {
  MathmogUIProvider,
  MathmogTrainerProviders,
  ScoreDisplay,
  ElapsedTimer,
  SpeedChallengeControls,
  DifficultySelector,
  SpeedChallengeReadyScreen,
  MissesReviewScreen,
  LevelUpDialog,
  ProblemDisplay,
  StudyGuide,
  MemorizeContent,
  EstimateContent,
  CraftyContent,
  DifficultyScalingContent,
  PrintableStudyGuideProvider,
  type UIPrimitiveBag,
} from '../src/react/index';

const StubInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />
);
StubInput.displayName = 'StubInput';

// Permissive stub bag: every primitive renders a <div> (or appropriate native)
// that passes children + className + data-* through. Good enough for "mounts
// without throwing" — not a behavioral test.
const stubBag: UIPrimitiveBag = new Proxy({} as UIPrimitiveBag, {
  get(_t, prop) {
    if (prop === 'Input') return StubInput;
    if (prop === 'Switch') {
      return ({ checked, onCheckedChange, ...rest }: any) => (
        <button role="switch" aria-checked={checked} onClick={() => onCheckedChange?.(!checked)} {...rest} />
      );
    }
    if (prop === 'Progress') {
      return ({ value, className }: any) => (
        <div role="progressbar" aria-valuenow={value} className={className} />
      );
    }
    // All others: passthrough children
    return ({ children, ...rest }: any) => <div {...rest}>{children}</div>;
  },
}) as UIPrimitiveBag;

function withProviders(children: React.ReactNode) {
  return (
    <MathmogUIProvider ui={stubBag}>
      <MathmogTrainerProviders>{children}</MathmogTrainerProviders>
    </MathmogUIProvider>
  );
}

describe('Phase 4 component smoke', () => {
  it('ScoreDisplay mounts', () => {
    const { container } = render(withProviders(<ScoreDisplay />));
    expect(container.querySelector('[data-tour="mathmog-score"]')).not.toBeNull();
  });

  it('ElapsedTimer renders null when showTimer=false', () => {
    const { container } = render(withProviders(<ElapsedTimer showTimer={false} />));
    expect(container.querySelector('[data-tour="mathmog-elapsed"]')).toBeNull();
  });

  it('ElapsedTimer renders when showTimer=true', () => {
    const { container } = render(withProviders(<ElapsedTimer showTimer={true} />));
    expect(container.querySelector('[data-tour="mathmog-elapsed"]')).not.toBeNull();
  });

  it('SpeedChallengeControls renders the toggle when not in homework mode', () => {
    const { container } = render(withProviders(<SpeedChallengeControls />));
    expect(container.querySelector('[data-tour="mathmog-speed-toggle"]')).not.toBeNull();
  });

  it('SpeedChallengeControls renders null in homework mode (when challenge not active)', () => {
    const { container } = render(withProviders(<SpeedChallengeControls isHomeworkMode />));
    expect(container.querySelector('[data-tour="mathmog-speed-toggle"]')).toBeNull();
  });

  it('DifficultySelector mounts with three tour anchors', () => {
    const { container } = render(withProviders(<DifficultySelector />));
    expect(container.querySelector('[data-tour="mathmog-mode-select"]')).not.toBeNull();
    expect(container.querySelector('[data-tour="mathmog-topic-select"]')).not.toBeNull();
    expect(container.querySelector('[data-tour="mathmog-difficulty-select"]')).not.toBeNull();
  });

  it('SpeedChallengeReadyScreen mounts (homework=false)', () => {
    const { container } = render(withProviders(<SpeedChallengeReadyScreen />));
    expect(container.querySelector('[data-tour="mathmog-speed-start"]')).not.toBeNull();
    expect(container.querySelector('[data-tour="mathmog-speed-duration-1"]')).not.toBeNull();
    expect(container.querySelector('[data-tour="mathmog-speed-duration-2"]')).not.toBeNull();
    expect(container.querySelector('[data-tour="mathmog-speed-duration-3"]')).not.toBeNull();
  });

  it('SpeedChallengeReadyScreen in homework mode hides duration buttons but keeps Start', () => {
    const { container } = render(
      withProviders(
        <SpeedChallengeReadyScreen
          isHomeworkMode
          homeworkLevelLabel="Memorize"
          homeworkDifficulty="Easy"
          lockedDuration={2}
        />
      )
    );
    expect(container.querySelector('[data-tour="mathmog-speed-start"]')).not.toBeNull();
    expect(container.querySelector('[data-tour="mathmog-speed-duration-1"]')).toBeNull();
  });

  it('MissesReviewScreen shows the "nothing to review" empty path on empty input', () => {
    const onDone = () => {};
    const { container } = render(
      withProviders(<MissesReviewScreen misses={[]} onDone={onDone} />)
    );
    expect(container.textContent).toMatch(/Nothing to review/);
  });

  it('LevelUpDialog mounts (renders null since no pendingLevelUp yet)', () => {
    const { container } = render(withProviders(<LevelUpDialog />));
    // No pendingLevelUp queued — dialog is suppressed.
    expect(container.querySelector('[data-tour="mathmog-levelup"]')).toBeNull();
  });

  it('ProblemDisplay mounts (with no problem yet, renders only the embedded LevelUpDialog)', () => {
    const { container } = render(withProviders(<ProblemDisplay />));
    // No currentProblem — no question element rendered.
    expect(container.querySelector('[data-tour="mathmog-question"]')).toBeNull();
  });

  it('ProblemDisplay with hideLevelUpDialog=true renders null when there is no problem', () => {
    const { container } = render(withProviders(<ProblemDisplay hideLevelUpDialog />));
    expect(container.querySelector('[data-tour="mathmog-question"]')).toBeNull();
  });

  it('StudyGuide mounts with the four tab triggers', () => {
    const { container } = render(withProviders(<StudyGuide />));
    expect(container.querySelector('[data-tour="mathmog-reference"]')).not.toBeNull();
    for (const tab of ['memorize', 'estimate', 'crafty', 'scaling']) {
      expect(container.querySelector(`[data-tour="mathmog-reference-tab-${tab}"]`)).not.toBeNull();
    }
  });

  it('StudyGuide onOpen fires once on mount', () => {
    let count = 0;
    render(
      withProviders(
        <StudyGuide onOpen={() => { count++; }} />
      )
    );
    expect(count).toBe(1);
  });

  it('Each content sub-component mounts standalone (used by the print page)', () => {
    expect(() => render(withProviders(<MemorizeContent />))).not.toThrow();
    expect(() => render(withProviders(<EstimateContent />))).not.toThrow();
    expect(() => render(withProviders(<CraftyContent />))).not.toThrow();
    expect(() => render(withProviders(<DifficultyScalingContent />))).not.toThrow();
  });

  it('PrintableStudyGuideProvider wraps MemorizeContent without throwing', () => {
    expect(() =>
      render(
        withProviders(
          <PrintableStudyGuideProvider>
            <MemorizeContent />
          </PrintableStudyGuideProvider>
        )
      )
    ).not.toThrow();
  });
});
