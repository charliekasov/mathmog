"use client";

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import type { LearnItem } from '../../../core/learn/types';
import { useMathmogUI } from '../../ui/provider';
import { learnAnswerDisplay } from './grading';
import { useAnyKeyContinue } from './use-any-key-continue';

interface LearnSeeCardProps {
  item: LearnItem<string, number>;
  onContinue: () => void;
}

/**
 * The See tier: the teach beat. For Math Mog the teach card IS the fact
 * (design doc §6.2) — prompt and answer together, tap or any key to
 * continue. In v1 this card is reached only by dropping from Recognize on a
 * miss, so its register is re-teach, not first contact (types.ts
 * `INITIAL_LEARN_TIER` note). Repeating decimals show the full repeating
 * form ("0.8333…") so the card never implies the digits stop.
 */
export function LearnSeeCard({ item, onContinue }: LearnSeeCardProps) {
  const ui = useMathmogUI();
  useAnyKeyContinue(true, onContinue);

  return (
    <ui.Card
      data-tour="mathmog-learn-see"
      className="border-t-2 border-t-amber-300 shadow-md"
    >
      <ui.CardContent className="pt-6 pb-8 space-y-6 text-center">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Take another look
        </div>
        <p className="text-2xl md:text-3xl font-bold">
          {item.prompt} = {learnAnswerDisplay(item)}
        </p>
        <p className="text-sm text-muted-foreground">
          You&apos;ll get a chance at this one again in a moment.
        </p>
        <div className="flex justify-center">
          <ui.Button
            onClick={onContinue}
            className="text-lg h-14 sm:h-11 px-8"
          >
            Got it <ArrowRight className="w-4 h-4 ml-2" />
          </ui.Button>
        </div>
      </ui.CardContent>
    </ui.Card>
  );
}
