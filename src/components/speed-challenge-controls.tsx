"use client";

import { useMathTrainer } from '@/context/math-trainer-context';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Timer, Zap } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export default function SpeedChallengeControls() {
  const { speedChallenge, setSpeedChallenge, handleStartSpeedChallenge } = useMathTrainer();

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  if (!speedChallenge.enabled && !speedChallenge.isActive) {
    return (
        <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id="speedChallenge"
              checked={speedChallenge.enabled}
              onCheckedChange={(checked) => setSpeedChallenge(prev => ({ ...prev, enabled: !!checked }))}
              disabled={speedChallenge.isActive}
            />
            <Label htmlFor="speedChallenge" className="text-lg font-medium flex items-center gap-2 cursor-pointer">
              <Zap className="w-5 h-5 text-yellow-500" /> Speed Challenge
            </Label>
        </div>
    )
  }

  return (
    <Card className="mb-6 bg-secondary">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
              <Checkbox
                id="speedChallenge"
                checked={speedChallenge.enabled || speedChallenge.isActive}
                onCheckedChange={(checked) => setSpeedChallenge(prev => ({ ...prev, enabled: !!checked }))}
                disabled={speedChallenge.isActive}
              />
              <Label htmlFor="speedChallenge" className="text-lg font-medium flex items-center gap-2 cursor-pointer">
                <Zap className="w-5 h-5 text-yellow-500" /> Speed Challenge
              </Label>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
              <Select
                value={String(speedChallenge.duration)}
                onValueChange={(value) => setSpeedChallenge(prev => ({ ...prev, duration: parseInt(value) }))}
                disabled={speedChallenge.isActive}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="3">3 minutes</SelectItem>
                </SelectContent>
              </Select>
              {!speedChallenge.isActive ? (
                <Button onClick={handleStartSpeedChallenge} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
                  <Timer className="mr-2 h-4 w-4" /> Start
                </Button>
              ) : (
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-background w-full sm:w-auto justify-center">
                  <Timer className="w-5 h-5 text-primary" />
                  <span className="font-mono font-semibold text-lg">{formatTime(speedChallenge.timeLeft)}</span>
                  <Progress value={(speedChallenge.timeLeft / (speedChallenge.duration * 60)) * 100} className="w-24 h-2" />
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
