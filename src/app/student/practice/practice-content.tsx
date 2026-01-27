"use client";

import { useEffect, useRef } from 'react';
import { useProblem } from '@/context/problem-context';
import { useSpeedChallenge } from '@/context/speed-challenge-context';
import { useUser } from '@/context/user-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ProblemDisplay from '@/components/problem-display';
import SpeedChallengeControls from '@/components/speed-challenge-controls';
import type { Difficulty } from '@/lib/types';
import { getTopicInfo } from '@/lib/drill-topics';

interface PracticeContentProps {
  level: number;
  difficulty: Difficulty;
  topic?: string;
  problemCount: number;
  isSpeedChallenge?: boolean;
  duration?: number;
}

const levelNames: Record<number, string> = {
  1: 'Memorize',
  2: 'Estimate',
  3: 'Get Crafty',
};

export function PracticeContent({
  level,
  difficulty,
  topic,
  problemCount,
  isSpeedChallenge = false,
  duration = 2,
}: PracticeContentProps) {
  const { isLoading } = useUser();
  const { score, handleLevelDifficultyChange, handleReset } = useProblem();
  const { speedChallenge, setSpeedChallenge, handleStartSpeedChallenge } = useSpeedChallenge();
  const initialized = useRef(false);
  const prevIsActive = useRef(false);
  const scoreRef = useRef(score);

  // Keep scoreRef in sync
  scoreRef.current = score;

  // Initialize level/difficulty and set up speed challenge if needed
  useEffect(() => {
    if (!isLoading && !initialized.current) {
      initialized.current = true;
      handleLevelDifficultyChange(level, difficulty, topic);
      if (isSpeedChallenge) {
        setSpeedChallenge(prev => ({
          ...prev,
          enabled: true,
          duration,
          results: null,
        }));
      }
    }
  }, [isLoading, level, difficulty, topic, handleLevelDifficultyChange, isSpeedChallenge, duration, setSpeedChallenge]);

  // Handle speed challenge state transitions (same pattern as mental-math-trainer.tsx)
  useEffect(() => {
    // When speed challenge starts, reset score
    if (speedChallenge.isActive && !prevIsActive.current) {
      handleReset();
    }
    // When speed challenge ends, capture the score into results
    if (!speedChallenge.isActive && prevIsActive.current) {
      setSpeedChallenge(prev => ({
        ...prev,
        results: {
          correct: scoreRef.current.correct,
          total: scoreRef.current.total,
        },
      }));
    }
    prevIsActive.current = speedChallenge.isActive;
  }, [speedChallenge.isActive, handleReset, setSpeedChallenge]);

  const topicInfo = topic ? getTopicInfo(topic) : undefined;

  const subtitle = topicInfo
    ? topicInfo.label
    : `${levelNames[level] || `Level ${level}`} - ${difficulty}`;

  // --- Speed Challenge Mode ---
  if (isSpeedChallenge) {
    const { results } = speedChallenge;
    const showReady = speedChallenge.enabled && !speedChallenge.isActive && !results;
    const showActive = speedChallenge.isActive;
    const showResults = !speedChallenge.isActive && results;

    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-2 tracking-tight">
                <Brain className="text-primary w-8 h-8" />
                <span className="font-headline">MathMog</span>
              </h1>
            </div>
            <p className="text-primary font-semibold">{subtitle}</p>
            {topicInfo && (
              <p className="text-sm text-muted-foreground mt-1">
                {levelNames[level] || `Level ${level}`}
                {topicInfo.hasDifficulty ? ` - ${difficulty}` : ''}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">Speed Challenge - {duration}min</p>
          </div>

          {showReady && (
            <Card className="shadow-xl border-primary/20 bg-secondary/50">
              <CardContent className="p-8 text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Speed Challenge!</h2>
                  <p className="text-muted-foreground">
                    Answer as many problems as you can in {duration} minute{duration !== 1 ? 's' : ''}.
                  </p>
                </div>
                <Button
                  onClick={handleStartSpeedChallenge}
                  size="lg"
                  className="h-12 text-lg font-bold bg-accent hover:bg-accent/90"
                >
                  <Timer className="mr-2 h-5 w-5" /> Start Challenge
                </Button>
              </CardContent>
            </Card>
          )}

          {showActive && (
            <>
              <SpeedChallengeControls />
              <Card className="shadow-xl">
                <CardContent className="p-4 sm:p-6">
                  <ProblemDisplay />
                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="px-4 py-2 text-base">
                      Score: {score.correct}/{score.total}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {showResults && (
            <Card className="shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">
                  {results.total === 0
                    ? '💪📚'
                    : results.correct === results.total
                      ? '🎉🏆🎉'
                      : results.correct >= results.total * 0.8
                        ? '👏🌟'
                        : '💪📚'}
                </div>
                <h2 className="text-2xl font-bold mb-2">Challenge Complete!</h2>
                <p className="text-lg mb-4">
                  You got <span className="font-bold text-primary">{results.correct}</span> out of{' '}
                  <span className="font-bold">{results.total}</span> correct in {duration} minute{duration !== 1 ? 's' : ''}
                </p>
                {results.total > 0 && (
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {Math.round((results.correct / results.total) * 100)}%
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    );
  }

  // --- Fixed-Count Practice Mode (unchanged) ---
  const progress = Math.min(score.total, problemCount);
  const progressPercent = (progress / problemCount) * 100;
  const isComplete = score.total >= problemCount;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-2 tracking-tight">
              <Brain className="text-primary w-8 h-8" />
              <span className="font-headline">MathMog</span>
            </h1>
          </div>
          <p className="text-primary font-semibold">{subtitle}</p>
          {topicInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              {levelNames[level] || `Level ${level}`}
              {topicInfo.hasDifficulty ? ` - ${difficulty}` : ''}
            </p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{progress} / {problemCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {isComplete ? (
          <Card className="shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">
                {score.correct === score.total ? '🎉🏆🎉' : score.correct >= score.total * 0.8 ? '👏🌟' : '💪📚'}
              </div>
              <h2 className="text-2xl font-bold mb-2">Drill Complete!</h2>
              <p className="text-lg mb-4">
                You got <span className="font-bold text-primary">{score.correct}</span> out of{' '}
                <span className="font-bold">{score.total}</span> correct
              </p>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {Math.round((score.correct / score.total) * 100)}%
              </Badge>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <ProblemDisplay />
              <div className="mt-4 text-center">
                <Badge variant="outline" className="px-4 py-2 text-base">
                  Score: {score.correct}/{score.total}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
