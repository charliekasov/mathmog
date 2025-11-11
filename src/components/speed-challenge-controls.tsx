"use client";

import { useSpeedChallenge } from '@/context/speed-challenge-context';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Timer, Zap } from 'lucide-react';

export default function SpeedChallengeControls() {
  const { speedChallenge, setSpeedChallenge } = useSpeedChallenge();

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  if (speedChallenge.isActive) {
    return (
      <div className="mb-6 flex items-center justify-center gap-3 px-4 py-2 rounded-lg bg-secondary w-full sm:w-auto">
        <Timer className="w-5 h-5 text-primary" />
        <span className="font-mono font-semibold text-lg">{formatTime(speedChallenge.timeLeft)}</span>
        <Progress value={(speedChallenge.timeLeft / (speedChallenge.duration * 60)) * 100} className="w-24 h-2" />
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-center space-x-3">
      <Switch
        id="speedChallenge-toggle"
        checked={speedChallenge.enabled}
        onCheckedChange={(checked) => setSpeedChallenge(prev => ({ ...prev, enabled: !!checked, results: null }))}
        disabled={speedChallenge.isActive}
      />
      <Label htmlFor="speedChallenge-toggle" className="text-lg font-medium flex items-center gap-2 cursor-pointer">
        <Zap className="w-5 h-5 text-yellow-500" /> Speed Challenge
      </Label>
    </div>
  );
}