
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useMathTrainer } from '@/context/math-trainer-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Loader2, UserPlus, RefreshCw } from 'lucide-react';
import { getLeaderboardData, createUser as createUserFlow } from '@/ai/flows/leaderboard-flow';
import type { LeaderboardData, Difficulty } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from './ui/separator';

const getSecret = (): string => {
    let secret = localStorage.getItem('mathmog-secret');
    if (!secret) {
        secret = uuidv4();
        localStorage.setItem('mathmog-secret', secret);
    }
    return secret;
}

const levels = [
  { level: 1, name: '🧠 Memorize' },
  { level: 2, name: '📊 Estimate' },
  { level: 3, name: '😈 Get Crafty' }
];

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export default function Leaderboard() {
    const { user, refreshLeaderboardData } = useMathTrainer();
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [nameInput, setNameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [levelFilter, setLevelFilter] = useState<number>(1);
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty>('Medium');
    const [durationFilter, setDurationFilter] = useState<number>(1);
    
    const { toast } = useToast();
    const secret = getSecret();

    const fetchLeaderboard = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getLeaderboardData({ level: levelFilter, difficulty: difficultyFilter, duration: durationFilter, secret });
            setLeaderboardData(data);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
            toast({ title: "Error", description: "Could not load leaderboard data.", variant: "destructive" });
        }
        setIsLoading(false);
    }, [levelFilter, difficultyFilter, durationFilter, secret, toast]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);


    const handleCreateUser = async () => {
        setIsSubmitting(true);
        const result = await createUserFlow({ name: nameInput, secret });
        if (result.success && result.user) {
            toast({ title: "Success!", description: `Welcome, ${nameInput}! Your name is now saved to this browser.` });
            await refreshLeaderboardData(result.user);
            fetchLeaderboard();
        } else {
            toast({ title: "Oops!", description: result.message, variant: "destructive" });
        }
        setIsSubmitting(false);
        setNameInput('');
    }

    const renderLeaderboard = () => {
        if (!leaderboardData || leaderboardData.scores.length === 0) {
            return <TableRow><TableCell colSpan={4} className="text-center">No scores yet. Be the first!</TableCell></TableRow>;
        }

        return leaderboardData.scores.map((score, index) => (
            <TableRow key={score.id} className={score.isCurrentUser ? 'bg-accent/20' : ''}>
                <TableCell className="font-semibold text-lg">{index + 1}{index === 0 && <Crown className="inline w-6 h-6 ml-2 text-amber-400" />}</TableCell>
                <TableCell className="font-semibold text-lg">{score.name}</TableCell>
                <TableCell className="text-right text-muted-foreground">{new Date(score.createdAt).toLocaleDateString(undefined, { year: '2-digit', month: 'numeric', day: 'numeric' })}</TableCell>
                <TableCell className="text-right font-semibold text-lg">{score.score}</TableCell>
            </TableRow>
        ));
    };

    const durationOptions = [
        { duration: 1, label: '⚡️ 1 min' },
        { duration: 2, label: '⚡️⚡️ 2 min' },
        { duration: 3, label: '⚡️⚡️⚡️ 3 min' },
    ];
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl md:text-2xl">Speed Challenge High Scores</CardTitle>
                        <CardDescription>View the top scores by mode, difficulty, and duration.</CardDescription>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
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
                                <div>
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
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                        
                        {!user && (
                            <div className="mb-6 p-4 border rounded-lg bg-secondary/50">
                                <h3 className="font-semibold mb-2 flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Set Your Scoreboard Name</h3>
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
                        <Separator className="my-6" />
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-primary">{levels.find(l => l.level === levelFilter)?.name}</h3>
                            <p className="text-sm text-muted-foreground">{difficultyFilter} Difficulty &middot; {durationFilter} Minute Challenge</p>
                        </div>
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
