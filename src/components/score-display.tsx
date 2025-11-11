"use client";

import { useProblem } from '@/context/problem-context';
import { useSpeedChallenge } from '@/context/speed-challenge-context';
import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { RotateCcw, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ScoreDisplay() {
  const { score, handleReset } = useProblem();
  const { speedChallenge } = useSpeedChallenge();
  const { isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
      <Badge variant="outline" className="px-4 py-2 text-base">
        <Target className="w-5 h-5 mr-2 text-green-600" />
        Score: {score.correct}/{score.total}
      </Badge>
      {!speedChallenge.isActive && (
        <Button onClick={handleReset} variant="ghost">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset
        </Button>
      )}
    </div>
  );
}