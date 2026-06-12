"use client";

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useProblem } from '../contexts/problem';
import { useSpeedChallenge } from '../contexts/speed-challenge';
import { useMathmogUI } from '../ui/provider';
import { LevelUpDialog } from './level-up-dialog';

interface MultiTextInputProps {
  questionParts: string[];
  onComplete: (val: string) => void;
  onCheck: () => void;
  disabled: boolean;
}

function MultiTextInput({ questionParts, onComplete, onCheck, disabled }: MultiTextInputProps) {
  const ui = useMathmogUI();
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setAnswers(['', '', '']);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [questionParts]);

  const handleChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    onComplete(newAnswers.join(','));
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
        <ui.Input
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
        <ui.Input
          ref={(el) => { inputRefs.current[1] = el; }}
          type="text"
          value={answers[1]}
          onChange={(e) => handleChange(1, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, 1)}
          className="w-20 h-14 text-xl text-center mx-2 inline-block"
          disabled={disabled}
        />
        {questionParts[2]}
        <ui.Input
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
}

function formatProblemAnswer(answer: unknown): string {
  if (Array.isArray(answer)) return answer.map((a) => String(a)).join(' or ');
  return String(answer);
}

interface ProblemDisplayProps {
  /**
   * Drives all homework-mode gates inside this component:
   *  - hides "Show me" + "Skip" buttons
   *  - threads through to <LevelUpDialog suppressInHomework>
   * Default `false` (Free Play / standalone).
   */
  isHomeworkMode?: boolean;
  /**
   * When true, the embedded `<LevelUpDialog />` is omitted entirely. Useful
   * for consumers (e.g. the website demo) that don't want a level-up flow.
   * Default `false`.
   */
  hideLevelUpDialog?: boolean;
}

