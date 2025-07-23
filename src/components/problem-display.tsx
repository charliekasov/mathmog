"use client";

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
          <DialogTitle className="text-center text-2xl">🎉 You're Leveling Up! 🎉</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've answered 7 in a row correctly. Ready to move up to {pendingLevelUp.to}?
          </DialogDescription>
        </DialogHeader>
        <div className="text-center text-xl font-semibold text-primary my-4">
          Ready for {pendingLevelUp.to}?
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={() => handleLevelUp(false)} variant="outline">
            Not yet.
          </Button>
          <Button type="button" onClick={() => handleLevelUp(true)}>
            Let's Go!
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

export default function ProblemDisplay() {
  const { currentProblem, userAnswer, setUserAnswer, feedback, showAnswer, speedChallenge, handleCheckAnswer, handleNewProblem } = useMathTrainer();
  
  const onCheckAnswer = () => handleCheckAnswer(userAnswer);

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
        <CardTitle className="text-2xl md:text-3xl font-bold pt-2">{currentProblem.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto px-4">
          {currentProblem.inputType === 'buttons' ? (
            <div className="flex gap-3 justify-center">
              {currentProblem.options?.map((option) => (
                <Button key={option} size="lg" onClick={() => { setUserAnswer(option); setTimeout(() => handleCheckAnswer(option), 100); }} disabled={feedback !== ''} variant={userAnswer === option ? 'default' : 'secondary'} className="text-xl min-w-[120px]">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
          ) : (
            <Input 
                type={currentProblem.inputType} 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { if (feedback && !speedChallenge.isActive) { handleNewProblem(); } else { onCheckAnswer(); } } }}
                placeholder={currentProblem.placeholder || "Your answer..."}
                className="p-4 text-xl text-center h-14"
                disabled={feedback !== '' && !speedChallenge.isActive}
                autoFocus
            />
          )}
          {!speedChallenge.isActive && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button onClick={onCheckAnswer} disabled={feedback !== '' || userAnswer.trim() === ''} size="lg" className="flex-1 text-lg">
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
