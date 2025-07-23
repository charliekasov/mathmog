"use client";

import { useMathTrainer } from '@/context/math-trainer-context';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Difficulty } from '@/lib/types';

const levels = [
  { level: 1, name: '🧠 Memorize' },
  { level: 2, name: '📊 Estimate' },
  { level: 3, name: '😈 Get Crafty' }
];

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export default function DifficultySelector() {
  const { currentLevel, currentDifficulty, speedChallenge, handleLevelDifficultyChange } = useMathTrainer();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="level-select" className="mb-2 block">Mode</Label>
                 <Select
                    value={String(currentLevel)}
                    onValueChange={(value) => handleLevelDifficultyChange(parseInt(value), currentDifficulty)}
                    disabled={speedChallenge.isActive}
                >
                    <SelectTrigger id="level-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {levels.map(({ level, name }) => (
                            <SelectItem key={level} value={String(level)}>{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                 <Label htmlFor="difficulty-select" className="mb-2 block">Difficulty</Label>
                <Select
                    value={currentDifficulty}
                    onValueChange={(value) => handleLevelDifficultyChange(currentLevel, value as Difficulty)}
                    disabled={speedChallenge.isActive}
                >
                    <SelectTrigger id="difficulty-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 grid grid-cols-3 gap-6">
      {levels.map(({ level, name }) => (
        <div key={level} className="text-center">
          <h3 className="text-lg font-semibold mb-3">{name}</h3>
          <div className="space-y-2">
            {difficulties.map((difficulty) => (
              <Button
                key={`${level}-${difficulty}`}
                onClick={() => handleLevelDifficultyChange(level, difficulty)}
                variant={currentLevel === level && currentDifficulty === difficulty ? 'default' : 'secondary'}
                className="w-full transition-transform transform hover:scale-105"
                disabled={speedChallenge.isActive}
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
