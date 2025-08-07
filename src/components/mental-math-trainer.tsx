

"use client";

import { useState, useEffect } from 'react';
import { useMathTrainer } from '@/context/math-trainer-context';
import { Brain, Moon, Sun, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import StudyGuide from '@/components/study-guide';
import SpeedChallengeControls from '@/components/speed-challenge-controls';
import DifficultySelector from '@/components/difficulty-selector';
import ProblemDisplay from '@/components/problem-display';
import ScoreDisplay from '@/components/score-display';

const HowToPractice = () => (
    <div className="mb-6">
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="bg-secondary hover:bg-muted rounded-md px-4 no-underline">How Do I Practice?</AccordionTrigger>
                <AccordionContent className="pt-4">
                    <ul className="space-y-3">
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Choose a Mode</strong> - Start with <strong>Memorize</strong> to build a foundation, then move to <strong>Estimate</strong> to develop intuition, and finally <strong>Get Crafty</strong> to learn advanced strategies.</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Start with Medium</strong> - If it's too hard, drop to Easy. If it's too easy, the app will suggest moving to Hard.</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Use the Study Guide</strong> - The study guide provides reference tables for memorization, estimation strategies, and tricks for multiplication and division.</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Don't Show Your Work</strong> - The point of this is to practice everything in your head. So throw out your pencil, paper, and calculator or donate them to charity.</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Build speed before advancing</strong> - Once you feel like you can handle a difficulty level in your head, use <strong>Speed Challenge</strong> to develop automaticity—getting answers quickly, not just correctly.</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Make it second nature:</strong> The goal is automaticity. When you see your Aunt Rita, you don't have to consciously figure out who she is—your brain just serves up "Aunt Rita." Basic calculations like <code>5³</code> or <code>16×5</code> should feel the same way. This frees up mental energy for more complex problems.</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Pro-Tip: Use your keyboard</strong> - For text answers, press `Enter` to check your answer and again for the next problem. For "Yes/No" questions, use the `y` and `n` keys.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

const HowToStudy = () => (
    <div className="mb-6">
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="bg-secondary hover:bg-muted rounded-md px-4 no-underline">How Do I Study?</AccordionTrigger>
                <AccordionContent className="pt-4">
                    <ul className="space-y-3">
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Chunk information</strong> - Break complex topics into smaller pieces. Master 1²-5² before adding 6²-10².</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Practice active recall</strong> - Close the study guide and test yourself. Can you recite all perfect squares 1²-10² from memory?</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary"><strong>Alternate study and practice</strong> - Study a chunk (like 1²-5²), then immediately practice Easy problems using those squares.</li>
                        <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
                            <strong>Use spaced repetition (2,3,5,7 method)</strong> - Study today, then review 2 days later, then 3 days after that, then 5 days, then 7 days. This spacing helps move information into long-term memory.
                            <div className="mt-2 p-3 rounded-md font-mono text-xs bg-muted text-muted-foreground">
                                <strong>Schedule:</strong> Day 1: Study → Day 3: Review → Day 6: Review → Day 11: Review → Day 18: Review
                            </div>
                        </li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
);

const levelToTab = (level: number) => {
    switch (level) {
        case 1: return 'memorize';
        case 2: return 'estimate';
        case 3: return 'crafty';
        default: return 'memorize';
    }
}

export default function MentalMathTrainer() {
    const { mode, setMode, darkMode, setDarkMode, currentLevel, setStudyTab } = useMathTrainer();

    const handleModeChange = (newMode: 'practice' | 'study') => {
        if (newMode === 'study') {
            setStudyTab(levelToTab(currentLevel));
        }
        setMode(newMode);
    }

    return (
        <main className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} font-body`}>
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-2 tracking-tight">
                            <Brain className="text-primary w-8 h-8" />
                            <span className="font-headline">MathMog</span>
                        </h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDarkMode(!darkMode)}
                            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? <Sun className="text-yellow-400" /> : <Moon />}
                        </Button>
                    </div>
                    <p className="text-muted-foreground">Flex your mental math muscle</p>
                </div>

                <Card className="shadow-xl">
                    <CardContent className="p-4 sm:p-6">
                        <Tabs value={mode} onValueChange={(value) => handleModeChange(value as 'practice' | 'study')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="practice">🎯 Practice</TabsTrigger>
                                <TabsTrigger value="study">📚 Study Guide</TabsTrigger>
                            </TabsList>
                            <TabsContent value="practice" className="mt-6">
                                <HowToPractice />
                                <SpeedChallengeControls />
                                <DifficultySelector />
                                <ProblemDisplay />
                                <ScoreDisplay />
                            </TabsContent>
                            <TabsContent value="study" className="mt-6">
                                <HowToStudy />
                                <StudyGuide />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
