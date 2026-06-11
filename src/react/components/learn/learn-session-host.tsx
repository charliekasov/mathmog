"use client";

import * as React from 'react';
import {
  applyLearnAnswer,
  applyLearnSeen,
  createLearnSession,
  currentLearnItemId,
  getLearnItemState,
  learnSessionPhase,
  startNextLearnRound,
} from '../../../core/learn/machine';
import type {
  LearnActionResult,
  LearnSessionConfig,
  LearnSessionEvent,
  LearnSessionState,
} from '../../../core/learn/machine';
import { solidProgress } from '../../../core/learn/helpers';
import { MATHMOG_LEARN_CONFIG } from '../../../core/learn/mathmog-binding';
import type { LearnModuleDef } from '../../../core/learn/types';
import { useMathmogUI } from '../../ui/provider';
import { LearnCompletionScreen } from './completion-screen';
import { learnModuleTopic } from './grading';
import { LearnRecallCard } from './recall-card';
import { LearnRecognizeCard } from './recognize-card';
import { LearnRoundSummaryScreen } from './round-summary-screen';
import { LearnSeeCard } from './see-card';

export interface LearnSessionHostProps {
  /** The curated module to run (the caller resolves it from the registry). */
  module: LearnModuleDef<string, number>;
  /** Defaults to `MATHMOG_LEARN_CONFIG`. */
  config?: LearnSessionConfig;
  /**
   * Resume seam (2B.1): a previously-emitted `LearnSessionState`, persisted
   * verbatim and handed back verbatim (it JSON round-trips by machine
   * contract). Omit to start fresh. Must belong to `module` — a mismatched
   * id throws loudly.
   */
  initialSession?: LearnSessionState;
  /**
   * Fires after every machine action that changed the session, with the new
   * aggregate and the action's events. This is BOTH the 2B.1 persistence
   * seam (store `session` verbatim) and the 2B.6 telemetry seam (map
   * `events` to `mathmog_events` — the host itself emits nothing). Note the
   * machine's contract: a non-crossing recall correct is deliberately
   * eventless, so per-answer telemetry needs the call sites inside the tier
   * components' `onAnswer`, not these events.
   */
  onSessionChange?: (
    session: LearnSessionState,
    events: LearnSessionEvent[]
  ) => void;
  /** Rendered inside the completion screen — the 2A.5 composition point. */
  completionSlot?: React.ReactNode;
  /** Injectable for deterministic tests (option draws + review-round shuffles). */
  rng?: () => number;
}

/**
 * The Learn session driver — the component slice 2B.2 mounts in the portal
 * trainer. Consumes the 2A.3 machine without re-deriving any of it: the UI
 * routes off the returned session + `learnSessionPhase` (never off events),
 * presents `currentLearnItemId` at `getLearnItemState(...).tier`, and maps
 * each surface to its machine action:
 *
 *   see        → LearnSeeCard        → applyLearnSeen
 *   recognize  → LearnRecognizeCard  → applyLearnAnswer(verdict)
 *   recall     → LearnRecallCard     → applyLearnAnswer(verdict)
 *   round-complete → LearnRoundSummaryScreen → startNextLearnRound
 *   module-complete → LearnCompletionScreen (final summary merged)
 *
 * Grading lives in the tier components (`gradeLearnRecall` accepts any
 * accepted-family member); the machine only ever sees the verdict.
 * Tier components are keyed by a presentation counter so every presentation
 * mounts fresh (a re-queued recognize item draws a new option layout).
 *
 * Within-module progress is the "Facts solid: N of M" count text only — no
 * bar, no percentage (Learn doc Q4; gamification line).
 */
export function LearnSessionHost({
  module,
  config = MATHMOG_LEARN_CONFIG,
  initialSession,
  onSessionChange,
  completionSlot,
  rng = Math.random,
}: LearnSessionHostProps) {
  const ui = useMathmogUI();
  const [session, setSession] = React.useState<LearnSessionState>(() => {
    if (initialSession !== undefined) {
      if (initialSession.moduleId !== module.id) {
        throw new Error(
          `LearnSessionHost: initialSession is for module "${initialSession.moduleId}", not "${module.id}"`
        );
      }
      return initialSession;
    }
    return createLearnSession(module, config);
  });
  // Presentation epoch — bumps on every applied action so the next tier
  // component mounts fresh (per-presentation state reset, new option draw).
  const [step, setStep] = React.useState(0);

  const apply = (result: LearnActionResult) => {
    if (result.session === session) return;
    setSession(result.session);
    setStep(s => s + 1);
    onSessionChange?.(result.session, result.events);
  };

  const phase = learnSessionPhase(session, config);
  const progress = solidProgress(session.itemStates, config);
  const topic = learnModuleTopic(module.id);
  const lastSummary =
    session.roundSummaries.length > 0
      ? session.roundSummaries[session.roundSummaries.length - 1]
      : null;

  if (phase === 'module-complete') {
    return (
      <div data-noah="mathmog-learn-session" className="space-y-4">
        <LearnCompletionScreen
          moduleLabel={module.label}
          totalFacts={module.items.length}
          finalSummary={lastSummary}
          items={module.items}
          completionSlot={completionSlot}
        />
      </div>
    );
  }

  if (phase === 'round-complete') {
    return (
      <div data-noah="mathmog-learn-session" className="space-y-4">
        <LearnRoundSummaryScreen
          summary={lastSummary!}
          items={module.items}
          progress={progress}
          onContinue={() => apply(startNextLearnRound(session, config, rng))}
        />
      </div>
    );
  }

  const itemId = currentLearnItemId(session)!;
  const item = module.items.find(i => i.id === itemId);
  const itemState = getLearnItemState(session, itemId);
  const distractorSet = module.distractorSets.find(s => s.itemId === itemId);
  if (itemState?.tier === 'recognize' && distractorSet === undefined) {
    // A validated module always covers every item; a silent fallback here
    // would render a one-option multiple choice that answers itself. Fail
    // loudly instead (2A.4 ui review).
    throw new Error(
      `LearnSessionHost: no distractor set for item "${itemId}" in module "${module.id}"`
    );
  }
  if (item === undefined || itemState === undefined) {
    // Unreachable for a session created against this module; guards a
    // corrupted resume payload without crashing the trainer.
    return (
      <ui.Alert variant="destructive">
        <ui.AlertTitle>Something went wrong</ui.AlertTitle>
        <ui.AlertDescription>
          This Learn session doesn&apos;t match its fact set. Please start the
          module again.
        </ui.AlertDescription>
      </ui.Alert>
    );
  }

  const onAnswer = (correct: boolean) =>
    apply(applyLearnAnswer(session, config, correct));

  return (
    <div data-noah="mathmog-learn-session" className="space-y-4">
      <div className="flex items-baseline justify-between gap-4 text-sm text-muted-foreground">
        <span className="font-medium truncate" title={module.label}>
          {module.label}
        </span>
        <span className="whitespace-nowrap">
          Facts solid: {progress.solid} of {progress.total}
        </span>
      </div>

      {itemState.tier === 'see' ? (
        <LearnSeeCard
          key={step}
          item={item}
          onContinue={() => apply(applyLearnSeen(session, config))}
        />
      ) : itemState.tier === 'recognize' ? (
        <LearnRecognizeCard
          key={step}
          item={item}
          distractorSet={distractorSet!}
          topic={topic}
          rng={rng}
          onAnswer={onAnswer}
        />
      ) : (
        <LearnRecallCard key={step} item={item} topic={topic} onAnswer={onAnswer} />
      )}
    </div>
  );
}
