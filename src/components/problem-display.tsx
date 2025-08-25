
"use client";

import { useEffect, useState, useRef } from 'react';
import { useMathTrainer } from '@/context/math-trainer-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createUser, submitScore } from '@/ai/flows/leaderboard-flow';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';


const getSecret = (): string => {
    if (typeof window === 'undefined') return '';
    let secret = localStorage.getItem('mathmog-secret');
    if (!secret) {
        secret = uuidv4();
        localStorage.setItem('mathmog-secret', secret);
    }
    return secret;
}

const CreateUserDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [nameInput, setNameInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { setMode, speedChallenge, currentLevel, currentDifficulty, refreshLeaderboardData, clearSpeedChallengeResults } = useMathTrainer();
    const { results } = speedChallenge;

    const handleCreateUser = async () => {
        if (!results) return;

        setIsSubmitting(true);
        const secret = getSecret();
        const createResult = await createUser({ name: nameInput, secret });
        
        if (createResult.success && createResult.user) {
            toast({ title: "Success!", description: `Welcome, ${nameInput}! Your score has been saved.` });

            // Now submit the score
            await submitScore({
                level: currentLevel,
                difficulty: currentDifficulty,
                duration: speedChallenge.duration,
                score: results.correct,
                secret
            });

            await refreshLeaderboardData(createResult.user); // This will update the user state globally
            onOpenChange(false);
            clearSpeedChallengeResults();
            setMode('leaderboard');

        } else {
            toast({ title: "Oops!", description: createResult.message, variant: "destructive" });
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">
                        <div className="text-4xl mb-4">🏆</div>
                        <span className="font-extrabold text-lg block">You got a high score!</span>
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Set your name to appear on the scoreboard. Your name is saved to this browser for future scores.
                    </DialogDescription>
                </DialogHeader>
                 <div className="flex gap-2 pt-4">
                    <Input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        maxLength={12}
                        placeholder="3-12 characters"
                        disabled={isSubmitting}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleCreateUser() }}
                    />
                    <Button onClick={handleCreateUser} disabled={isSubmitting || nameInput.length < 3}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & View Scores
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


const LevelUpDialog = () => {
  const { adaptiveData, handleLevelUp, speedChallenge } = useMathTrainer();
  const { pendingLevelUp } = adaptiveData;
  const [isCreateUserOpen, setCreateUserOpen] = useState(false);

  useEffect(() => {
      if (speedChallenge.results && speedChallenge.results.isNewUser) {
          setCreateUserOpen(true);
      }
  }, [speedChallenge.results]);


  if (!pendingLevelUp && !speedChallenge.results?.isNewUser) return null;

  if (speedChallenge.results?.isNewUser) {
      return <CreateUserDialog isOpen={isCreateUserOpen} onOpenChange={setCreateUserOpen} />;
  }

  if (!pendingLevelUp) return null;

  return (
    <Dialog open={!!pendingLevelUp} onOpenChange={(open) => !open && handleLevelUp(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <div className="text-4xl mb-4">{pendingLevelUp.emojis}</div>
            <span className="font-extrabold text-lg block">{pendingLevelUp.title}</span>
            {pendingLevelUp.allCapsTitle && <span className="font-extrabold text-lg block">{pendingLevelUp.allCapsTitle}</span>}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-primary font-semibold text-lg">
            {pendingLevelUp.subtitle}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2 mt-4">
          <Button type="button" onClick={() => handleLevelUp(false)} variant="secondary">
            {pendingLevelUp.options.no}
          </Button>
          <Button type="button" onClick={() => handleLevelUp(true)} className="bg-green-600 hover:bg-green-700">
            {pendingLevelUp.options.yes}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MultiTextInput = ({ questionParts, onComplete, onCheck, disabled }: { questionParts: string[], onComplete: (val: string) => void, onCheck: () => void, disabled: boolean }) => {
    const [answers, setAnswers] = useState<string[]>(['', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setAnswers(['', '', '']);
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [questionParts]);

    useEffect(() => {
        onComplete(answers.join(','));
    }, [answers, onComplete]);

    const handleChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Tab' && !e.shiftKey && index < 2) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'Tab' && e.shiftKey && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'Enter') {
            onCheck();
        }
    };
    
    return (
         <div className="flex flex-wrap items-center justify-center gap-2 text-xl md:text-2xl font-bold">
            {questionParts.map((part, i) => (
                <div key={i} className="contents">
                    <span>{part}</span>
                    {i < answers.length && (
                         <Input
                            ref={el => inputRefs.current[i] = el}
                            type="number"
                            value={answers[i]}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className="w-20 text-center text-xl h-12"
                            disabled={disabled}
                         />
                    )}
                </div>
            ))}
        </div>
    );
};

export default function ProblemDisplay() {
  const { isLoading, currentProblem, userAnswer, setUserAnswer, feedback, showAnswer, speedChallenge, handleCheckAnswer, handleNewProblem } = useMathTrainer();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const onCheckAnswer = () => handleCheckAnswer(userAnswer);

  useEffect(() => {
    if (feedback) return;
    if (currentProblem && (currentProblem.inputType === 'text' || currentProblem.inputType === 'number' || currentProblem.inputType === 'multi-text')) {
      const firstInput = inputRef.current;
      if (firstInput) {
        // Delay focus slightly to help mobile browsers trigger the keyboard
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  }, [currentProblem, feedback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName.toLowerCase() === 'input') {
        return;
      }
      
      if (feedback && e.key === 'Enter') {
        handleNewProblem();
        return;
      }

      if (currentProblem?.inputType === 'buttons' && !feedback) {
        if (e.key.toLowerCase() === 'y') {
          handleCheckAnswer('yes');
        } else if (e.key.toLowerCase() === 'n') {
          handleCheckAnswer('no');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentProblem, feedback, handleCheckAnswer, handleNewProblem]);

  if (isLoading) {
    return (
      <Card className="transition-all duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto">
            <Badge variant="secondary">Loading...</Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold pt-2">Generating problem...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24" />
        </CardContent>
      </Card>
    );
  }

  if (!currentProblem) {
    return <LevelUpDialog />;
  }

  return (
    <Card className="transition-all duration-500">
      <CardHeader className="text-center">
         <div className="mx-auto">
             <Badge variant="secondary">{currentProblem.type}</Badge>
         </div>
         {currentProblem.inputType !== 'multi-text' && <CardTitle className="text-2xl md:text-3xl font-bold pt-2" dangerouslySetInnerHTML={{ __html: currentProblem.question as string}} />}
      </CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto px-4">
          {currentProblem.inputType === 'buttons' ? (
            <div className="flex gap-3 justify-center">
              {currentProblem.options?.map((option) => (
                <Button key={option} size="lg" onClick={() => handleCheckAnswer(option)} disabled={feedback !== ''} variant={userAnswer === option ? 'default' : 'secondary'} className="text-xl min-w-[120px]">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          ) : currentProblem.inputType === 'multi-text' && Array.isArray(currentProblem.question) ? (
              <MultiTextInput 
                questionParts={currentProblem.question} 
                onComplete={setUserAnswer} 
                onCheck={onCheckAnswer}
                disabled={feedback !== ''}
              />
          ) : (
            <Input 
                ref={inputRef}
                type={currentProblem.inputType} 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { if (feedback) { handleNewProblem(); } else { onCheckAnswer(); } } }}
                placeholder={currentProblem.placeholder || "Your answer..."}
                className="p-4 text-xl text-center h-14"
                disabled={feedback !== ''}
            />
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {!feedback ? (
              <Button onClick={onCheckAnswer} disabled={userAnswer.trim() === '' || currentProblem.inputType === 'buttons'} className="flex-1 text-lg h-14 sm:h-11 px-8">
                  <Check className="w-5 h-5 mr-2" /> Check Answer
              </Button>
            ) : !speedChallenge.isActive ? (
              <Button onClick={() => handleNewProblem()} className="flex-1 text-lg bg-green-600 hover:bg-green-700 h-14 sm:h-11 px-8">
                  Next Problem <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : null}
          </div>
          
        </div>
        {feedback && !speedChallenge.isActive && (
          <div className="mt-6 space-y-3 text-center">
            <div className={`text-lg font-semibold ${feedback.includes('✅') ? 'text-green-600' : 'text-red-600 dark:text-red-500'}`}>{feedback}</div>
            {showAnswer && (
              <Alert variant={feedback.includes('✅') ? 'default' : 'destructive'} className="text-left">
                  <AlertTitle>Explanation</AlertTitle>
                  <AlertDescription>
                      {currentProblem.explanation}
                  </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        <LevelUpDialog />
      </CardContent>
    </Card>
  );
}
