"use client";

import { Target } from 'lucide-react';
import { useProblem } from '../contexts/problem';
import { useMathmogUI } from '../ui/provider';

export function ScoreDisplay() {
  const ui = useMathmogUI();
  const { score } = useProblem();

  return (
    <div className="mt-6 flex justify-center items-center">
      <ui.Badge
        variant="outline"
        className="px-4 py-2 text-base border-amber-200 bg-amber-50/50"
        data-tour="mathmog-score"
      >
        <Target className="w-5 h-5 mr-2 text-amber-600" />
        Score: {score.correct}/{score.total}
      </ui.Badge>
    </div>
  );
}
