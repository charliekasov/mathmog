"use client";

import { useState, useEffect, useCallback } from 'react';
import { useUI } from '@/context/ui-context';
import { useUser } from '@/context/user-context';
import { useSpeedChallenge } from '@/context/speed-challenge-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Loader2, RefreshCw } from 'lucide-react';
import { getLeaderboardData } from '@/ai/flows/leaderboard-flow';
import type { Difficulty } from '@/lib/types';
import type { LeaderboardData } from '@/ai/flows/leaderboard-flow';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

const levels = [
  { level: 1, name: '🧠 Memorize' },
  { level: 2, name: '📊 Estimate' },
  { level: 3, name: '😈 Get Crafty' }
];

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const durationOptions = [
  { duration: 1, label: '⚡️ 1 min' },
  { duration: 2, label: '⚡️⚡️ 2 min' },
  { duration: 3, label: '⚡️⚡️⚡️ 3 min' },
];

export default function Leaderboard() {
  const { setMode } = useUI();
  const { leaderboardVersion } = useUser();
  const { setSpeedChallenge } = useSpeedChallenge();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [levelFilter, setLevelFilter] = useState<number>(1);
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('Medium');
  const [durationFilter, setDurationFilter] = useState<number>(1);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboardData({
        level: levelFilter,
        difficulty: difficultyFilter,
        duration: durationFilter
      });
      setLeaderboardData(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    }
    setIsLoading(false);
  }, [levelFilter, difficultyFilter, durationFilter]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard, leaderboardVersion]);

  const handleTrySpeedChallenge = () => {
    setMode('practice');
    setSpeedChallenge(prev => ({ ...prev, enabled: true }));
  };

  const renderLeaderboard = () => {
    if (!leaderboardData || leaderboardData.scores.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={4} className="text-center py-8">
            No scores yet. Be the first!
          </TableCell>
        </TableRow>
      );
    }

    return leaderboardData.scores.map((score, index) => (
      <TableRow key={score.id}>
        <TableCell className="font-semibold text-lg">
          {index + 1}
          {index === 0 && <Crown className="inline w-6 h-6 ml-2 text-amber-400" />}
        </TableCell>
        <TableCell className="font-semibold text-lg">{score.name}</TableCell>
        <TableCell className="text-right text-muted-foreground">
          {new Date(score.createdAt).toLocaleDateString(undefined, {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric'
          })}
        </TableCell>
        <TableCell className="text-right font-semibold text-lg">{score.score}</TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl md:text-2xl">High Scores</CardTitle>
            <CardDescription>Top scores by mode, difficulty, and duration.</CardDescription>
          </div>
          <Button onClick={fetchLeaderboard} variant="ghost" size="icon" disabled={isLoading}>
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !leaderboardData ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <Label htmlFor="level-filter" className="mb-2 block">Mode</Label>
                  <Select value={String(levelFilter)} onValueChange={(v) => setLevelFilter(Number(v))}>
                    <SelectTrigger id="level-filter"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {levels.map(({ level, name }) => (
                        <SelectItem key={level} value={String(level)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-1/2">
                  <Label htmlFor="difficulty-filter" className="mb-2 block">Difficulty</Label>
                  <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as Difficulty)}>
                    <SelectTrigger id="difficulty-filter"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Duration</Label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  {durationOptions.map(({ duration, label }) => (
                    <Button
                      key={duration}
                      onClick={() => setDurationFilter(duration)}
                      variant={durationFilter === duration ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        "rounded-full px-4 font-bold shadow-sm transition-all",
                        "hover:shadow-md",
                        durationFilter === duration
                          ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-inner"
                          : "bg-background"
                      )}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-primary">
                {levels.find(l => l.level === levelFilter)?.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {difficultyFilter} Difficulty · {durationFilter} Minute Challenge
              </p>
            </div>

            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[15%]">Rank</TableHead>
                    <TableHead className="w-[45%]">Name</TableHead>
                    <TableHead className="text-right w-[20%]">Date</TableHead>
                    <TableHead className="text-right w-[20%]">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderLeaderboard()}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="mb-2 text-muted-foreground">Want to get on the scoreboard?</p>
                <Button
                  onClick={handleTrySpeedChallenge}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                >
                  Try a Speed Challenge!
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
