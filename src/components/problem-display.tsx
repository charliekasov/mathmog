
"use client";

import { useEffect, useState, useRef } from 'react';
import { useMathTrainer } from '@/context/math-trainer-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const LevelUpDialog = () => {
  const { adaptiveData, handleLevelUp } = useMathTrainer();
  const { pendingLevelUp } = adaptiveData;

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
          <Button type="button" onClick={() => handleLevelUp(false)} variant="secondary" className="text-muted-foreground">
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

const ChallengeResults = () => {
    const { speedChallenge } = useMathTrainer();
    const { results } = speedChallenge;
    if (!results) return null;

    return (
         <Alert>
            <AlertTitle className="text-xl">Challenge Complete!</AlertTitle>
            <AlertDescription>
                You got <span className='font-bold'>{results.correct}</span> out of <span className='font-bold'>{results.total}</span> correct.
            </AlertDescription>
        </Alert>
    )
}

const MultiTextInput = ({ questionParts, onComplete, onCheck }: { questionParts: string[], onComplete: (val: string) => void, onCheck: () => void }) => {
    const [answers, setAnswers] = useState<string[]>(['', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        onComplete(answers.join(','));
    }, [answers, onComplete]);
    
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

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
                         />
                    )}
                </div>
            ))}
        </div>
    );
};

export default function ProblemDisplay() {
  const { currentProblem, userAnswer, setUserAnswer, feedback, showAnswer, speedChallenge, handleCheckAnswer, handleNewProblem } = useMathTrainer();
  
  const onCheckAnswer = () => handleCheckAnswer(userAnswer);

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

  if (!currentProblem) {
    if (speedChallenge.enabled && !speedChallenge.isActive && speedChallenge.results) {
        return <ChallengeResults />;
    }
    return <LevelUpDialog />;
  }

  return (
    <Card className="transition-all duration-500">
      <CardHeader className="text-center">
         <div className="mx-auto">
             <Badge variant="secondary">{currentProblem.type}</Badge>
         </div>
        {currentProblem.inputType !== 'multi-text' && <CardTitle className="text-2xl md:text-3xl font-bold pt-2">{currentProblem.question}</CardTitle>}
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
              <MultiTextInput questionParts={currentProblem.question} onComplete={setUserAnswer} onCheck={onCheckAnswer} />
          ) : (
            <Input 
                type={currentProblem.inputType} 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { if (feedback) { handleNewProblem(); } else { onCheckAnswer(); } } }}
                placeholder={currentProblem.placeholder || "Your answer..."}
                className="p-4 text-xl text-center h-14"
                disabled={speedChallenge.isActive && feedback !== ''}
                autoFocus
            />
          )}
          {!speedChallenge.isActive && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button onClick={onCheckAnswer} disabled={feedback !== '' || userAnswer.trim() === '' || currentProblem.inputType === 'buttons'} size="lg" className="flex-1 text-lg">
                    <Check className="w-5 h-5 mr-2" /> Check Answer
                </Button>
                {feedback && (
                    <Button onClick={handleNewProblem} size="lg" className="flex-1 text-lg bg-green-600 hover:bg-green-700">
                        Next Problem <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                )}
            </div>
          )}
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
