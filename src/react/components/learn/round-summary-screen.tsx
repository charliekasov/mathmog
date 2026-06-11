"use client";

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import type { LearnItem, LearnRoundSummary } from '../../../core/learn/types';
import { useMathmogUI } from '../../ui/provider';
import { learnAnswerDisplay } from './grading';

/**
 * The body shared by the between-rounds summary screen and the completion
 * screen (the final round's summary is MERGED into completion — 2A.3
 * reviewer carry): the missed and newly-solid lists, resolved to prompts
 * with answers (a quiet re-teach beat, not a scoreboard).
 * `LearnRoundSummary.missedItemIds` is student-facing by design; the
 * `attempts`/`misses` counters never render here or anywhere else.
 */
export function LearnRoundSummaryBody({
  summary,
  items,
}: {
  summary: LearnRoundSummary;
  items: LearnItem<string, number>[];
}) {
  const byId = new Map(items.map(item => [item.id, item]));
  const resolve = (ids: string[]): LearnItem<string, number>[] =>
    ids.flatMap(id => {
      const item = byId.get(id);
      return item === undefined ? [] : [item];
    });

  const missed = resolve(summary.missedItemIds);
  const newlySolid = resolve(summary.newlySolidItemIds);

  if (missed.length === 0 && newlySolid.length === 0) return null;

  return (
    <div className="space-y-4 text-left max-w-md mx-auto">
      {missed.length > 0 && (
        <div data-learn-summary-missed>
          <div className="text-sm font-medium text-amber-700 dark:text-amber-500 mb-1">
            Worth another look
          </div>
          <ul className="space-y-1">
            {missed.map(item => (
              <li key={item.id} className="text-base">
                {item.prompt} = {learnAnswerDisplay(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {newlySolid.length > 0 && (
        <div data-learn-summary-solid>
          <div className="text-sm font-medium text-green-700 dark:text-green-500 mb-1">
            Now solid from memory
          </div>
          <ul className="space-y-1">
            {newlySolid.map(item => (
              <li key={item.id} className="text-base text-muted-foreground">
                {item.prompt} = {learnAnswerDisplay(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface LearnRoundSummaryScreenProps {
  summary: LearnRoundSummary;
  items: LearnItem<string, number>[];
  progress: { solid: number; total: number };
  onContinue: () => void;
}

/**
 * The between-rounds summary (design doc §2: "after a round, a summary").
 * Always requires an explicit continue — never auto-skipped or
 * instant-dismissed, even for tiny rounds: at N=1 this boundary is the only
 * spacing before the completion-gating recall (2A.3 reviewer dependency).
 *
 * No percentages, no bars: progress is the "Facts solid" count text only
 * (Learn doc Q4).
 */
export function LearnRoundSummaryScreen({
  summary,
  items,
  progress,
  onContinue,
}: LearnRoundSummaryScreenProps) {
  const ui = useMathmogUI();

  return (
    <ui.Card
      data-tour="mathmog-learn-round-summary"
      className="border-t-2 border-t-amber-300 shadow-md"
    >
      <ui.CardContent className="pt-6 pb-8 space-y-6 text-center">
        <div>
          <h2 className="text-xl font-semibold">
            Round {summary.roundNumber} complete
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You worked through {summary.presentedItemIds.length}{' '}
            {summary.presentedItemIds.length === 1 ? 'fact' : 'facts'} this
            round.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Facts solid: {progress.solid} of {progress.total}
          </p>
        </div>

        <LearnRoundSummaryBody summary={summary} items={items} />

        <div className="flex justify-center">
          <ui.Button onClick={onContinue} className="text-lg h-14 sm:h-11 px-8">
            Keep going <ArrowRight className="w-4 h-4 ml-2" />
          </ui.Button>
        </div>
      </ui.CardContent>
    </ui.Card>
  );
}
