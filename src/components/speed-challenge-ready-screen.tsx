
"use client";

import { useMathTrainer } from '@/context/math-trainer-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer } from 'lucide-react';
import DifficultySelector from './difficulty-selector';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';


export default function SpeedChallengeReadyScreen() {
    const { speedChallenge, setSpeedChallenge, handleStartSpeedChallenge } = useMathTrainer();

    const durationOptions = [
        { duration: 1, label: '⚡️ 1 min' },
        { duration: 2, label: '⚡️⚡️ 2 min' },
        { duration: 3, label: '⚡️⚡️⚡️ 3 min' },
    ];

    return (
        <Card className="border-primary/20 bg-secondary/50">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Speed Challenge!</CardTitle>
                <CardDescription>Test your speed and accuracy against the clock.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-w-md mx-auto space-y-6">
                    <DifficultySelector />
                    
                    <div>
                        <Label className="mb-3 block text-center font-medium">Select Duration</Label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                            {durationOptions.map(({ duration, label }) => (
                                <Button
                                    key={duration}
                                    onClick={() => setSpeedChallenge(prev => ({ ...prev, duration }))}
                                    variant={speedChallenge.duration === duration ? 'default' : 'outline'}
                                    size="lg"
                                    className={cn(
                                        "font-bold shadow-sm transition-all text-base",
                                        "hover:shadow-md",
                                        speedChallenge.duration === duration
                                            ? "bg-accent hover:bg-accent/90 text-accent-foreground shadow-inner"
                                            : "bg-background"
                                    )}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                         <Button onClick={handleStartSpeedChallenge} size="lg" className="h-12 text-lg">
                            <Timer className="mr-2 h-5 w-5" /> Start Challenge
                        </Button>
                        <Button onClick={() => setSpeedChallenge(prev => ({...prev, enabled: false}))} variant="ghost">
                            Back to Practice
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
