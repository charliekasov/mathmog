
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useMathTrainer } from '@/context/math-trainer-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Crown, Loader2, UserPlus, RefreshCw } from 'lucide-react';
import { getLeaderboardData, createUser } from '@/ai/flows/leaderboard-flow';
import type { LeaderboardData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const getSecret = (): string => {
    let secret = localStorage.getItem('mathmog-secret');
    if (!secret) {
        secret = uuidv4();
        localStorage.setItem('mathmog-secret', secret);
    }
    return secret;
}

export default function Leaderboard() {
    const { currentLevel, currentDifficulty, score } = useMathTrainer();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [nameInput, setNameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [durationFilter, setDurationFilter] = useState<number>(1);
    const { toast } = useToast();
    const secret = getSecret();

    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getLeaderboardData({ level: currentLevel, difficulty: currentDifficulty, duration: durationFilter, secret });
            setLeaderboardData(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
            toast({ title: "Error", description: "Could not load leaderboard data.", variant: "destructive" });
        }
        setIsLoading(false);
    }, [currentLevel, currentDifficulty, durationFilter, secret, toast]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);
    
    useEffect(() => {
      if (leaderboardData?.user && score.total > (leaderboardData.userScore?.score || 0)) {
        // Simple way to auto-submit score if user is known and has a new high score
        // Note: This relies on the context being aware of a score submission mechanism if we want to be more robust
        // For now, we will just refresh the leaderboard to show the new score
        const hasNewHighScore = score.correct > (leaderboardData.userScore?.score || 0);

        if (hasNewHighScore) {
             setTimeout(fetchLeaderboard, 1000); // give db time to update
        }
      }
    }, [score.total, score.correct, leaderboardData, fetchLeaderboard])


    const handleCreateUser = async () => {
        setIsSubmitting(true);
        const result = await createUser({ name: nameInput, secret });
        if (result.success) {
            toast({ title: "Success!", description: `Welcome, ${nameInput}! Your name is now saved to this browser.` });
            await fetchLeaderboard();
        } else {
            toast({ title: "Oops!", description: result.message, variant: "destructive" });
        }
        setIsSubmitting(false);
        setNameInput('');
    }

    const renderLeaderboard = () => {
        if (!leaderboardData || leaderboardData.scores.length === 0) {
            return <TableRow><TableCell colSpan={3} className="text-center">No scores yet. Be the first!</TableCell></TableRow>;
        }

        return leaderboardData.scores.map((score, index) => (
            <TableRow key={score.id} className={score.isCurrentUser ? 'bg-accent/20' : ''}>
                <TableCell className="font-semibold text-lg">{index + 1}{index === 0 && <Crown className="inline w-6 h-6 ml-2 text-amber-400" />}</TableCell>
                <TableCell className="font-semibold text-lg">{score.name}</TableCell>
                <TableCell className="text-right font-semibold text-lg">{score.score}</TableCell>
            </TableRow>
        ));
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Speed Challenge High Scores</CardTitle>
                        <CardDescription>{currentDifficulty} - Mode: {currentLevel === 1 ? 'Memorize' : currentLevel === 2 ? 'Estimate' : 'Get Crafty'}</CardDescription>
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
                        <div className="mb-4">
                            <Label htmlFor="duration-select" className="mb-2 block">Duration</Label>
                            <Select
                                value={String(durationFilter)}
                                onValueChange={(value) => setDurationFilter(parseInt(value))}
                            >
                                <SelectTrigger id="duration-select"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 minute</SelectItem>
                                    <SelectItem value="2">2 minutes</SelectItem>
                                    <SelectItem value="3">3 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {!leaderboardData?.user && (
                            <div className="mb-6 p-4 border rounded-lg bg-secondary/50">
                                <h3 className="font-semibold mb-2 flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Set Your Leaderboard Name</h3>
                                <div className="flex gap-2">
                                    <Input
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        maxLength={12}
                                        placeholder="1-12 alphanumeric characters"
                                        disabled={isSubmitting}
                                    />
                                    <Button onClick={handleCreateUser} disabled={isSubmitting || nameInput.length === 0}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save
                                    </Button>
                                </div>
                                 <p className="text-xs text-muted-foreground mt-2">
                                    Your name is your identity here. It's saved to this browser. Clearing browser data will permanently reset it.
                                </p>
                            </div>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/6">Rank</TableHead>
                                    <TableHead className="w-4/6">Name</TableHead>
                                    <TableHead className="text-right w-1/6">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {renderLeaderboard()}
                            </TableBody>
                        </Table>

                        {leaderboardData?.user && leaderboardData.userScore && (
                             <div className="mt-4 p-3 bg-accent/90 rounded-md text-center text-accent-foreground">
                                Your best score for this mode is <span className="font-bold">{leaderboardData.userScore.score}</span>, ranked #{leaderboardData.userScore.rank}.
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
