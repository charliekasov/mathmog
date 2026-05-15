"use client";

import { Timer, Zap } from 'lucide-react';
import { cn } from '../../core/cn';
import type { Difficulty } from '../../core/types';
import { useProblem } from '../contexts/problem';
import { useSpeedChallenge } from '../contexts/speed-challenge';
import { useMathmogUI } from '../ui/provider';
import { DifficultySelector } from './difficulty-selector';

const LEVEL_NAMES: Record<number, string> = {
  1: 'Memorize',
  2: 'Estimate',
  3: 'Get Crafty',
};

interface Props {
  isHomeworkMode?: boolean;
  /** Optional override for the locked level label badge. Falls back to `currentLevel`. */
  homeworkLevelLabel?: string;
  /** Optional override for the locked difficulty badge. Falls back to `currentDifficulty`. */
  homeworkDifficulty?: Difficulty;
  /** Locked duration in minutes. Falls back to `speedChallenge.duration`. */
  lockedDuration?: number;
}

export function SpeedChallengeReadyScreen({
  isHomeworkMode = false,
  homeworkLevelLabel,
  homeworkDifficulty,
  lockedDuration,
}: Props) {
  const ui = useMathmogUI();
  const { speedChallenge, setSpeedChallenge, handleStartSpeedChallenge } = useSpeedChallenge();
  const { currentLevel, currentDifficulty, handleNewProblem } = useProblem();

  // Start challenge and generate first problem
  const onStartChallenge = () => {
    handleStartSpeedChallenge();
    handleNewProblem();
  };

  const durationOptions = [
    { duration: 1, bolts: 1, label: '1 min' },
    { duration: 2, bolts: 2, label: '2 min' },
    { duration: 3, bolts: 3, label: '3 min' },
  ];

  const lockedLevelLabel =
    homeworkLevelLabel ?? LEVEL_NAMES[currentLevel] ?? `Level ${currentLevel}`;
  const lockedDifficultyLabel = homeworkDifficulty ?? currentDifficulty;
  const displayedDuration = lockedDuration ?? speedChallenge.duration;

  return (
    <ui.Card className="border-primary/20 bg-secondary/50">
      <ui.CardHeader className="text-center">
        <ui.CardTitle className="text-2xl font-bold">
          {isHomeworkMode ? 'Homework: Speed Challenge!' : 'Speed Challenge!'}
        </ui.CardTitle>
        <ui.CardDescription>
          {isHomeworkMode
            ? 'Complete this assigned speed challenge.'
            : 'Test your speed and accuracy against the clock.'}
        </ui.CardDescription>
      </ui.CardHeader>
      <ui.CardContent>
        <div className="max-w-md mx-auto space-y-6">
          {/* In homework mode, show locked config instead of selectors */}
          {isHomeworkMode ? (
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-2">
                <ui.Badge variant="secondary" className="text-sm">
                  {lockedLevelLabel}
                </ui.Badge>
                <ui.Badge variant="secondary" className="text-sm">
                  {lockedDifficultyLabel}
                </ui.Badge>
              </div>
              <div className="text-lg font-semibold text-primary">
                {displayedDuration} minute{displayedDuration !== 1 ? 's' : ''}
              </div>
            </div>
          ) : (
            <>
              <DifficultySelector />

              <div>
                <ui.Label className="mb-3 block text-center font-medium">Select Duration</ui.Label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                  {durationOptions.map(({ duration, bolts, label }) => (
                    <ui.Button
                      key={duration}
                      onClick={() => setSpeedChallenge((prev) => ({ ...prev, duration }))}
                      variant={speedChallenge.duration === duration ? 'default' : 'outline'}
                      size="lg"
                      data-tour={`mathmog-speed-duration-${duration}`}
                      className={cn(
                        'font-bold shadow-sm transition-all text-base',
                        'hover:shadow-md',
                        speedChallenge.duration === duration
                          ? 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-inner'
                          : 'bg-background'
                      )}
                    >
                      <span className="flex items-center gap-0.5 mr-1.5">
                        {Array.from({ length: bolts }).map((_, i) => (
                          <Zap key={i} className="w-4 h-4 text-amber-500" />
                        ))}
                      </span>
                      {label}
                    </ui.Button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <ui.Button
              onClick={onStartChallenge}
              size="lg"
              data-tour="mathmog-speed-start"
              className="h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Timer className="mr-2 h-5 w-5" /> Start Challenge
            </ui.Button>
            {/* Hide "Back to Practice" in homework mode */}
            {!isHomeworkMode && (
              <ui.Button
                onClick={() => setSpeedChallenge((prev) => ({ ...prev, enabled: false }))}
                variant="ghost"
              >
                Back to Practice
              </ui.Button>
            )}
          </div>
        </div>
      </ui.CardContent>
    </ui.Card>
  );
}
