"use client";

import { createContext, useContext, type ReactNode } from 'react';
import type { UIPrimitiveBag } from './primitive-bag';

const MathmogUIContext = createContext<UIPrimitiveBag | null>(null);

export function MathmogUIProvider({
  ui,
  children,
}: {
  ui: UIPrimitiveBag;
  children: ReactNode;
}) {
  return <MathmogUIContext.Provider value={ui}>{children}</MathmogUIContext.Provider>;
}

/**
 * Hook for package components. Throws if no `<MathmogUIProvider>` is mounted
 * above — that's a wiring bug consumers must fix at integration time, not
 * something to silently fall back from.
 */
export function useMathmogUI(): UIPrimitiveBag {
  const ui = useContext(MathmogUIContext);
  if (!ui) {
    throw new Error(
      'useMathmogUI: no <MathmogUIProvider ui={...}> found in the React tree. ' +
        'Wrap your trainer with <MathmogUIProvider ui={portalUIBag}> at module scope.'
    );
  }
  return ui;
}
