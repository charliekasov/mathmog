"use client";

import { createContext, useState, useCallback, useContext, useRef, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import { generateProblem, simplifyFraction, isFaithfulFractionTranscription } from '../../core/math-problems';
import { getTopicInfo, topicHasDifficulty } from '../../core/drill-topics';
import { diagnoseMiss, fractionEnrichmentPostscript } from '../../core/diagnosis';
import type { MissDiagnosis } from '../../core/diagnosis';
import type { Difficulty, Problem, AdaptiveData, PendingLevelUp } from '../../core/types';
import type { MissedMathmogProblem, MissedMathmogProblemKind } from '../../core/miss-types';

// Phase 1.4: derive the default Scope id for a topic when none is provided.
// Convention (from Phase 1.1's registry shape): the first entry of each
// topic's `scopes` array is the `<prefix>_full` "everything" scope. Falling
// back to `scopes[0]` keeps the helper resilient if a future scope set ever
// drops the trailing `_full` suffix. Returns undefined for topics with no
// scopes — the trainer state in that case is "no scope" (full topic range
// is the only path).
function defaultScopeForTopic(topicId: string | undefined): string | undefined {
  if (!topicId) return undefined;
  const info = getTopicInfo(topicId);
  if (!info?.scopes || info.scopes.length === 0) return undefined;
  const fullScope = info.scopes.find((s) => s.id.endsWith('_full'));
  return fullScope?.id ?? info.scopes[0].id;
}

function formatProblemPrompt(question: Problem['question']): string {
  return Array.isArray(question) ? question.join(' ___ ') : String(question);
}

function formatProblemAnswer(answer: Problem['answer']): string {
  if (Array.isArray(answer)) return answer.map((a) => String(a)).join(' or ');
  return String(answer);
}

// Tiered feedback for estimation problems.
// NOTE: Currently all tiers within 10% count as correct for scoring.
// Future build-out: experiment with restricting which tiers count as correct
// to create harder drills (e.g., only ≤5% or ≤2% counts as correct).
export type EstimationTier = 'exact' | 'within2' | 'within5' | 'within10' | 'outside' | null;

interface ProblemContextValue {
  currentLevel: number;
  currentDifficulty: Difficulty;
  currentTopic: string | undefined;
  // Phase 1.4: optional narrowing of the current topic's generator pool.
  // Defaults to `<prefix>_full` on topic selection when the topic has
  // scopes; `undefined` when the topic has no scopes (no `scopes` field
  // on its registry entry). See `defaultScopeForTopic` for the resolution
  // rule. Threaded into `generateProblem(..., topic, scope)`.
  currentScope: string | undefined;
  currentProblem: Problem | null;
  userAnswer: string;
  setUserAnswer: Dispatch<SetStateAction<string>>;
  feedback: string;
  estimationTier: EstimationTier;
  estimationDeviation: number | null;
  // Phase 2D.3 feedback intelligence. Both are computed once at check time
  // from the problem's stamped `fact` (null when the problem carries none —
  // estimation problems, Level-2/3 types, percent-direction conversions):
  // - `missDiagnosis`: the error-identity line for an incorrect answer
  //   (`diagnoseMiss`); null = generic re-teach, render nothing extra.
  // - `correctEnrichment`: the correct-but-enriched postscript for a
  //   non-canonical accepted member of a repeating fraction's family.
  // Rendering is untimed-only — the speed feedback block shows nothing new
  // mid-drill; speed diagnosis reaches the student via the captured
  // `diagnosisMessage` on the miss record in misses-review.
  missDiagnosis: MissDiagnosis | null;
  correctEnrichment: string | null;
  score: { correct: number; total: number };
  showAnswer: boolean;
  adaptiveData: AdaptiveData;
  problemHistory: string[];
  missedProblems: MissedMathmogProblem[];
  handleCheckAnswer: (answerToCheck: string) => void;
  handleNewProblem: (level?: number, difficulty?: Difficulty, topic?: string, scope?: string) => void;
  handleLevelDifficultyChange: (level: number, difficulty: Difficulty, topic?: string, scope?: string) => void;
  handleReset: () => void;
  handleLevelUp: (accept: boolean) => void;
  // Marks the current streak as "tainted" — set to false by callers that
  // consume scaffolding (Show me / Skip / Reference open). One-way ratchet:
  // does NOT reset `consecutiveCorrect`. The streak boundary resets
  // (`streakPure: true`) only happen at the 5 enumerated sites where
  // `consecutiveCorrect` itself resets.
  taintStreak: () => void;
}

const ProblemContext = createContext<ProblemContextValue | undefined>(undefined);

const HISTORY_LIMIT = 50;

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Easy');
  const [currentTopic, setCurrentTopic] = useState<string | undefined>(undefined);
  const [currentScope, setCurrentScope] = useState<string | undefined>(undefined);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [estimationTier, setEstimationTier] = useState<EstimationTier>(null);
  const [estimationDeviation, setEstimationDeviation] = useState<number | null>(null);
  const [missDiagnosis, setMissDiagnosis] = useState<MissDiagnosis | null>(null);
  const [correctEnrichment, setCorrectEnrichment] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showAnswer, setShowAnswer] = useState(false);
  const [problemHistory, setProblemHistory] = useState<string[]>([]);
  const [missedProblems, setMissedProblems] = useState<MissedMathmogProblem[]>([]);
  const [adaptiveData, setAdaptiveData] = useState<AdaptiveData>({
    consecutiveCorrect: 0,
    currentAdaptiveLevel: null,
    pendingLevelUp: null,
    streakPure: true,
  });

  // Use ref to avoid dependency issues
  const problemHistoryRef = useRef<string[]>([]);
  const currentTopicRef = useRef<string | undefined>(undefined);
  const currentScopeRef = useRef<string | undefined>(undefined);

  // Keep refs in sync
  problemHistoryRef.current = problemHistory;
  currentTopicRef.current = currentTopic;
  currentScopeRef.current = currentScope;

  const handleNewProblem = useCallback((level?: number, difficulty?: Difficulty, topic?: string, scope?: string) => {
    const targetLevel = level ?? currentLevel;
    const targetDifficulty = difficulty ?? currentDifficulty;
    const targetTopic = topic !== undefined ? topic : currentTopicRef.current;
    const targetScope = scope !== undefined ? scope : currentScopeRef.current;

    try {
      const newProblem = generateProblem(targetLevel, targetDifficulty, problemHistoryRef.current, targetTopic, targetScope);
      setCurrentProblem(newProblem);
      setUserAnswer('');
      setFeedback('');
      setEstimationTier(null);
      setEstimationDeviation(null);
      setMissDiagnosis(null);
      setCorrectEnrichment(null);
      setShowAnswer(false);

      setProblemHistory(prev => {
        const newHistory = [...prev, newProblem.question.toString()];
        if (newHistory.length > HISTORY_LIMIT) {
          return newHistory.slice(newHistory.length - HISTORY_LIMIT);
        }
        return newHistory;
      });
    } catch (error) {
      // Catch policy (A.1 #2 sister, sub-chat 6 of Phase 0.6): soft
      // fallback with loud structured telemetry. The previously rendered
      // problem stays on screen (we leave `currentProblem` and
      // `problemHistory` untouched — companion test pins that contract),
      // and the four UI flags reset to the happy-path defaults so stale
      // feedback can't show next to the surviving problem. The orchestrator
      // does not install error boundaries; the package owns this fallback.
      // The structured context (`{ error, targetLevel, targetDifficulty,
      // targetTopic }`) gives production debug a self-contained record of
      // what generator call faulted.
      console.error("ProblemProvider.handleNewProblem: generator threw, keeping previous problem", { error, targetLevel, targetDifficulty, targetTopic, targetScope });
      setUserAnswer('');
      setFeedback('');
      setEstimationTier(null);
      setEstimationDeviation(null);
      setMissDiagnosis(null);
      setCorrectEnrichment(null);
      setShowAnswer(false);
    }
  }, [currentLevel, currentDifficulty]); // Removed problemHistory from deps

  const handleCheckAnswer = useCallback((answerToCheck: string) => {
    if (!currentProblem) return;

    const userAnswerTrimmed = answerToCheck.trim().toLowerCase();
    let isCorrect = false;
    let deviationPercent: number | undefined;
    let validationKind: MissedMathmogProblemKind = 'default';
    let correctAnswerNumeric: number | undefined;

    if (currentProblem.type === 'Root Estimation') {
      validationKind = 'root-estimation';
      const answerParts = userAnswerTrimmed.split(',').map(s => s.trim());
      const correctParts = String(currentProblem.answer).split(',').map(s => s.trim().toLowerCase());
      if (answerParts.length === correctParts.length && answerParts.length >= 3) {
        // "Between X and Y" — either order is valid
        const userBetween = [answerParts[0], answerParts[1]].sort();
        const correctBetween = [correctParts[0], correctParts[1]].sort();
        const betweenMatch = userBetween[0] === correctBetween[0] && userBetween[1] === correctBetween[1];
        // "Closer to" must match exactly
        isCorrect = betweenMatch && answerParts[2] === correctParts[2];
      }
    } else if (currentProblem.inputType === 'text' && typeof currentProblem.answer === 'string' && currentProblem.answer.includes('/')) {
      validationKind = 'fraction';
      try {
        const parts = userAnswerTrimmed.split('/');
        if (parts.length === 2) {
          const num = parseInt(parts[0].trim(), 10);
          const den = parseInt(parts[1].trim(), 10);
          if (!isNaN(num) && !isNaN(den) && den !== 0) {
            const simplifiedUserAnswer = simplifyFraction(num, den);
            isCorrect = simplifiedUserAnswer === currentProblem.answer;
          }
        }
      } catch (e) {
        isCorrect = false;
      }
    } else if (currentProblem.type.includes('Estimation')) {
      validationKind = 'estimation';
      const userNum = parseFloat(userAnswerTrimmed);
      if (!isNaN(userNum)) {
        const exactAnswer = currentProblem.answer as number;
        correctAnswerNumeric = exactAnswer;
        const deviation = exactAnswer === 0 ? Math.abs(userNum) : Math.abs((userNum - exactAnswer) / exactAnswer);
        deviationPercent = Math.round(deviation * 1000) / 10; // e.g. 7.3%
        setEstimationDeviation(deviationPercent);

        if (deviation < 0.001) {
          setEstimationTier('exact');
        } else if (deviation <= 0.02) {
          setEstimationTier('within2');
        } else if (deviation <= 0.05) {
          setEstimationTier('within5');
        } else if (deviation <= 0.10) {
          setEstimationTier('within10');
        } else {
          setEstimationTier('outside');
        }

        // Correctness gate: prefer the problem's per-instance tolerance if
        // it's set (multiplication/percentage estimation = 0.20, fraction
        // estimation = 0.25), fall back to 10%. The display tiers above are
        // fixed at 0/2/5/10% — they describe estimate quality, not
        // correctness — so 'outside' can be correct when tolerance > 0.10.
        isCorrect = deviation <= (currentProblem.tolerance ?? 0.10);
      }
    } else if (currentProblem.inputType === 'multi-text') {
      validationKind = 'multi-text';
      const possibleAnswers = Array.isArray(currentProblem.answer)
        ? currentProblem.answer.map(a => String(a).toLowerCase())
        : [String(currentProblem.answer).toLowerCase()];
      isCorrect = possibleAnswers.includes(userAnswerTrimmed);
    } else if (currentProblem.inputType === 'number') {
      validationKind = 'number';
      // Capture the numeric form only when the live answer is a scalar — array
      // answers (repeating decimals) don't have a single canonical number.
      if (!Array.isArray(currentProblem.answer)) {
        const candidate = typeof currentProblem.answer === 'number'
          ? currentProblem.answer
          : parseFloat(String(currentProblem.answer));
        if (!isNaN(candidate)) correctAnswerNumeric = candidate;
      }
      // For number inputs, compare numerically to handle cases like ".2" vs "0.2"
      const userNum = parseFloat(userAnswerTrimmed);
      if (!isNaN(userNum)) {
        // Handle array of acceptable answers (for repeating decimals like 1/3, 1/6).
        // CONTRACT (Phase 0.6 sub-chat 7, A.3 #2): the validator does NOT truncate
        // the user's longer input to compare against a shorter author-supplied form.
        // Authors of repeating-decimal problems must enumerate the decimal-length
        // variants they want to accept; registry coverage is enforced by
        // `tests/core/math-problems.test.ts` "Repeating-denominator registry coverage".
        // Conservative on purpose — a precision-aware validator can't separate
        // precision-error from conceptual-correctness without seeing the underlying
        // fraction (e.g. 0.1668 shares 3 decimals with 1/6's 0.166 form but is wrong
        // at the 4th place). See HANDOFF-mathmog-redesign-phase-0-6-g.md for the
        // weighed alternative ("any-length truncation acceptance") and why it was
        // ruled out.
        if (Array.isArray(currentProblem.answer)) {
          isCorrect = currentProblem.answer.some(acceptableAnswer => {
            const correctNum = typeof acceptableAnswer === 'number'
              ? acceptableAnswer
              : parseFloat(String(acceptableAnswer));
            return !isNaN(correctNum) && Math.abs(userNum - correctNum) < 0.0001;
          });
          // 2D.3 over-precision unification (Charlie-ratified 2026-06-11):
          // beyond the displayed family, any faithful truncation/rounding of
          // the true value at the typed precision grades correct — 0.3333
          // for 1/3 — via the SAME core helper Learn's `gradeLearnRecall`
          // consumes. Grader-side by design: the family arrays, the 2D.1
          // policy table, and the explanation strings are untouched.
          if (!isCorrect && currentProblem.fact?.topic === 'fraction_conversions') {
            isCorrect = isFaithfulFractionTranscription(
              currentProblem.fact.itemId,
              userAnswerTrimmed,
              currentProblem.fact.percentShift ? 'percent' : 'decimal'
            );
          }
        } else {
          const correctNum = typeof currentProblem.answer === 'number'
            ? currentProblem.answer
            : parseFloat(String(currentProblem.answer));
          if (!isNaN(correctNum)) {
            // Use small tolerance for floating point comparison
            isCorrect = Math.abs(userNum - correctNum) < 0.0001;
          }
        }
      } else {
        isCorrect = userAnswerTrimmed === String(currentProblem.answer).toLowerCase();
      }
    } else {
      validationKind = 'default';
      isCorrect = userAnswerTrimmed === String(currentProblem.answer).toLowerCase();
    }

    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setShowAnswer(true);

    // 2D.3 feedback intelligence — both lookups are pure and run once at
    // check time. Percent-direction problems (fracToPerc) are deliberately
    // skipped: the decimal-space diagnosers don't apply, and the chat-owned
    // decision punted them to the generic re-teach (the explanation string
    // already carries the full story).
    const fact = currentProblem.fact;
    let diagnosis: MissDiagnosis | null = null;
    let enrichment: string | null = null;
    if (fact && !fact.percentShift) {
      if (isCorrect && fact.topic === 'fraction_conversions') {
        enrichment = fractionEnrichmentPostscript(fact.itemId, userAnswerTrimmed);
      } else if (!isCorrect) {
        const wrongValue = Number(userAnswerTrimmed);
        if (userAnswerTrimmed !== '' && Number.isFinite(wrongValue)) {
          diagnosis = diagnoseMiss(fact.topic, fact.itemId, wrongValue);
        }
      }
    }
    setMissDiagnosis(diagnosis);
    setCorrectEnrichment(enrichment);

    if (!isCorrect) {
      setMissedProblems(prev => [
        ...prev,
        {
          prompt: formatProblemPrompt(currentProblem.question),
          correctAnswer: formatProblemAnswer(currentProblem.answer),
          studentAnswer: answerToCheck.trim(),
          validationKind,
          ...(deviationPercent !== undefined ? { deviationPercent } : {}),
          ...(correctAnswerNumeric !== undefined ? { correctAnswerNumeric } : {}),
          ...(currentProblem.explanation ? { explanation: currentProblem.explanation } : {}),
          // 2D.3: identity line resolved at CAPTURE time — the record can't
          // re-derive it later (no fact id stored). Misses-review renders
          // `diagnosisMessage` between "You said:" and the retry box; the
          // code is the deferred tutor-telemetry anchor.
          ...(diagnosis ? { diagnosisMessage: diagnosis.message, diagnosisCode: diagnosis.code } : {}),
        },
      ]);
    }

    if (isCorrect) {
      setAdaptiveData(prev => {
        const newConsecutiveCorrect = prev.consecutiveCorrect + 1;

        if (newConsecutiveCorrect >= 7 && !prev.pendingLevelUp) {
          let levelUpData: PendingLevelUp | null = null;

          // Difficulty escalation only applies where a difficulty axis
          // exists — the SAME predicate the config selector uses to show or
          // hide the difficulty control (`!topic || topicHasDifficulty(topic)`).
          // Memorize topics (times_tables, perfect_squares, …) are
          // hasDifficulty:false, so offering "Ready for hard?" on them is
          // incoherent (there is no harder variant). Read via the ref to
          // avoid a stale closure, matching handleNewProblem above.
          const levelTopic = currentTopicRef.current;
          const difficultyApplies = !levelTopic || topicHasDifficulty(levelTopic);

          if (difficultyApplies && currentDifficulty === 'Easy') {
            levelUpData = {
              action: 'changeDifficulty',
              from: 'Easy',
              to: 'Medium',
              emojis: '😋🪏🍳🥞',
              title: "We're all out of easy problems because",
              allCapsTitle: 'YOU JUST ATE THEM FOR BREAKFAST',
              subtitle: "Ready for medium?",
              options: { yes: "sounds delicious", no: "nah I'm good" }
            };
          } else if (difficultyApplies && currentDifficulty === 'Medium') {
            levelUpData = {
              action: 'changeDifficulty',
              from: 'Medium',
              to: 'Hard',
              emojis: '💪💃🌋',
              title: "This medium world cannot contain you",
              subtitle: "Ready for hard?",
              options: { yes: "Let's ride", no: "This is my safe space" }
            };
          } else if (difficultyApplies && currentDifficulty === 'Hard') {
            levelUpData = {
              action: 'trySpeedChallenge',
              emojis: '🧠🦵🦵🥱',
              title: 'Do your legs hurt from carrying that GIANT BRAIN all day???',
              subtitle: 'Try a speed challenge?',
              options: { yes: 'Feed my speed need', no: 'Lemme practice more (I\'m so scared)' }
            };
          }

          // Only consume the streak when a level-up actually fires. On a
          // no-difficulty topic there is nothing to escalate to, so keep
          // counting silently (no dialog) rather than resetting every 7.
          if (levelUpData !== null) {
            // PRESERVE the prev streakPure value — the trainer's Free Play
            // suppression effect reads it at this moment to decide whether
            // to silently decline. handleLevelUp(accept|decline) is the
            // canonical re-purify site for the streak that follows.
            return {
              ...prev,
              consecutiveCorrect: 0,
              pendingLevelUp: levelUpData,
            };
          }
        }

        return { ...prev, consecutiveCorrect: newConsecutiveCorrect };
      });
    } else {
      // Streak boundary on incorrect — restart pure.
      setAdaptiveData(prev => ({ ...prev, consecutiveCorrect: 0, streakPure: true }));
    }
  }, [currentProblem, currentDifficulty]);

  const handleLevelDifficultyChange = useCallback((level: number, difficulty: Difficulty, topic?: string, scope?: string) => {
    setCurrentLevel(level);
    setCurrentDifficulty(difficulty);
    setCurrentTopic(topic);
    // Phase 1.4: resolve the scope alongside the topic. Explicit scope wins;
    // otherwise default to <prefix>_full when the topic has scopes; otherwise
    // undefined (topic has no scopes — generator ignores any prior scope).
    // Keep refs in sync immediately so handleNewProblem reads the resolved
    // value rather than the previous render's stale ref.
    const resolvedScope = scope !== undefined ? scope : defaultScopeForTopic(topic);
    setCurrentScope(resolvedScope);
    currentScopeRef.current = resolvedScope;
    setProblemHistory([]);
    setAdaptiveData({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true,
    });
    setScore({ correct: 0, total: 0 });
    setMissedProblems([]);
    handleNewProblem(level, difficulty, topic, resolvedScope);
  }, [handleNewProblem]);

  const handleReset = useCallback(() => {
    setScore({ correct: 0, total: 0 });
    setFeedback('');
    setEstimationTier(null);
    setEstimationDeviation(null);
    setMissDiagnosis(null);
    setCorrectEnrichment(null);
    setShowAnswer(false);
    setAdaptiveData({
      consecutiveCorrect: 0,
      currentAdaptiveLevel: null,
      pendingLevelUp: null,
      streakPure: true,
    });
    setMissedProblems([]);
    handleNewProblem();
  }, [handleNewProblem]);

  const handleLevelUp = useCallback((accept: boolean) => {
    if (!adaptiveData.pendingLevelUp) return;

    if (accept) {
      if (adaptiveData.pendingLevelUp.action === 'changeDifficulty' && adaptiveData.pendingLevelUp.to) {
        handleLevelDifficultyChange(currentLevel, adaptiveData.pendingLevelUp.to, currentTopic, currentScope);
      }
    }

    // Streak boundary on accept-or-decline — re-purify.
    setAdaptiveData(prev => ({ ...prev, pendingLevelUp: null, consecutiveCorrect: 0, streakPure: true }));
  }, [adaptiveData.pendingLevelUp, currentLevel, currentTopic, currentScope, handleLevelDifficultyChange]);

  // One-way ratchet within a streak. Safe to call any time — when
  // consecutiveCorrect is already 0 this is a no-op (next reset site will
  // re-set streakPure: true anyway). Uses the functional setState pattern
  // so it doesn't need to close over the latest adaptiveData.
  const taintStreak = useCallback(() => {
    setAdaptiveData(prev => (prev.streakPure ? { ...prev, streakPure: false } : prev));
  }, []);

  const value = {
    currentLevel,
    currentDifficulty,
    currentTopic,
    currentScope,
    currentProblem,
    userAnswer,
    setUserAnswer,
    feedback,
    estimationTier,
    estimationDeviation,
    missDiagnosis,
    correctEnrichment,
    score,
    showAnswer,
    adaptiveData,
    problemHistory,
    missedProblems,
    handleCheckAnswer,
    handleNewProblem,
    handleLevelDifficultyChange,
    handleReset,
    handleLevelUp,
    taintStreak,
  };

  return <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>;
}

export function useProblem() {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblem must be used within a ProblemProvider');
  }
  return context;
}

export type { ProblemContextValue };
