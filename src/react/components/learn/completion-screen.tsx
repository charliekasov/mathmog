"use client";

import * as React from 'react';
import type { LearnItem, LearnRoundSummary } from '../../../core/learn/types';
import { useMathmogUI } from '../../ui/provider';
import { LearnRoundSummaryBody } from './round-summary-screen';

interface LearnCompletionScreenProps {
  moduleLabel: string;
  totalFacts: number;
  /**
   * The final round's summary, MERGED into this screen (2A.3 reviewer
   * carry: completion always coincides with a round boundary, and a summary
   * screen THEN a completion screen would dilute the §6.6 moment).
   */
  finalSummary: LearnRoundSummary | null;
  items: LearnItem<string, number>[];
  /**
   * THE 2A.5 COMPOSITION POINT. The offer engine (Drill-the-set,
   * Learn-next-module, F1-aware adjacency) lands here in slice 2A.5; in
   * 2A.4 this stays empty by design — no offers, no adjacency, no buttons.
   * 2B.2 may mount portal navigation here in the interim.
   */
  completionSlot?: React.ReactNode;
}

/**
 * Module completion: a calm acknowledgment of a real accomplishment
 * (design doc §6.6 / §3.2). States the fact plainly — every item was
 * recalled from memory — with the final round's summary merged in. No
 * celebration animation, no praise copy, no score, no badge, no completion
 * history.
 */
export function LearnCompletionScreen({
  moduleLabel,
  totalFacts,
  finalSummary,
  items,
  completionSlot,
}: LearnCompletionScreenProps) {
  const ui = useMathmogUI();

  return (
    <ui.Card
      data-tour="mathmog-learn-complete"
      className="border-t-2 border-t-green-600 shadow-md"
    >
      <ui.CardContent className="pt-6 pb-8 space-y-6 text-center">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            {moduleLabel}
          </div>
          <h2 className="text-xl font-semibold">
            {totalFacts === 1
              ? 'You recalled this fact from memory.'
              : `You recalled all ${totalFacts} facts from memory.`}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Facts solid: {totalFacts} of {totalFacts}
          </p>
        </div>

        {finalSummary !== null && (
          <LearnRoundSummaryBody summary={finalSummary} items={items} />
        )}

        {completionSlot !== undefined && completionSlot !== null && (
          <div data-learn-completion-slot>{completionSlot}</div>
        )}
      </ui.CardContent>
    </ui.Card>
  );
}
