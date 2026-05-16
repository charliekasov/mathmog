// Phase-3 scaffolding smoke. Confirms the React surface mounts and
// useMathmogUI throws outside a provider. This test is staged here only
// so we can verify the lift; it will be superseded by Phase-5 characterization
// tests.
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import {
  MathmogUIProvider,
  MathmogTrainerProviders,
  useMathmogUI,
  useTrainerState,
  useProblem,
  useSpeedChallenge,
  useTrainerMode,
  useTrainerModeOptional,
  type UIPrimitiveBag,
} from '../src/react/index';

// Minimal primitive bag — every consumer needs a more realistic one, but
// for "the tree renders without throwing" we just need ComponentType shape.
const StubInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => <input ref={ref} {...props} />
);
StubInput.displayName = 'StubInput';

const stubBag = new Proxy({} as UIPrimitiveBag, {
  get(_t, prop) {
    if (prop === 'Input') return StubInput;
    return ({ children }: { children?: React.ReactNode }) => <>{children}</>;
  },
}) as UIPrimitiveBag;

describe('Phase 3 React scaffolding', () => {
  it('useMathmogUI throws if no MathmogUIProvider above', () => {
    function Probe() {
      useMathmogUI();
      return null;
    }
    // Silence React's expected-error console noise
    const consoleError = console.error;
    console.error = () => {};
    try {
      expect(() => render(<Probe />)).toThrow(/MathmogUIProvider/);
    } finally {
      console.error = consoleError;
    }
  });

  it('all four trainer hooks resolve inside MathmogTrainerProviders', () => {
    const seen: Record<string, boolean> = {};
    function Probe() {
      const ui = useMathmogUI();
      const ts = useTrainerState();
      const prob = useProblem();
      const sc = useSpeedChallenge();
      const tm = useTrainerMode();
      const tmo = useTrainerModeOptional();
      seen.ui = !!ui.Card;
      seen.ts = typeof ts.setStudyTab === 'function';
      seen.prob = typeof prob.handleCheckAnswer === 'function';
      seen.sc = typeof sc.handleStartSpeedChallenge === 'function';
      seen.tm = typeof tm.startDrill === 'function';
      seen.tmo = tmo === tm;
      return null;
    }
    render(
      <MathmogUIProvider ui={stubBag}>
        <MathmogTrainerProviders>
          <Probe />
        </MathmogTrainerProviders>
      </MathmogUIProvider>
    );
    expect(seen).toEqual({ ui: true, ts: true, prob: true, sc: true, tm: true, tmo: true });
  });

  it('useTrainerModeOptional returns null outside TrainerModeProvider', () => {
    let result: unknown = 'unset';
    function Probe() {
      result = useTrainerModeOptional();
      return null;
    }
    render(<Probe />);
    expect(result).toBeNull();
  });
});
