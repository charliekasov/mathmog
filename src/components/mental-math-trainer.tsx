"use client";

import { useState, useEffect, useRef } from 'react';
import { useUI } from '@/context/ui-context';
import { useProblem } from '@/context/problem-context';
import { useSpeedChallenge } from '@/context/speed-challenge-context';
import { useUser } from '@/context/user-context';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Moon, Sun, ArrowRight, Trophy, Loader2 } from 'lucide-react';
import DifficultySelector from '@/components/difficulty-selector';
import ProblemDisplay from '@/components/problem-display';
import ScoreDisplay from '@/components/score-display';
import SpeedChallengeControls from '@/components/speed-challenge-controls';
import SpeedChallengeReadyScreen from '@/components/speed-challenge-ready-screen';
import StudyGuide from '@/components/study-guide';
import Leaderboard from '@/components/leaderboard';
import { submitScore } from '@/ai/flows/leaderboard-flow';
import { useToast } from '@/hooks/use-toast';

// Inline components
const HowToPractice = () => (
  <div className="mb-6">
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1" className="border-b-0">
        <AccordionTrigger className="bg-secondary hover:bg-muted rounded-md px-4 no-underline">
          How Do I Practice?
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <ul className="space-y-3">
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Choose a Mode</strong> - Start with <strong>Memorize</strong> to build a foundation,
              then move to <strong>Estimate</strong> to develop intuition, and finally <strong>Get Crafty</strong> to
              learn advanced strategies.
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Start with Medium</strong> - If it's too hard, drop to Easy. If it's too easy,
              the app will suggest moving to Hard.
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Use the Study Guide</strong> - The study guide provides reference tables for memorization,
              estimation strategies, and tricks for multiplication and division.
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Don't Show Your Work</strong> - The point of this is to practice everything in your head.
              So throw out your pencil, paper, and calculator or donate them to charity.
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Build speed before advancing</strong> - Once you feel like you can handle a difficulty level
              in your head, use <strong>Speed Challenge</strong> to develop automaticity—getting answers quickly,
              not just correctly.
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Make it second nature:</strong> The goal is automaticity. When you see your Aunt Rita,
              you don't have to consciously figure out who she is—your brain just serves up "Aunt Rita."
              Basic calculations like <code>5³</code> or <code>16×5</code> should feel the same way.
              This frees up mental energy for more complex problems.
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Pro-Tip: Use your keyboard</strong> - For text answers, press `Enter` to check your answer
              and again for the next problem. For "Yes/No" questions, use the `y` and `n` keys.
            </li>
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
        <AccordionTrigger className="bg-secondary hover:bg-muted rounded-md px-4 no-underline">
          How Do I Study?
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <ul className="space-y-3">
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Chunk information</strong> - Break complex topics into smaller pieces.
              Master 1²-5² before adding 6²-10².
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Practice active recall</strong> - Close the study guide and test yourself.
              Can you recite all perfect squares 1²-10² from memory?
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Alternate study and practice</strong> - Study a chunk (like 1²-5²),
              then immediately practice Easy problems using those squares.
            </li>
            <li className="p-3 bg-secondary/50 rounded-md border border-secondary">
              <strong>Use spaced repetition (2,3,5,7 method)</strong> - Study today, then review 2 days later,
              then 3 days after that, then 5 days, then 7 days. This spacing helps move information into long-term memory.
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

interface ChallengeResultsProps {
  challengeParams: { level: number; difficulty: string; duration: number };
}

const ChallengeResults = ({ challengeParams }: ChallengeResultsProps) => {
  const { handleNewProblem } = useProblem();
  const { speedChallenge, clearSpeedChallengeResults } = useSpeedChallenge();
  const { refreshLeaderboardData } = useUser();
  const { toast } = useToast();
  const { results } = speedChallenge;

  const [nameInput, setNameInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!speedChallenge.enabled || speedChallenge.isActive || !results) return null;

  const handleStartNewChallenge = () => {
    clearSpeedChallengeResults();
    setNameInput('');
    setHasSubmitted(false);
    handleNewProblem();
  };

  const handleSubmitScore = async () => {
    if (!nameInput.trim() || results.correct === 0) return;

    setIsSubmitting(true);
    try {
      const result = await submitScore({
        name: nameInput.trim(),
        score: results.correct,
        level: challengeParams.level,
        difficulty: challengeParams.difficulty as 'Easy' | 'Medium' | 'Hard',
        duration: challengeParams.duration,
      });

      if (result.success) {
        toast({ title: "Score submitted!", description: `${nameInput} is now on the leaderboard!` });
        setHasSubmitted(true);
        refreshLeaderboardData();
      } else {
        toast({ title: "Couldn't save score", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit score", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-6">
      <Alert>
        <AlertTitle className="text-xl">Challenge Complete!</AlertTitle>
        <AlertDescription>
          You got <span className='font-bold'>{results.correct}</span> out of{' '}
          <span className='font-bold'>{results.total}</span> correct.
        </AlertDescription>
      </Alert>

      {/* Arcade-style name entry */}
      {results.correct > 0 && !hasSubmitted && (
        <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
          <div className="text-center mb-3">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-semibold">Enter your name for the leaderboard!</p>
            <p className="text-sm text-muted-foreground">3-12 characters, letters and numbers only</p>
          </div>
          <div className="flex gap-2 max-w-sm mx-auto">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value.toUpperCase())}
              maxLength={12}
              placeholder="AAA"
              className="text-center font-mono text-lg uppercase"
              disabled={isSubmitting}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitScore(); }}
              autoFocus
            />
            <Button onClick={handleSubmitScore} disabled={isSubmitting || nameInput.trim().length < 3}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {hasSubmitted && (
        <div className="mt-4 p-4 bg-green-500/10 rounded-lg text-center">
          <p className="font-semibold text-green-600">Score saved to leaderboard!</p>
        </div>
      )}

      <div className="mt-4 flex justify-center gap-2">
        <Button onClick={handleStartNewChallenge} variant={hasSubmitted ? "default" : "outline"}>
          <ArrowRight className="w-5 h-5 mr-2" /> {hasSubmitted ? "Play Again" : "Skip & Play Again"}
        </Button>
      </div>
    </div>
  );
};

const levelToTab = (level: number) => {
  switch (level) {
    case 1: return 'memorize';
    case 2: return 'estimate';
    case 3: return 'crafty';
    default: return 'memorize';
  }
};

export default function MentalMathTrainer() {
  const { mode, setMode, darkMode, setDarkMode, studyTab, setStudyTab } = useUI();
  const { currentLevel, currentDifficulty, handleNewProblem, score, handleReset } = useProblem();
  const { speedChallenge, setSpeedChallenge } = useSpeedChallenge();
  const { isLoading } = useUser();
  const prevIsActive = useRef(speedChallenge.isActive);
  const scoreRef = useRef(score);
  const [challengeParams, setChallengeParams] = useState({ level: currentLevel, difficulty: currentDifficulty, duration: speedChallenge.duration });

  // Keep scoreRef in sync
  scoreRef.current = score;

  // Capture challenge params when challenge starts
  useEffect(() => {
    if (speedChallenge.isActive && !prevIsActive.current) {
      setChallengeParams({ level: currentLevel, difficulty: currentDifficulty, duration: speedChallenge.duration });
    }
  }, [speedChallenge.isActive, currentLevel, currentDifficulty, speedChallenge.duration]);

  // Initialize first problem on mount
  useEffect(() => {
    if (!isLoading) {
      handleNewProblem();
    }
  }, [isLoading, handleNewProblem]);

  // Handle speed challenge state changes
  useEffect(() => {
    // When speed challenge starts, reset score and generate new problem
    if (speedChallenge.isActive && !prevIsActive.current) {
      handleReset();
    }
    // When speed challenge ends, capture the score
    if (!speedChallenge.isActive && prevIsActive.current) {
      setSpeedChallenge(prev => ({
        ...prev,
        results: {
          correct: scoreRef.current.correct,
          total: scoreRef.current.total
        }
      }));
    }
    prevIsActive.current = speedChallenge.isActive;
  }, [speedChallenge.isActive, handleReset, setSpeedChallenge]);

  const handleModeChange = (newMode: 'practice' | 'study' | 'leaderboard') => {
    if (newMode === 'study') {
      setStudyTab(levelToTab(currentLevel));
    }
    setMode(newMode);
  };

  const showPracticeContent = !speedChallenge.enabled || speedChallenge.isActive;

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'dark bg-background' : 'bg-background'
    }`}>
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
          <p className="text-primary">Flex your mental math muscle</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-4 sm:p-6">
            <Tabs
              value={mode}
              onValueChange={(value) => handleModeChange(value as 'practice' | 'study' | 'leaderboard')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="practice">🎯 Practice</TabsTrigger>
                <TabsTrigger value="study">📚 Study</TabsTrigger>
                <TabsTrigger value="leaderboard">🏆 Scores</TabsTrigger>
              </TabsList>

              <TabsContent value="practice" className="mt-0">
                <HowToPractice />
                <SpeedChallengeControls />

                {showPracticeContent ? (
                  <>
                    <DifficultySelector />
                    <ProblemDisplay />
                    <ScoreDisplay />
                  </>
                ) : (
                  <SpeedChallengeReadyScreen />
                )}
                <ChallengeResults challengeParams={challengeParams} />
              </TabsContent>

              <TabsContent value="study" className="mt-0">
                <HowToStudy />
                <StudyGuide />
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-0">
                {speedChallenge.isActive ? (
                  <div className="text-center py-12">
                    <p className="text-lg font-semibold mb-2">⏱️ Speed Challenge in Progress</p>
                    <p className="text-muted-foreground">
                      Finish your challenge to view the leaderboard
                    </p>
                  </div>
                ) : (
                  <Leaderboard />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
