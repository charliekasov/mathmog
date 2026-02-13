"use client";

import { useState, useEffect, useRef } from 'react';
import { useProblem } from '@/context/problem-context';
import { useUI } from '@/context/ui-context';
import { useSpeedChallenge } from '@/context/speed-challenge-context';
import { useUser } from '@/context/user-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ArrowRight } from 'lucide-react';

// LevelUpDialog component with proper null checks
const LevelUpDialog = () => {
  const { adaptiveData, handleLevelUp } = useProblem();
  const { speedChallenge } = useSpeedChallenge();
  const { pendingLevelUp } = adaptiveData;

  // Don't show level-up dialog during active speed challenge
  if (!pendingLevelUp || speedChallenge.isActive) return null;
  
  return (
    <Dialog open={!!pendingLevelUp} onOpenChange={(open) => !open && handleLevelUp(false)}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <div className="text-4xl mb-4">{pendingLevelUp.emojis}</div>
            <span className="font-extrabold text-lg block">{pendingLevelUp.title}</span>
            {pendingLevelUp.allCapsTitle && (
              <span className="font-extrabold text-lg block">{pendingLevelUp.allCapsTitle}</span>
            )}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-primary font-semibold text-lg">
            {pendingLevelUp.subtitle}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row sm:justify-center gap-2 mt-4">
          <Button type="button" onClick={() => handleLevelUp(false)} variant="secondary" className="w-full sm:w-auto">
            {pendingLevelUp.options.no}
          </Button>
          <Button type="button" onClick={() => handleLevelUp(true)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            {pendingLevelUp.options.yes}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// MultiTextInput component - keep as is
const MultiTextInput = ({ questionParts, onComplete, onCheck, disabled }: { 
  questionParts: string[], 
  onComplete: (val: string) => void, 
  onCheck: () => void, 
  disabled: boolean 
}) => {
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

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      if (index < 2) {
        inputRefs.current[index + 1]?.focus();
      } else {
        onCheck();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-2xl md:text-3xl font-bold text-center space-y-2">
        {questionParts[0]}
        <Input
          ref={(el) => { inputRefs.current[0] = el; }}
          type="text"
          value={answers[0]}
          onChange={(e) => handleChange(0, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 0)}
          className="w-20 h-14 text-xl text-center mx-2 inline-block"
          disabled={disabled}
          autoFocus
        />
        {questionParts[1]}
        <Input
          ref={(el) => { inputRefs.current[1] = el; }}
          type="text"
          value={answers[1]}
          onChange={(e) => handleChange(1, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 1)}
          className="w-20 h-14 text-xl text-center mx-2 inline-block"
          disabled={disabled}
        />
        {questionParts[2]}
        <Input
          ref={(el) => { inputRefs.current[2] = el; }}
          type="text"
          value={answers[2]}
          onChange={(e) => handleChange(2, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 2)}
          className="w-20 h-14 text-xl text-center mx-2 inline-block"
          disabled={disabled}
        />
        {questionParts[3]}
      </div>
    </div>
  );
};

// Main ProblemDisplay component
export default function ProblemDisplay() {
  const { isLoading } = useUser();
  const { 
    currentProblem, 
    userAnswer, 
    setUserAnswer, 
    feedback, 
    showAnswer, 
    handleCheckAnswer, 
    handleNewProblem 
  } = useProblem();
  const { speedChallenge } = useSpeedChallenge();
  
  const inputRef = useRef<HTMLInputElement>(null);

  const onCheckAnswer = () => {
    handleCheckAnswer(userAnswer);
  };

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

  // Auto-advance to next problem during speed challenge
  useEffect(() => {
    if (speedChallenge.isActive && feedback) {
      const timer = setTimeout(() => {
        handleNewProblem();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [speedChallenge.isActive, feedback, handleNewProblem]);

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
    <Card className={speedChallenge.isActive ? '' : 'transition-all duration-500'}>
      <CardHeader className="text-center">
         <div className="mx-auto">
             <Badge variant="secondary">{currentProblem.type}</Badge>
         </div>
         {currentProblem.inputType !== 'multi-text' && <CardTitle className="text-2xl md:text-3xl font-bold pt-2">{currentProblem.question as string}</CardTitle>}
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
            <div className={`text-lg font-semibold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600 dark:text-red-500'}`}>{feedback === 'correct' ? '✅ Correct!' : '❌ Incorrect'}</div>
            {showAnswer && (
              <Alert variant={feedback === 'correct' ? 'default' : 'destructive'} className="text-left">
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
