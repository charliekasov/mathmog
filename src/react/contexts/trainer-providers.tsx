"use client";

import type { ReactNode } from 'react';
import { TrainerStateProvider } from './trainer-state';
import { SpeedChallengeProvider } from './speed-challenge';
import { ProblemProvider } from './problem';
import { TrainerModeProvider, type OnSaveSession } from './trainer-mode';

/**
 * Composite provider that nests the four trainer contexts in the correct
 * order:
 *
 *   TrainerStateProvider
 *     └─ SpeedChallengeProvider
 *          └─ ProblemProvider
 *               └─ TrainerModeProvider   (reads useProblem internally)
 *
 * Consumers can still wrap with their own additional providers OUTSIDE this
 * composite (the portal nests HomeworkProvider/DrillProvider/ReferenceConsultedProvider
 * around it). If you need a different nesting order, import the individual
 * providers directly from `@peakprep/mathmog/react`.
 */
export function MathmogTrainerProviders({
  children,
  onSaveSession,
}: {
  children: ReactNode;
  onSaveSession?: OnSaveSession;
}) {
  return (
    <TrainerStateProvider>
      <SpeedChallengeProvider>
        <ProblemProvider>
          <TrainerModeProvider onSaveSession={onSaveSession}>
            {children}
          </TrainerModeProvider>
        </ProblemProvider>
      </SpeedChallengeProvider>
    </TrainerStateProvider>
  );
}