export function ProblemDisplay({
  isHomeworkMode = false,
  hideLevelUpDialog = false,
}: ProblemDisplayProps = {}) {
  const ui = useMathmogUI();
  const {
    currentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    estimationTier,
    estimationDeviation,
    missDiagnosis,
    correctEnrichment,
    showAnswer,
    handleCheckAnswer,
    handleNewProblem,
    taintStreak,
  } = useProblem();
  const { speedChallenge } = useSpeedChallenge();

  const inputRef = useRef<HTMLInputElement>(null);
  const [revealedAnswer, setRevealedAnswer] = useState(false);

  const showRevealControls = !isHomeworkMode && !speedChallenge.isActive;

  // Reset reveal state when problem changes
  useEffect(() => {
    setRevealedAnswer(false);
  }, [currentProblem]);

  const onCheckAnswer = () => {
    handleCheckAnswer(userAnswer);
  };

  const onShowMe = () => {
    setRevealedAnswer(true);
    // Scaffolding-aware adaptive: taint the current streak so a Free Play
    // level-up dialog is suppressed for this run.
    taintStreak();
  };

  const onSkip = () => {
    taintStreak();
    handleNewProblem();
  };

  useEffect(() => {
    if (feedback) return;
    if (
      currentProblem &&
      (currentProblem.inputType === 'text' ||
        currentProblem.inputType === 'number' ||
        currentProblem.inputType === 'multi-text')
    ) {
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
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [speedChallenge.isActive, feedback, handleNewProblem]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName.toLowerCase() === 'input') {
        return;
      }

      if ((feedback || revealedAnswer) && e.key === 'Enter') {
        handleNewProblem();
        return;
      }

      if (currentProblem?.inputType === 'buttons' && !feedback && !revealedAnswer) {
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
  }, [currentProblem, feedback, revealedAnswer, handleCheckAnswer, handleNewProblem]);

  if (!currentProblem) {
    return hideLevelUpDialog ? null : <LevelUpDialog suppressInHomework={isHomeworkMode} />;
  }

  return (
    <ui.Card
      className={`border-t-2 border-t-amber-300 shadow-md ${
        speedChallenge.isActive ? '' : 'transition-all duration-500'
      } ${
        feedback && !estimationTier
          ? feedback === 'correct'
            ? 'animate-mog-correctFlash'
            : 'animate-mog-incorrectFlash'
          : ''
      }`}
    >
      <ui.CardHeader className="text-center">
        <div className="mx-auto">
          <ui.Badge className="bg-amber-50 text-amber-700 border-amber-200 border">
            {currentProblem.type}
          </ui.Badge>
        </div>
        {currentProblem.inputType !== 'multi-text' && (
          <ui.CardTitle
            data-tour="mathmog-question"
            className="text-2xl md:text-3xl font-bold pt-2"
          >
            {currentProblem.question as string}
          </ui.CardTitle>
        )}
      </ui.CardHeader>
      <ui.CardContent>
        <div className="max-w-md mx-auto px-4">
          {currentProblem.inputType === 'buttons' ? (
            <div className="flex gap-3 justify-center">
              {currentProblem.options?.map((option) => (
                <ui.Button
                  key={option}
                  size="lg"
                  onClick={() => handleCheckAnswer(option)}
                  disabled={feedback !== '' || revealedAnswer}
                  variant={userAnswer === option ? 'default' : 'secondary'}
                  className="text-xl min-w-[120px]"
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </ui.Button>
              ))}
            </div>
          ) : currentProblem.inputType === 'multi-text' && Array.isArray(currentProblem.question) ? (
            <MultiTextInput
              questionParts={currentProblem.question}
              onComplete={setUserAnswer}
              onCheck={onCheckAnswer}
              disabled={feedback !== '' || revealedAnswer}
            />
          ) : (
            <ui.Input
              ref={inputRef}
              type={currentProblem.inputType}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (feedback || revealedAnswer) {
                    handleNewProblem();
                  } else {
                    onCheckAnswer();
                  }
                }
              }}
              placeholder={currentProblem.placeholder || 'Your answer...'}
              data-tour="mathmog-answer-input"
              className="p-4 text-xl text-center h-14 focus-visible:ring-amber-500"
              disabled={feedback !== '' || revealedAnswer}
            />
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            {!feedback && !revealedAnswer ? (
              <ui.Button
                onClick={onCheckAnswer}
                disabled={userAnswer.trim() === '' || currentProblem.inputType === 'buttons'}
                data-tour="mathmog-check"
                className="flex-1 text-lg h-14 sm:h-11 px-8"
              >
                <Check className="w-5 h-5 mr-2" /> Check Answer
              </ui.Button>
            ) : (feedback || revealedAnswer) && !speedChallenge.isActive ? (
              <ui.Button
                onClick={() => handleNewProblem()}
                data-tour="mathmog-next"
                className="flex-1 text-lg bg-green-600 hover:bg-green-700 h-14 sm:h-11 px-8"
              >
                Next Problem <ArrowRight className="w-5 h-5 ml-2" />
              </ui.Button>
            ) : null}
          </div>

          {showRevealControls && !feedback && !revealedAnswer && (
            <div className="flex flex-row gap-2 justify-center mt-2">
              {/* h-11 sm:h-9 — 44px mobile hit target, matching the Learn
                  "Don't know?" precedent (2A.4 ui-glow-up cross-surface flag,
                  applied here as the 2D.3 rider). */}
              <ui.Button
                onClick={onShowMe}
                variant="ghost"
                size="sm"
                className="h-11 sm:h-9"
                data-tour="mathmog-show-me"
              >
                Show me
              </ui.Button>
              <ui.Button
                onClick={onSkip}
                variant="ghost"
                size="sm"
                className="h-11 sm:h-9"
                data-tour="mathmog-skip"
              >
                Skip
              </ui.Button>
            </div>
          )}
        </div>
        {revealedAnswer && !feedback && (
          <div className="mt-6 space-y-3 text-center">
            <ui.Alert>
              <ui.AlertTitle>Answer</ui.AlertTitle>
              <ui.AlertDescription className="text-left">
                <div className="font-medium">{formatProblemAnswer(currentProblem.answer)}</div>
                {currentProblem.explanation && (
                  <div className="mt-2">{currentProblem.explanation}</div>
                )}
              </ui.AlertDescription>
            </ui.Alert>
          </div>
        )}
        {feedback && !speedChallenge.isActive && (
          <div data-tour="mathmog-feedback" className="mt-6 space-y-3 text-center">
            {estimationTier && estimationTier !== 'outside' ? (
              // Tiered estimation feedback — all within 10% count as correct
              <div className="text-lg font-semibold text-green-600">
                {estimationTier === 'exact' && (
                  <>
                    <span className="text-2xl">🎯🤯</span> You are, in fact, psychic
                    <br />
                    <span className="text-base font-medium">Exactly correct</span>
                  </>
                )}
                {estimationTier === 'within2' && (
                  <>
                    <span className="text-2xl">🔮👁️</span> Are you psychic?
                    <br />
                    <span className="text-base font-medium">Within 2% of the exact answer</span>
                  </>
                )}
                {estimationTier === 'within5' && (
                  <>
                    <span className="text-2xl">👀</span> You are SO close
                    <br />
                    <span className="text-base font-medium">Within 5% of the exact answer</span>
                  </>
                )}
                {estimationTier === 'within10' && (
                  <>
                    <span className="text-2xl">😮</span> Not bad!
                    <br />
                    <span className="text-base font-medium">Within 10% of the exact answer</span>
                  </>
                )}
              </div>
            ) : estimationTier === 'outside' && feedback === 'correct' ? (
              // Outside the 10% display band but still within the problem's
              // wider tolerance (e.g. 20% for multiplication estimation,
              // 25% for fraction estimation). Acknowledge correctness while
              // nudging toward tighter estimates.
              <div className="text-lg font-semibold text-green-600">
                <span className="text-2xl">✅</span> Correct!
                <br />
                <span className="text-base font-medium">
                  Your estimate was{' '}
                  {estimationDeviation !== null
                    ? `${estimationDeviation.toFixed(1)}%`
                    : 'more than 10%'}{' '}
                  off — keep pushing to land inside 10%
                </span>
              </div>
            ) : estimationTier === 'outside' ? (
              // Estimation answer outside 10% AND outside the problem's
              // tolerance — warm/constructive.
              <div className="text-lg font-semibold text-amber-600 dark:text-amber-500">
                <span className="text-2xl">💪</span> Keep at it!
                <br />
                <span className="text-base font-medium">
                  Your estimate was{' '}
                  {estimationDeviation !== null
                    ? `${estimationDeviation.toFixed(1)}%`
                    : 'more than 10%'}{' '}
                  off — try to get within 10%
                </span>
              </div>
            ) : (
              // Non-estimation feedback (standard correct/incorrect)
              <div
                className={`text-lg font-semibold ${
                  feedback === 'correct'
                    ? 'text-green-600'
                    : 'text-amber-600 dark:text-amber-500'
                }`}
              >
                {feedback === 'correct' ? (
                  <>
                    ✅ Correct!
                    {/* 2D.3 correct-but-enriched postscript — one muted line,
                        non-canonical accepted members of repeating fractions
                        only. Never renders in speed (this whole feedback
                        block is speed-suppressed). Not italic: the digits
                        are the payload. */}
                    {correctEnrichment && (
                      <span className="block text-sm font-normal text-muted-foreground mt-1 max-w-md mx-auto">
                        {correctEnrichment}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-2xl">💪</span> Not quite!
                    {/* 2D.3 error-identity line — `diagnoseMiss` verbatim
                        (echoes the typed answer by construction; states a
                        fact about the number, never intent). Null renders
                        nothing extra: verdict + explanation, as before.
                        text-foreground, NOT verdict amber: amber-600 at this
                        size fails AA, and amber is the verdict channel while
                        this line is the teaching channel (reviewer R4). */}
                    {missDiagnosis && (
                      <span className="block text-base font-medium text-foreground mt-1 max-w-md mx-auto">
                        {missDiagnosis.message}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
            {showAnswer && (
              <ui.Alert
                variant={
                  estimationTier === 'outside'
                    ? 'default'
                    : feedback === 'correct'
                    ? 'default'
                    : 'destructive'
                }
                className="text-left"
              >
                <ui.AlertTitle>Explanation</ui.AlertTitle>
                <ui.AlertDescription>{currentProblem.explanation}</ui.AlertDescription>
              </ui.Alert>
            )}
          </div>
        )}
        {!hideLevelUpDialog && <LevelUpDialog suppressInHomework={isHomeworkMode} />}
      </ui.CardContent>
    </ui.Card>
  );
}
