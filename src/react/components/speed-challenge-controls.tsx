"use client";

import { Timer, Zap } from 'lucide-react';
import { useSpeedChallenge } from '../contexts/speed-challenge';
import { useMathmogUI } from '../ui/provider';

/**
 * Renders the speed-challenge toggle, or — while a challenge is running —
 * an active-timer pill. In homework mode the toggle is hidden entirely
 * (config is locked upstream); the active-timer pill still renders if a
 * challenge is in progress.
 */
export function SpeedChallengeControls({
  isHomeworkMode = false,
}: {
  isHomeworkMode?: boolean;
}) {
  const ui = useMathmogUI();
  const { speedChallenge, setSpeedChallenge } = useSpeedChallenge();

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  // Show timer during active speed challenge
  if (speedChallenge.isActive) {
    return (
      <div
        data-tour="mathmog-speed-active"
        className="mb-6 flex items-center justify-center gap-3 px-4 py-2 rounded-lg bg-secondary w-full sm:w-auto"
      >
        <Timer className="w-5 h-5 text-primary" />
        <span className="font-mono font-semibold text-lg">
          {formatTime(speedChallenge.timeLeft)}
        </span>
        <ui.Progress
          value={(speedChallenge.timeLeft / (speedChallenge.duration * 60)) * 100}
          className="w-24 h-2"
        />
      </div>
    );
  }

  // In homework mode, don't show the toggle (config is locked)
  if (isHomeworkMode) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center space-x-3">
      <ui.Switch
        id="speedChallenge-toggle"
        checked={speedChallenge.enabled}
        onCheckedChange={(checked) =>
          setSpeedChallenge((prev) => ({ ...prev, enabled: !!checked, results: null }))
        }
        data-tour="mathmog-speed-toggle"
      />
      <ui.Label
        htmlFor="speedChallenge-toggle"
        className="text-lg font-medium flex items-center gap-2 cursor-pointer"
      >
        <Zap className="w-5 h-5 text-amber-500" /> Speed Challenge
      </ui.Label>
    </div>
  );
}
